const { createClient } = require("@astrajs/collections");
const { v4: uuidv4} = require('uuid');
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
    const newUserId = await users.create({
      id: uuidv4(),
      username: user.username,
      password: user.password,
      score : 0,
      completed : new Array(26).fill(0)
    });
    const newu = await users.get(newUserId.documentId);
    // console.log(newu);
    return (newu);
  },
  getUsers: async () => {
    const users = await getUsersCollection();
    try {
      const res = await users.find();
      return Object.keys(res).map((itemId) => ({
        id: itemId,
        username: res[itemId].username,
        password: res[itemId].password,
        score: res[itemId].score,
        completed: res[itemId].completed
      }));
    } catch (e) {
      return [];
    }
  },
  getUserByName: async (name) => {
    const users = await getUsersCollection();
    try {
      // console.log(name);
      const sample =  await users.findOne({username:{$eq:name}});
      // console.log(sample);
      return sample;
    } catch (e) {
      return [];
    }
  },
  getUserById: async(id) => {
    const users = await getUsersCollection();
    try{
      const user = await users.findOne({id:{$eq:id}});
      return user;
    }catch(e){
      return {};
    }
  },
  updateScore: async (id, nscore, symb) => {
    const users = await getUsersCollection();

    try{
      console.log("in update");
      const listuser = await users.find({id:{$eq:id}});
      const docid = (Object.keys(listuser)[0]);
      
      let user = await users.findOne({id:{$eq:id}});
      let arr = user.completed;
      // console.log(arr);
      if(!arr[symb] || arr[symb] == 0){
        let newArr = new Array(26).fill(0)
        for(let i=0; i<26; i++){
          if(arr[i] == 1)
          newArr[i] = arr[i];
        }
        // console.log(newArr);
        newArr[symb] = 1
        // console.log(newArr);
        return await users.update(docid, {
          score: nscore,
          completed: newArr
        })
      }
      
    }catch(e){
      console.log("not updated");
      return {};
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