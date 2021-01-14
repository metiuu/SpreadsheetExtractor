const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const uploadRoute = require("./routes/uploadRoute");
const studentRoutes = require("./routes/studentRoutes");

// initialize express app
const app = express();

// connect to database
const dbConn =
  "mongodb+srv://admin:KumonAshy16@students.qkpw0.mongodb.net/students?retryWrites=true&w=majority";
mongoose
  .connect(dbConn, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// set view engine
app.set("view engine", "ejs");

// middleware and static files
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

// routes
app.get("/", (request, response) => {
  response.render("index.ejs", { title: "Home Page" });
});

app.get("/upload", (request, response) => {
  response.render("upload/upload.ejs", { title: "Upload Page" });
});

app.get("/result", (request, response) => {
  response.redirect("/manual");
});

app.get("/manual", (request, response) => {
  response.render("upload/manual.ejs", { title: "Manual Input" });
});

// upload page
app.use(uploadRoute);

// database stuff
app.use(studentRoutes);

// 404 page
app.use(function (request, response) {
  response.status(404).render("404", { title: "Error 404" });
});
