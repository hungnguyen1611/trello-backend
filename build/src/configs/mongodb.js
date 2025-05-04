// passwork

const {
  MongoClient,
  ServerApiVersion
} = require("mongodb");
const {
  env
} = require("./environment");

// t0MEeTPxw8RBEmII
// useName
// hungnguyen1611

// uritr

// mongodb+srv://hungnguyen1611:t0MEeTPxw8RBEmII@cluster0hungnguyen.grqzhii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0hungnguyen

let trelloDB = null;
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrorsL: true
  }
});
const CONNECT_DB = async () => {
  await mongoClientInstance.connect();
  trelloDB = mongoClientInstance.db(env.DATABASE_NAME);
};
const GET_DB = () => {
  if (!trelloDB) throw new Error("Must connect to Mongo first!");
  return trelloDB;
};
const CLOSE_DB = async () => {
  console.log("4 Disconnecting from Mongo cloud Atlas ! ");
  await mongoClientInstance.close();
};
module.exports = {
  CONNECT_DB,
  GET_DB,
  CLOSE_DB
};