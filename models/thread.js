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

const getThreadsCollection = async () => {
  const documentClient = await getAstraClient();
  return documentClient
    .namespace(process.env.ASTRA_DB_KEYSPACE)
    .collection("thread");
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  addThread: async (thread) => {
    const threads = await getThreadsCollection();
    await threads.create({
      author:thread.author,
      title:thread.title,
      description: thread.description,
      comments:[]
    });
    console.log("created");
  },
  addComment: async(title, comment) => {
    const threads = await getThreadsCollection();

    try{
      console.log("in update");
      const tthread = await threads.find({title:{$eq:title}});
      const docid = (Object.keys(tthread)[0]);
      
      let thread = await threads.findOne({title:{$eq:title}});
      let arr = thread.comments;
      arr.push(comment);
    //   console.log(arr);
        // console.log(tthread);
        return await threads.update(docid, {
          comments: arr
        })
      
      
    }catch(e){
      console.log("not updated");
      return {};
    }
  },
  getThreadsCollection: async () => {
    return await getThreadsCollection();
  },

  getThreads: async () => {
    const webs = await getThreadsCollection();
    try {
      const res = await webs.find();
      return Object.keys(res).map((itemId) => ({
        author:res[itemId].author,
        title:res[itemId].title,
        description: res[itemId].description,
        comments: res[itemId].comments
      }));
    } catch (e) {
      return [];
    }
  },
  getThreadByTitle: async(title) =>{
    const threads = await getThreadsCollection();
    try {
      // console.log(name);
      const sample =  await threads.findOne({title:{$eq:title}});
      // console.log(sample);
      return sample;
    } catch (e) {
      return [];
    }
  },
  deleteThreads: async () => {
    await getAstraClient();
    astraClient.restClient.delete(
      `/api/rest/v2/schemas/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/tables/thread`
    );
    await sleep(2000);
  },
};