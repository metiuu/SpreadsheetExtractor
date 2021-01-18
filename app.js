const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const {ensureAuthenticated} = require('./config/auth');

// routes
const indexRoute = require("./routes/indexRoutes");
const uploadRoute = require("./routes/uploadRoute");
const loginRoute = require("./routes/loginRoutes");
const studentRoutes = require("./routes/studentRoutes");

// initialize express app
const app = express();

// passport config
require('./config/passport')(passport);

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
app.use(express.static("public"));

// express session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());

// Global variables (for flash messages)
app.use((request, response, next) => {
  response.locals.success_message = request.flash('success_message');
  response.locals.error_message = request.flash('error_message');
  response.locals.error = request.flash('error');
  next();
})

// routes
app.use(indexRoute);

// login
app.use(loginRoute);

// upload page
app.use(uploadRoute);

// database stuff
app.use(studentRoutes);

// 404 page
app.use(function (request, response) {
  response.status(404).render("404", { title: "Error 404" });
});
