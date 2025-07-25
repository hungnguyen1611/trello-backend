const { env } = require("@/configs/environment");
import { API_ROOT } from "./../../../trello/src/utils/constants";

const WHITELIST_DOMAINS = [
  "https://trello-web-flame.vercel.app",
  "192.168.0.185", // domain local
  "https://www.trello.site",
];

const BOARD_TYPE = {
  PUBLIC: "public",
  PRIVATE: "private",
};

const WEBSITE_DOMAIN =
  env.BUILD_MODE === "production"
    ? env.WEBSITE_DOMAIN_PROD
    : env.WEBSITE_DOMAIN_DEV;

const DEFAULT_PAGE = 1;
const DEFAULT_ITEMS_PER_PAGE = 12;

const INVITATION_TYPES = {
  BOARD_INVITATION: "BOARD_INVITATION",
};

const BOARD_INVITATION_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
};

const CARD_MEMBER_ACTIONS = {
  REMOVE: "REMOVE",
  ADD: "ADD",
};

const API_ROOT =
  env.BUILD_MODE === "dev" ? "http://localhost:5000" : "https://trello.site";

module.exports = {
  WHITELIST_DOMAINS, //  những domains được phép truy cập đến sever
  BOARD_TYPE,
  WEBSITE_DOMAIN,
  DEFAULT_PAGE,
  DEFAULT_ITEMS_PER_PAGE,
  INVITATION_TYPES,
  BOARD_INVITATION_STATUS,
  CARD_MEMBER_ACTIONS,
  API_ROOT,
};
