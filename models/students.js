const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    studentName: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    totalSheets: {
        type: String,
        required: true
    },
    lastBook: {
        type: String,
        required: true
    },
}, { timestamps: true });

const StudentModel = mongoose.model('Student', studentSchema);

// export module
module.exports = StudentModel;