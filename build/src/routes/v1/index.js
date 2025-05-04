const express = require("express");
const {
  StatusCodes
} = require("http-status-codes");
const {
  BoardRoutes
} = require("./BoardRoutes");
const Router = express.Router();
Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({
    message: "API v1 are ready use",
    code: StatusCodes.OK
  });
});
Router.use("/boards", BoardRoutes);
module.exports = {
  APIs_V1: Router
};