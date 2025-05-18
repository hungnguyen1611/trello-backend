const JWT = require("jsonwebtoken");

// Funtion tạo mới đầu vào cần 3 tham số đầu vào
// User INfo những thông tin muốn đính kèm vào token
// secretSignature: chữ kí bí mật (dạng một chuỗi string ngẫu nhiên ) trên docs thì để tên là privateKey
// Token life: Thời gian sống của token
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    // Do return về thẳng giá trị nên ở trên chỉ cần khai báo async để khi dùng
    //  hàm ở bên ngoài biết là hàm bất đồng bộ cần có await (sử dụng await nếu phía dưới còn code hoặc gán giá trị đó cho một biến)
    return JWT.sign(userInfo, secretSignature, {
      algorithm: "HS256",
      expiresIn: tokenLife,
    });
  } catch (error) {
    throw new Error(error);
  }
};

// Kiểm tra một cái token có được hợp lệ hay không
// Hiều đơn giản là cái token được tạo ra có đúng với cái chữ kí bí bật secretSignature trong dự án hay không
const verifyToken = async (token, secretSignature) => {
  try {
    // Do return về thẳng giá trị nên ở trên chỉ cần khai báo async để khi dùng
    //  hàm ở bên ngoài biết là hàm bất đồng bộ cần có await (sử dụng await nếu phía dưới còn code hoặc gán giá trị đó cho một biến)
    return JWT.verify(token, secretSignature);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  JwtProvider: {
    generateToken,
    verifyToken,
  },
};
