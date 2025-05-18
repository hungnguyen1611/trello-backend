const { env } = require("@/configs/environment");

const WHITELIST_DOMAINS = ["http://localhost:3000"];

const BOARD_TYPE = {
  PUBLIC: "public",
  PRIVATE: "private",
};

const WEBSITE_DOMAIN =
  env.BUILD_MODE === "production"
    ? env.WEBSITE_DOMAIN_PROD
    : env.WEBSITE_DOMAIN_DEV;

//  những domains được phép truy cập đến sever
module.exports = {
  WHITELIST_DOMAINS,
  BOARD_TYPE,
  WEBSITE_DOMAIN,
};
