// passwork

const { MongoClient, ServerApiVersion } = require("mongodb");
const { env } = require("./environment");

// t0MEeTPxw8RBEmII
// useName
// hungnguyen1611

// uritr

// mongodb+srv://hungnguyen1611:t0MEeTPxw8RBEmII@cluster0hungnguyen.grqzhii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0hungnguyen

const mongoClientInstance = new MongoClient(
  env.MONGODB_URI,

  {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrorsL: true,
    },
  }
);
// let trelloDB = null;

const trelloDB = {};

const CONNECT_DB = async () => {
  try {
    const connect = await mongoClientInstance.connect();
    console.log("🚀 ~ constCONNECT_DB= ~ connect:", connect);
    console.log("Đã connect mongo");

    trelloDB.data = mongoClientInstance.db(env.DATABASE_NAME);
    console.log("🚀 ~ constCONNECT_DB= ~ trelloDB.data:", trelloDB.data);
  } catch (error) {
    throw new Error(error);
  }
};

const GET_DB = () => {
  if (!trelloDB.data)
    throw new Error(`Must connect to Mongo first! trelloDB: ${trelloDB.data}`);

  return trelloDB.data;
};

const CLOSE_DB = async () => {
  console.log("4 Disconnecting from Mongo cloud Atlas ! ");
  await mongoClientInstance.close();
};

module.exports = {
  CONNECT_DB,
  GET_DB,
  CLOSE_DB,
};
