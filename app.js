const express = require('express');
const multer = require('multer');
const fs = require('fs');
const xlsx = require('xlsx');

function getStudentData(workbook)
{
    // Initialize sheet object with student data
    var sheetObj = {
        sName: "",
        sub: "",
        time: ""
    }
    
    // extract desired data from each sheet
    workbook.SheetNames.forEach(e => {
        var current_sheet = workbook.Sheets[e];
        var student_name = current_sheet['H2'];
        var subject = current_sheet['B3'];
        var month = current_sheet['A3'];
        var year = current_sheet['D3'];

        // console.log(e);
        // console.log('Student name: ',student_name.v);
        // console.log('Subject: ',subject.v);
        // console.log('Month: ',month.v, year.v);
        sheetObj.sName = student_name
        sheetObj.sub = subject
        sheetObj.time = month.v + " " + year.v
    });

    return sheetObj;
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

// set view engine
app.set('view engine', 'ejs');

// listen to port 3000
app.listen(3000);

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
        const sheetObj = getStudentData(workbook);

        // console.log(sheetObj.sName.v)
        response.render("result.ejs", {title: 'Upload successful!', studentName: sheetObj.sName.v, subject: sheetObj.sub.v, time: sheetObj.time})
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

// 404 page
app.use(function(request, response)
{
    response.status(404).render('404',{title: 'Error 404'});
});