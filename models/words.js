const { createClient } = require("@astrajs/collections");

let astraClient = null;

const getAstraClient = async () => {
  if (astraClient === null) {
    astraClient = await createClient(
      {
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
      },
      30000
    );
  }
  // console.log(process.env.ASTRA_DB_ID)
  return astraClient;
};

const getSignsCollection = async () => {
  const documentClient = await getAstraClient();
  return documentClient
    .namespace(process.env.ASTRA_DB_KEYSPACE)
    .collection("words");
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  addSign: async (sign) => {
    const signs = await getSignsCollection();
    await signs.create({
      wordLink: sign.link,
    });
  },
  getSignsCollection: async () => {
    return await getSignsCollection();
  },

  getSign: async () => {
    const signs = await getSignsCollection();
    try {
      const res = await signs.find();
      return Object.keys(res).map((itemId) => ({
        id: itemId,
        link: res[itemId].wordLink,
    }));
    } catch (e) {
      return [];
    }
  },

  deleteSign: async () => {
    await getAstraClient();
    astraClient.restClient.delete(
      `/api/rest/v2/schemas/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/tables/words`
    );
    await sleep(2000);
  },
};