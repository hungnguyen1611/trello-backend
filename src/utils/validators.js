const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;
const OBJECT_ID_RULE_MESSAGE =
  "Your string fails to match the Object Id pattern!";

const EMAIL_RULE = /^\S+@\S+\.\S+$/;
const EMAIL_RULE_MESSAGE = "Email is invalid. (example@hungnguyen.com)";
const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/;
const PASSWORD_RULE_MESSAGE =
  "Password must include at least 1 letter, a number, and at least 8 characters.";

module.exports = {
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
};
