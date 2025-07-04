const {
  MongoClient,
  ServerApiVersion
} = require("mongodb");
const {
  env
} = require("./environment");
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});
let trelloDB = null;
const CONNECT_DB = async () => {
  try {
    await mongoClientInstance.connect();
    trelloDB = mongoClientInstance.db(env.DATABASE_NAME);
    console.log("✅ CONNECT_DB: Kết nối MongoDB thành công!");
  } catch (error) {
    throw new Error("❌ CONNECT_DB ERROR: " + error);
  }
};
const GET_DB = () => {
  if (!trelloDB) {
    // gọi lại 1 lần ở đây để nhận được db vì khi đẩy lên production(render) trelloDB sẽ bị null
    const DB = mongoClientInstance.db(env.DATABASE_NAME);
    if (!DB) throw new Error(`Must connect to Mongo first!`);
    return DB;
  }
  return trelloDB;
};
const CLOSE_DB = async () => {
  console.log("4 Disconnecting from Mongo cloud Atlas !");
  await mongoClientInstance.close();
};
module.exports = {
  CONNECT_DB,
  GET_DB,
  CLOSE_DB
};