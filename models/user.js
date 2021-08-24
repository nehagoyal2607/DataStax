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

const getUsersCollection = async () => {
  const documentClient = await getAstraClient();
  return documentClient
    .namespace(process.env.ASTRA_DB_KEYSPACE)
    .collection("users");
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  addUser: async (user) => {
    const users = await getUsersCollection();
    await users.create({
      username: user.name,
      password: user.password
    });
  },
  getUsersCollection: async () => {
    return await getUsersCollection();
  },

  getUsers: async () => {
    const users = await getUsersCollection();
    try {
      const res = await users.find();
      return Object.keys(res).map((itemId) => ({
        id: itemId,
        username: res[itemId].username,
        password: res[itemId].password
      }));
    } catch (e) {
      return [];
    }
  },

  deleteUser: async () => {
    await getAstraClient();
    astraClient.restClient.delete(
      `/api/rest/v2/schemas/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/tables/users`
    );
    await sleep(2000);
  },
};