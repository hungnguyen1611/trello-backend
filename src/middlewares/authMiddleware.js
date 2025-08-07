const { env } = require("@/configs/environment");
const { JwtProvider } = require("@/provider/JwtProvider");
const ApiError = require("@/utils/ApiError");
const { StatusCodes } = require("http-status-codes");

// Miđle ware này rất quan trọng: Xác thực JWT accessToken có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  // Lấy access token nằm trong request cookie phía client - withcredentials trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken;

  // Nếu clientAccessToken ko tồn tại thì trả về lỗi luôn
  if (!clientAccessToken) {
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, "unauthorized (token not fond)!")
    );
    return;
  }
  try {
    // Thực hiện giải mã Token xem nó có hợp lệ hay không

    const acessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    );
    // console.log("🚀 ~ isAuthorized ~ acessTokenDecoded:", acessTokenDecoded);

    // Nếu như cái token hợp lệ thì cần phải lưu thông tin giải mã vào cái req
    req.jwtDecoded = acessTokenDecoded;

    // Cho phép cái request đi tiếp
    next();
  } catch (error) {
    // Nếu access Token hết hạn thì trả về mã lỗi cho FE để FE gọi api refresh Token

    if (error?.message.includes("jwt expired")) {
      next(new ApiError(StatusCodes.GONE, "Need refresh token!"));
      return;
    }
    // Nếu access Token ngoài việc hêt hạn thì ta cứ trả về thẳng tay lỗi 401 cho FE sign out luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, "unauthorized"));
  }
};

module.exports = {
  authMiddleware: {
    isAuthorized,
  },
};
