const { request } = require("express");
const Student = require("../models/students");

const all_students =  (request, response) => {
    Student.find()
    .then((result) => {
      response.render('students/allStudents.ejs', {
        title: "All Students",
        students: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

const student_details = (request, response) => {
    const id = request.params.id;

  Student.findById(id)
    .then((result) => {
      response.render('students/details', {
        student: result,
        title: "Student details",
      });
    })
    .catch((err) => console.log(err));
}

const create_student = (request, response) => {
    if (request.body.students instanceof Array) {
        var studentArray = request.body.students;
    
        Student.create(studentArray)
          .then((result) => {
            response.redirect("/students");
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        var student = new Student(request.body);
    
        student
          .save()
          .then(() => {
            response.redirect("/students");
          })
          .catch((err) => {
            console.log(err);
          });
      }
}

const delete_student = (request, response) => {
    const id = request.params.id;

  Student.findByIdAndDelete(id)
    .then((result) => {
      response.json({ redirect: "/students" });
    })
    .catch((err) => {
      console.log(err);
    });
}

const update_student_get = (request, response) => {
    const id = request.params.id;

  Student.findById(id)
    .then((result) => {
        response.render('students/edit', { student: result, title: "Edit" });
    })
    .catch((err) => console.log(err));
}

const update_student_post = (request, response) => {
    const student = request.body;

  Student.findByIdAndUpdate(student.studentId, {
    studentName: student.studentName,
    subject: student.subject,
    totalSheets: student.totalSheets,
    lastBook: student.lastBook,
  })
    .then((result) => {
      response.redirect("/students");
    })
    .catch((err) => console.log(err));
}

module.exports = {
    all_students,
    student_details,
    create_student,
    delete_student,
    update_student_get,
    update_student_post
}