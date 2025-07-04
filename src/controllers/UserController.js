const { userService } = require("@/services/UserService");
const ApiError = require("@/utils/ApiError");
const { StatusCodes } = require("http-status-codes");
const ms = require("ms");

const createUser = async (req, res, next) => {
  try {
    const newUser = await userService.createUser(req.body);

    res.status(StatusCodes.CREATED).json(newUser);
  } catch (error) {
    next(error);
  }
};

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);

    // trả về http only cookie cho phía client
    // Đối với cookie thì thời gian sống chúng ta để tối đa 14 ngày
    //  tùy dự án. Lưu ý thởi gian sống của cookie khác với thời gian sống của Token
    //   Secure: chỉ gửi cookie qua HTTPS. ?
    // HttpOnly: không cho truy cập cookie từ JavaScript.
    // Path=/: cookie áp dụng cho toàn bộ website.
    // SameSite=Strict: chống tấn công CSRF.
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true, //phải sử dụng https nếu ko có thì trình duyệt sẽ ko gửi cookie lên
      sameSite: "none",
      maxAge: ms("14 days"),
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(StatusCodes.OK).json({ loggedOut: true });
  } catch (error) {
    next(error);
  }
};

const refresh_token = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(
      new ApiError(
        // đổi sang lỗi FORBIDEN để cho khác với mã lỗi UNAUTHORIZED (khi access token không có hoặc sai (ngoài việc hết hạn))
        StatusCodes.FORBIDDEN,
        "Please Sign in (Error from refresh token)"
      )
    );
  }
};

const update = async (req, res, next) => {
  try {
    const userAvatarFile = req.file;
    // console.log("🚀 ~ update ~ avatarFile:", avatarFile);
    const userId = req.jwtDecoded._id;
    const updatedUser = await userService.update(
      userId,
      req.body,
      userAvatarFile
    );
    res.status(StatusCodes.OK).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  userController: {
    createUser,
    verifyAccount,
    login,
    logout,
    refresh_token,
    update,
  },
};
