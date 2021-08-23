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
  return astraClient;
};

const getColorsCollection = async () => {
  const documentClient = await getAstraClient();
  return documentClient
    .namespace(process.env.ASTRA_DB_KEYSPACE)
    .collection("sign");
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  addColorHistory: async (color) => {
    const colors = await getColorsCollection();
    await colors.create({
      colorName: color.alphabet,
      colorValue: color.alpImg,
      timestamp: Date.now(),
    });
  },
  getColorsCollection: async () => {
    return await getColorsCollection();
  },

  getColorHistory: async () => {
    const colors = await getColorsCollection();
    try {
      const res = await colors.find();
      return Object.keys(res).map((itemId) => ({
        id: itemId,
        alphabet: res[itemId].colorName,
        alpImg: res[itemId].colorValue,
        timestamp: new Date(res[itemId].timestamp).toString(),
      }));
    } catch (e) {
      return [];
    }
  },

  deleteColorHistory: async () => {
    await getAstraClient();
    astraClient.restClient.delete(
      `/api/rest/v2/schemas/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/tables/sign`
    );
    await sleep(2000);
  },
};