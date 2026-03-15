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

// Get all with pagination and sort
router.get('/', async (req, res) => {
    try {
        const {page = 1, limit = 10, sort = '-createdAt'} = req.query;

        const query = {};

        const notes = await Note.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .select('title content tag createdAt')

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

// Get by ID
router.get('/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({error: 'Note not found'});
        }
        res.json(note);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({error: 'Invalid note ID'});
        }
        res.status(500).json({error: 'Server error'});
    }
})

// Update
router.patch('/:id', async (req, res) => {
    try {
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            {$set: req.body},
            {returnDocument: 'after', runValidators:true}
        );
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Delete
router.delete('/:id', async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if (!note) {
            return res.status(404).json({error: 'Note not found'});
        }
        res.json({message: 'Note deleted successfully'});
    } catch (error) {
        res.status(500).json({error: 'Server error'});
    }
});

module.exports = router;