const express = require("express");
const Note = require("../models/Note");
const router = express.Router();

// Create
router.post('/', async (req, res) => {
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

// Read
router.get('/', async (req, res) => {
    try {
        const {page = 1, limit = 10, sort = '-createdAt'} = req.query;

        const query = {};

        const notes = await Note.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .select('title content')

        const total = await Note.countDocuments(query);

        res.json({
            notes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({error: 'Server error'});
    }
})

// Update


// Delete

module.exports = router;