const express = require('express');
const multer = require('multer');

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
                cb(null, false);
                return cb(new Error('Only .xls and .xlsx allowed'));
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
    response.render('result.ejs', {title: 'Result Page'});
})

app.post('/result', upload.single('xls'), (request, response) => 
{
    response.redirect('/result');   
})