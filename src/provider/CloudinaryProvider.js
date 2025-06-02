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

// Khởi tạo function để upload file lên cloudinary

const streamUpload = async (fileBuffer, folderName) => {
  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: folderName }, (error, uploadResult) => {
        if (error) {
          reject(error);
          return;
        }
        return resolve(uploadResult);
      })
      .end(fileBuffer);
  });

  return uploadResult;

  // Cách 2: Tạo thêm luồng stream để tái sử dụng (Khi có dự án có nhiều stream)
  //   return new Promise((resolve, reject) => {
  //     // Tạo luồng stream upload lên cloudinary
  //     const stream = cloudinary.uploader.upload_stream(
  //       { folder: folderName },
  //       (error, result) => {
  //         if (error) reject(error);
  //         else resolve(result);
  //       }
  //     );
  //     // Thực hiện upload cái luồn trên bằng lib streamifier
  //     streamifier.createReadStream(fileBuffer).pipe(stream);
  //   });
};

module.exports = {
  CloudinaryProvider: {
    streamUpload,
  },
};
