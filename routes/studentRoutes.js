const express = require("express");
const studentController = require('../controllers/studentController');
const {ensureAuthenticated} = require('../config/auth');

const studentRouter = express.Router();

studentRouter.get("/students", ensureAuthenticated, studentController.all_students);

studentRouter.post("/students", studentController.create_student);

studentRouter.get("/students/:id", studentController.student_details);

studentRouter.delete("/students/:id", studentController.delete_student);

studentRouter.get("/edit/:id", studentController.update_student_get);

studentRouter.post("/update", studentController.update_student_post);

module.exports = studentRouter;
