const express = require("express");
const indexRouter = express.Router();
const {ensureAuthenticated} = require('../config/auth');

indexRouter.get("/", ensureAuthenticated, (request, response) => {
  response.render("index.ejs", { title: "Home Page" });
});

indexRouter.get("/upload", ensureAuthenticated, (request, response) => {
  response.render("upload/upload.ejs", { title: "Upload Page" });
});

indexRouter.get("/result", (request, response) => {
  response.redirect("/manual");
});

indexRouter.get("/manual", ensureAuthenticated, (request, response) => {
  response.render("upload/manual.ejs", { title: "Manual Input" });
});

module.exports = indexRouter;