const express = require("express");
const Note = require("../models/Note");
const protect = require("../middleware/auth");

const router = express.Router();

// Create
router.post("/", protect, async (req, res) => {
  try {
    const note = await Note.create({
      title: req.body.title,
      content: req.body.content,
      tag: req.body.tag,
      userId: req.user.userId,
    });
    res.status(201).json(note);
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ errors: messages });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Get all with pagination and sort
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const query = {};

    const notes = await Note.find({
      ...query,
      userId: req.user.userId,
    })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("title content tag createdAt");

    const total = await Note.countDocuments({
      ...query,
      userId: req.user.userId,
    });

    res.json({
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid note ID" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Update
router.patch("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete
router.delete("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
