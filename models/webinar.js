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

const getWebinarsCollection = async () => {
  const documentClient = await getAstraClient();
  return documentClient
    .namespace(process.env.ASTRA_DB_KEYSPACE)
    .collection("webinar");
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  addWebinar: async (webinar) => {
    const webs = await getWebinarsCollection();
    await webs.create({
      title:webinar.title,
      meetingId:webinar.meetingId,
      timings:webinar.timings,
      host:webinar.host,
      description: webinar.description
    });
    console.log("created");
  },
  getWebinarsCollection: async () => {
    return await getWebinarsCollection();
  },

  getWebinars: async () => {
    const webs = await getWebinarsCollection();
    try {
      const res = await webs.find();
      return Object.keys(res).map((itemId) => ({
        title:res[itemId].title,
        meetingId:res[itemId].meetingId,
        timings:res[itemId].timings,
        host:res[itemId].host,
        description: res[itemId].description
      }));
    } catch (e) {
      return [];
    }
  },

  deleteWebinars: async () => {
    await getAstraClient();
    astraClient.restClient.delete(
      `/api/rest/v2/schemas/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/tables/webinar`
    );
    await sleep(2000);
  },
};