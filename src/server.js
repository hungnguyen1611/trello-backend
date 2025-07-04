require("module-alias/register");
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const { CONNECT_DB, CLOSE_DB } = require("./configs/mongodb");
const exitHook = require("async-exit-hook");
const { env } = require("./configs/environment");
const { APIs_V1 } = require("./routes/v1");
const {
  errorHandlingMiddleware,
} = require("./middlewares/ErrorsHandlingMiddlewares");
const { corsOptions } = require("./configs/cors");
const cookieParser = require("cookie-parser");

// Xử lí socket real-time với soket.io
const socketIo = require("socket.io");
const http = require("http");
const inviUserToBoardSocket = require("./socket/inviUserToBoardSocket");

const START_SERVER = () => {
  const app = express();

  // Tắt cache để tránh ExpressJS đọc dữ liệu từ disk cache
  // Tham khảo: https://stackoverflow.com/a/53240717/8324172
  // res.setHeader viết rõ ràng tương đương với res.set
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    // res.setHeader("Pragma", "no-cache"); hỗ trợ trình duyệt cũ (HTTP/1.0 dường như ko còn dùng)
    next();
  });

  app.use(cookieParser());
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

  const sslOptions = {
    key: fs.readFileSync("/path/to/key.pem"),
    cert: fs.readFileSync("/path/to/cert.pem"),
  };
  // Tạo một Sever mới bọc thằng app của express để làm real-time với socket.io
  const server = http.createServer(sslOptions, app);
  // Khởi tạo biến io với server và cors
  const io = socketIo(server, { cors: corsOptions });

  io.on("connection", (socket) => {
    // Gọi gác socket tùy theo tính năng ở đây
    inviUserToBoardSocket(socket);
  });

  if (env.BUILD_MODE === "production") {
    // process.env.PORT, PORT ở đây sau khi đây lên production sẽ có PORT của bên render cx có thể tự cấu hình
    const PORT = process.env.PORT || 5000;
    //  Dùng server.listen thay thế app.listen vì lúc này server đã bao gồm express app và đã config  socket.io
    server.listen(PORT, () => {
      console.log(
        `✅ BackEnd is running at Port ${PORT} — Hello ${
          process.env.AUTHOR || "Developer"
        }!`
      );
    });
  } else {
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () =>
      console.log(
        `3 Local: Hi ${process.env.AUTHOR} BackEnd is running successfully http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}`
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
