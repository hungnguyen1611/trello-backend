const ApiError = require("@/utils/ApiError");
const { WHITELIST_DOMAINS } = require("@/utils/constant");
const { StatusCodes } = require("http-status-codes");
const { env } = require("./environment");

const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép Postman hoặc server khác trong môi trường dev
    if (env.BUILD_MODE === "dev" && !origin) {
      return callback(null, true);
    }

    // Chỉ cho phép các domain được whitelist
    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true);
    }

    // Còn lại từ chối
    return callback(
      new ApiError(StatusCodes.FORBIDDEN, "Not allowed by our CORS policy")
    );
  },
  credentials: true, // ✅ viết đúng key
  optionsSuccessStatus: 200,
};
module.exports = {
  corsOptions,
};
