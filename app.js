const express = require('express');
const multer = require('multer');
const fs = require('fs');
const xlsx = require('xlsx');

function getStudentData(workbook)
{
    // Initialize sheet object with student data
    var sheetObj = {
        sName: "",
        subject: "",
        date: "",
        totalSheets: "",
        lastBook: ""
    }

    var sheets = []
    
    // extract desired data from each sheet
    workbook.SheetNames.forEach(e => {
        var current_sheet = workbook.Sheets[e];
        var student_name = current_sheet['H2'];
        var subject = current_sheet['B3'];
        var month = current_sheet['A3'];
        var year = current_sheet['D3'];

        
        sheetObj.sName = student_name.v
        sheetObj.subject = subject.v
        sheetObj.date = month.v + " " + year.v

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
        sheetObj.totalSheets = count

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

        sheetObj.lastBook = lastLevel + " " + lastWB
        sheets.push({sName: student_name.v, subject: subject.v, date: month.v + " " + year.v, totalSheets: count, lastBook: lastLevel + " " + lastWB})
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

// 404 page
app.use(function(request, response)
{
    response.status(404).render('404',{title: 'Error 404'});
});