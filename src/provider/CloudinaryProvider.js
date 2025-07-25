const { env } = require("@/configs/environment");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

// Cấu hình cloudinary

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

// const streamUpload = async (fileBuffer, folderName) => {
//   const uploadResult = await new Promise((resolve, reject) => {

//     cloudinary.uploader
//       .upload_stream({ folder: folderName }, (error, uploadResult) => {
//         if (error) {
//           reject(error);
//           return;
//         }
//         return resolve(uploadResult);
//       })
//       .end(fileBuffer);
//   });

//   return uploadResult;

//   // Cách 2: Tạo thêm luồng stream để tái sử dụng (Khi có dự án có nhiều stream)
//   //   return new Promise((resolve, reject) => {
//   //     // Tạo luồng stream upload lên cloudinary
//   //     const stream = cloudinary.uploader.upload_stream(
//   //       { folder: folderName },
//   //       (error, result) => {
//   //         if (error) reject(error);
//   //         else resolve(result);
//   //       }
//   //     );
//   //     // Thực hiện upload cái luồn trên bằng lib streamifier
//   //     streamifier.createReadStream(fileBuffer).pipe(stream);
//   //   });
// };
// Khởi tạo function để upload file lên cloudinary

const streamUpload = async (fileBufferOrUrl, folderName) => {
  // Nếu là URL (string bắt đầu bằng http/https)
  if (
    typeof fileBufferOrUrl === "string" &&
    /^https?:\/\//.test(fileBufferOrUrl)
  ) {
    return await cloudinary.uploader.upload(fileBufferOrUrl, {
      folder: folderName,
    });
  }

  // Nếu là Buffer thì dùng stream
  if (Buffer.isBuffer(fileBufferOrUrl)) {
    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(fileBufferOrUrl).pipe(stream);
    });
  }

  // Nếu không đúng định dạng
  throw new Error("Invalid input image: must be a URL or Buffer");
};

module.exports = {
  CloudinaryProvider: {
    streamUpload,
  },
};
