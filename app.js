const express = require('express');
const multer = require('multer');
const fs = require('fs');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Student = require('./models/students');
const bodyParser = require('body-parser');
const { request } = require('express');

function getStudentData(workbook)
{
    // Initialize sheet object with student data
    var sheets = []
    
    // extract desired data from each sheet
    workbook.SheetNames.forEach(e => {
        var current_sheet = workbook.Sheets[e];
        var student_name = current_sheet['H2'];
        var subject = current_sheet['B3'];
        var month = current_sheet['A3'];
        var year = current_sheet['D3'];

        // count worksheets done (loop through rows and columns)
        // range = E6:N37
        current_sheet['!ref'] = "E6:N37";
        var count = 0;
        var range = xlsx.utils.decode_range(current_sheet['!ref']);
        for(var rowNum = range.s.r; rowNum <= range.e.r; ++rowNum) {
            for(var colNum = range.s.c; colNum <= range.e.c; ++colNum) {
                var nextCell = current_sheet[
                    xlsx.utils.encode_cell({r: rowNum, c: colNum})
                 ];
                 if( typeof nextCell !== 'undefined' ){
                    count++;
            }
          }
        }

        // round up/down to nearest multiple of 10
        var total = Math.round(count / 10) * 10;

        // last worksheet done
        // last row of spreadsheet, dont know how many rows there are
        for(var rowNum = range.s.r; rowNum <= range.e.r; ++rowNum) {
            for(var colNum = range.s.c; colNum <= range.e.c; ++colNum) {
                var levelCell = current_sheet[
                    xlsx.utils.encode_cell({r: rowNum, c: 1})
                 ];
                 if( typeof levelCell !== 'undefined' ){
                    var lastLevel = levelCell.v;                 
                }

                var wbCell = current_sheet[
                    xlsx.utils.encode_cell({r: rowNum, c: 2})
                 ];
                 if( typeof wbCell !== 'undefined' ){
                    var lastWB = wbCell.v;                 
                }
          }
        }

        sheets.push({sName: student_name.v, subject: subject.v, date: month.v + " " + year.v, totalSheets: total, lastBook: lastLevel + " " + lastWB})
    });

    return sheets;
}

// initialize express app
const storage = multer.diskStorage(
    {
        destination: (request, file, cb) =>
        {
            cb(null, 'uploads');
        },
        filename: (request, file, cb) =>
        {
            const fileName = file.originalname.toLowerCase().split(' ').join('-');
            cb(null, fileName);
        }
    });
const upload = multer(
    { 
        storage: storage,
        fileFilter: (request, file, cb) =>
        {
            if(file.mimetype == 'application/vnd.ms-excel' || file.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            {
                cb(null, true);
            }
            else
            {
                request.fileValidationError = 'Illegal file type';
                return cb(null, false, request.fileValidationError);
            }
        }
    });

const app = express();

// connect to database
const dbConn = 'mongodb+srv://admin:KumonAshy16@students.qkpw0.mongodb.net/students?retryWrites=true&w=majority';
mongoose.connect(dbConn, {useNewUrlParser: true, useUnifiedTopology: true})
.then((result) => app.listen(3000))
.catch((err) => console.log(err)); 

// set view engine
app.set('view engine', 'ejs');

// middleware and static files
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"))

// routes
app.get('/', (request, response) => 
{
    response.render('index.ejs', {title: 'Home Page'});
})

app.get('/upload', (request, response) => 
{
    response.render('upload.ejs', {title: 'Upload Page'});
})

app.get('/result', (request, response) => 
{
    response.redirect('/manual');
})

app.post('/result', upload.single('xls'), (request, response) => 
{
    // error handling (illegal file type)
    if(request.fileValidationError)
    {
        response.status(415).render('415',{title: 'Error 415'});
    }
    else
    {
        var workbook = xlsx.readFile(`./uploads/${request.file.filename}`);
        const sheetArr = getStudentData(workbook);

        // console.log(sheetObj.sName.v)
        response.render("result.ejs", {title: 'Upload successful!', sheets: sheetArr})
        fs.unlink(`./uploads/${request.file.filename}`, () => 
        {
            console.log("File deleted");
        });
    }
}) 

app.get('/manual', (request, response) => 
{
    response.render('manual.ejs', {title: 'Manual Input'});
})


// database stuff
app.get('/students', (request, response) =>
{
    Student.find()
    .then((result)  => 
    {
        response.render('students.ejs', {title: 'All Students', students: result})
    })
    .catch((err) => 
    {
        console.log(err);
    });
})

app.post('/students', (request, response) =>
{
    if(request.body.students instanceof Array)
    {
        var studentArray = request.body.students;

        Student.create(studentArray)
        .then((result) => {
            response.redirect('/students')
        })
        .catch((err) => {
            console.log(err)
        });
    }
    else
    {
        var student = new Student(request.body);

        student.save()
        .then(() =>
        {
            response.redirect('/students')
        })
        .catch((err) => {
            console.log(err)
        })
    }
})

app.get('/students/:id', (request, response) =>
{
    const id = request.params.id;

    Student.findById(id)
    .then((result) => {
        response.render('details.ejs', {student: result, title: 'Student details'})
    })
    .catch(err => console.log(err));
})

app.delete('/students/:id', (request,response) =>
{
    const id = request.params.id;

    Student.findByIdAndDelete(id)
    .then(result => {
      response.json({ redirect: '/students' });
    })
    .catch(err => {
      console.log(err);
    });
})

// 404 page
app.use(function(request, response)
{
    response.status(404).render('404',{title: 'Error 404'});
});