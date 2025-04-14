const express = require("express");
const { CONNECT_DB, GET_DB, CLOSE_DB } = require("./configs/mongodb");
const exitHook = require("async-exit-hook");
const { env } = require("./configs/environment");

const START_SERVER = () => {
  const app = express();

  // chỉ nên gọi GETDB trong start để đạm bảo đã connect succesed đến db
  app.get("/", async (req, res) => {
    const data = await GET_DB().listCollections().toArray();
    console.log(data);
    res.send(data);
  });

  app.listen(env.APP_PORT, env.APP_HOST, () =>
    console.log(
      `3 Hi ${process.env.AUTHOR} BackEnd is running successfully http://${env.APP_HOST}:${env.APP_PORT}`
    )
  );

  exitHook(() => {
    CLOSE_DB();
    ("5 Disconnected from Mongo cloud Atlas ");
  });
};

//  Chỉ khi kết nối đến database thành công thì mới start backend

(async () => {
  console.log("1. Connecting mongo cloud atlas");

  try {
    await CONNECT_DB();
    console.log("2. Connected to mongoDB cloud atlas!");
    START_SERVER();
  } catch (error) {
    console.error(error), process.exit(0);
  }
})();

//  Chỉ khi kết nối đến database thành công thì mới start backend
// console.log("1. Connecting mongo cloud atlas");
// CONNECT_DB()
//   .then(() => console.log("2. Connected to mongoDB cloud atlas!"))
//   .then(() => START_SERVER())
//   .catch((err) => {
//     console.error(err), process.exit(0);
//   });
