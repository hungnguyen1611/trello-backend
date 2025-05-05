require("module-alias/register");
const express = require("express");
const cors = require("cors");

const { CONNECT_DB, CLOSE_DB } = require("./configs/mongodb");
const exitHook = require("async-exit-hook");
const { env } = require("./configs/environment");
const { APIs_V1 } = require("./routes/v1");
const {
  errorHandlingMiddleware,
} = require("./middlewares/ErrorsHandlingMiddlewares");
const { corsOptions } = require("./configs/cors");

const START_SERVER = () => {
  const app = express();
  // Enable req.body json data
  app.use(express.json());
  //  Xử lí cors
  app.use(cors(corsOptions));

  // chỉ nên gọi GETDB trong start để đạm bảo đã connect succesed đến db
  // app.get("/", async (req, res) => {
  //   const data = await GET_DB().listCollections().toArray();
  //   console.log(data);
  //   res.send(data);
  // });

  app.use("/v1", APIs_V1);

  app.use(errorHandlingMiddleware);

  if (env.BUILD_MODE === "production") {
    app.listen(process.env.PORT, () => {
      console.log(
        `3 Production: Hi ${process.env.AUTHOR} BackEnd is running successfully at Port ${process.env.PORT}`
      );
    });
  } else {
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () =>
      console.log(
        `3 Local: Hi ${process.env.AUTHOR} BackEnd is running successfully http://${env.LOCAL_DEV_APP_PORT}:${env.LOCAL_DEV_APP_HOST}`
      )
    );
  }

  exitHook(() => {
    CLOSE_DB();
    ("5 Disconnected from Mongo cloud Atlas ");
  });
};

//  Chỉ khi kết nối đến database thành công thì mới start backend

// (async () => {
//   console.log("1. Connecting mongo cloud atlas");

//   try {
//     await CONNECT_DB();
//     console.log("2. Connected to mongoDB cloud atlas!");
//     START_SERVER();
//   } catch (error) {
//     console.error(error), process.exit(0);
//   }
// })();

(async () => {
  try {
    await CONNECT_DB(); // Kết nối DB trước

    console.log("✅ MongoDB connected successfully!");

    // Khởi động Express hoặc các phần khác sau khi kết nối DB xong
    START_SERVER();
  } catch (error) {
    console.error("❌ Cannot connect to MongoDB:", error);
    process.exit(1);
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
