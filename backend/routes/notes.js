const express = require("express");
const Note = require("../models/Note");
const router = express.Router();

router.post('/', async (req, res) => {
    console.log(req.body)
    try {
        const note = await Note.create(req.body);
        res.status(201).json(note);
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({ errors: messages });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;