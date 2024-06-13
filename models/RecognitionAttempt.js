const mongoose = require('mongoose');

const RecognitionAttemptResults = ['allowed', 'denied'];

const RecognitionAttemptSchema = new mongoose.Schema({
    timestamp: {
        type: Number, 
        required: true
    },
    result: {
        type: String,
        required: true,
        enum: RecognitionAttemptResults
    },
    username:{
        type: String
    }
});

const RecognitionAttempt = mongoose.model('RecognitionAttempt', RecognitionAttemptSchema);

module.exports = RecognitionAttempt;