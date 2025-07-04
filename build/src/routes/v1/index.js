const express = require("express");
const {
  StatusCodes
} = require("http-status-codes");
const {
  BoardRoute
} = require("./BoardRoutes");
const {
  ColumnRoute
} = require("./ColumnRoute");
const {
  CardRoute
} = require("./CardRoute");
const {
  userRoute
} = require("./userRoutes");
const {
  invitationRoute
} = require("./invitationRoutes");
const Router = express.Router();
Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({
    message: "API v1 are ready use",
    code: StatusCodes.OK
  });
});
Router.use("/boards", BoardRoute);
Router.use("/columns", ColumnRoute);
Router.use("/cards", CardRoute);
Router.use("/users", userRoute);
Router.use("/invitations", invitationRoute);
module.exports = {
  APIs_V1: Router
};