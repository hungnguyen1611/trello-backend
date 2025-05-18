const { userModel } = require("@/models/UserModel");
const ApiError = require("@/utils/ApiError");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { pickUser } = require("@/utils/formatters");
const { WEBSITE_DOMAIN } = require("@/utils/constant");
const { BrevoProvider } = require("@/provider/BrevoProvider");
const { JwtProvider } = require("@/provider/JwtProvider");
const { env } = require("@/configs/environment");

const createUser = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại trong hệ thống hay chưa

    const exisUser = await userModel.findOneByEmail(reqBody.email);

    if (exisUser) {
      throw new ApiError(StatusCodes.CONFLICT, "Email already exists");
    }

    // Tạo data để lưu vào database
    const nameFromEmail = reqBody.email.split("@")[0];
    const newUser = {
      email: reqBody.email,
      password: bcrypt.hashSync(reqBody.password, 8), // Tham số thứ 2 là độ phức tạp băm càng cao băm càng lâu
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4(),
    };

    const createdUser = await userModel.createUser(newUser);

    const getNewUser = await userModel.findOneById(
      createdUser.insertedId.toString()
    );

    // Gửi email cho người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;
    const customSubject =
      "Trello MERN Stack Advanced: Please verifi your email before using our services!";
    const htmlContent = `<h3>Here is your verification link:</h3>
<h3>${verificationLink}</h3>
<h3>
  Sincerely,<br />
  – hungnguyen – Một Lập Trình Viên –
</h3>
`;
    // gọi tới provider gửi mail
    // Gửi email cho người dùng xác thực tài khoản
    // await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent);

    // return trả về dữ liệu cho controller
    return pickUser(getNewUser);
  } catch (error) {
    console.log("🚀 ~ createUser ~ error:", error);

    throw error;
  }
};

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email);

    // Các bước kiểm tra cần thiết
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "Account Not Found!");
    if (existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Your account is already active"
      );
    if (reqBody.token !== existUser.verifyToken)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Token is invalid!");

    // Nếu như  mọi thứ OK thì cập nhật lại thông tin để verify account
    const updateData = {
      isActive: true,
      verifyToken: null,
    };

    const updatedUser = await userModel.update(
      existUser._id.toString(),
      updateData
    );
    return pickUser(updatedUser);
  } catch (error) {
    throw error;
  }
};

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "Account Not Found!");
    if (!existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Your account is not already active!"
      );
    if (!bcrypt.compareSync(reqBody.password, existUser.password))
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Your Email or Password is incorrect"
      );

    // Nếu mọi thứ Ok thì tạo Token Đăng nhập trả về có phia client
    // Tạo thông tin để đính kèm trong JWT Token bao gồm _id và email của USER

    const userInfor = { _id: existUser._id, email: existUser.email };

    // Tạo acess token và refresh token để trả về phía client

    const accessToken = await JwtProvider.generateToken(
      userInfor,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    );
    const refreshToken = await JwtProvider.generateToken(
      userInfor,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
      // 15
    );

    return { accessToken, refreshToken, ...pickUser(existUser) };
  } catch (error) {
    throw error;
  }
};

const refreshToken = async (clientRefreshToken) => {
  try {
    // Giải mã refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    );

    // Chúng ta chỉ lưu những thông tin cố định và unique của user trong token rồi,
    // Vì vậy có thể lấy luôn từ decoded ra, tiết kiệm việc query vào DB
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email,
    };

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    );

    return { accessToken };
  } catch (error) {
    throw error;
  }
};
module.exports = {
  userService: {
    createUser,
    verifyAccount,
    login,
    refreshToken,
  },
};
