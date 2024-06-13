const express = require('express');
const router = express.Router();
const RecognitionAttempt = require('../models/RecognitionAttempt');

// GET ALL RECOGNITION ATTEMPT
router.post('/PostNewRecognitionAttempt', async (req, res) => {
    const { timestamp, username, result } = req.body;

    const newRecognitionAttempt = new RecognitionAttempt({
        timestamp: timestamp,
        username: username,
        result: result
    });

    const savedRecognitionAttempt = await newRecognitionAttempt.save();
    res.status(200).json(savedRecognitionAttempt);
});

// GET ALL RECOGNITION ATTEMPT
router.get('/GetAllRecognitionAttempts', async (req, res) => {
    const response = await RecognitionAttempt.find();
    res.status(200).json(response);
});

module.exports = router;