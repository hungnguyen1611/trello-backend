const { env } = require("@/configs/environment");
const brevo = require("@getbrevo/brevo");
let apiInstance = new brevo.TransactionalEmailsApi();

let apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = env.BREVO_API_KEY;

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  let sendSmtpEmail = new brevo.SendSmtpEmail();
  //  Tài khoản gửi mail (phải là tài khoản tạo trên brevo)
  sendSmtpEmail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME,
  };

  //   Những tài khoản nhận mail
  // to là Array để có thể gửi 1 mail đến nhìu tài khoản
  sendSmtpEmail.to = [{ email: recipientEmail }];

  //   Tiêu đề email
  sendSmtpEmail.subject = customSubject;
  sendSmtpEmail.htmlContent = htmlContent;

  //   Gọi hành động gửi mail
  return apiInstance.sendTransacEmail(sendSmtpEmail);
};
module.exports = {
  BrevoProvider: {
    sendEmail,
  },
};
