const ApiError = require("@/utils/ApiError");
const {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE,
} = require("@/utils/validators");
const { StatusCodes } = require("http-status-codes");
const multer = require("multer");

// Hầu hết code ở dưới là có trong docs chỉ là đã qua tổ chức lại cho khoa học và gọn gàng
// https://www.npmjs.com/package/multer
const customFileFilter = (req, file, callback) => {
  // Kiểm tra loại file có được cho phép không
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = "File type is invalid. Only accept jpg, jpeg and png";
    return callback(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage),
      null
    );
  }

  // Nếu hợp lệ thì cho phép upload
  return callback(null, true);
};

const upload = multer({
  limits: {
    fileSize: LIMIT_COMMON_FILE_SIZE,
  },
  fileFilter: customFileFilter,
});

module.exports = {
  multerUploadMiddlewares: {
    upload,
  },
};
