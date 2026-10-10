const express = require('express');
const dotenv = require("dotenv").config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// `gemini-pro` has been retired by Google and now returns 404.
// `gemini-flash-latest` always points at the current Flash model; override with GEMINI_MODEL.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

router.post('/', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ message: 'A non-empty "prompt" is required.' });
    }
    try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = await response.text();

        res.status(200).json({ generatedText });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;