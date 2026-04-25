const express = require("express");
const mongoose = require("mongoose");
const Note = require("../models/Note");
const protect = require("../middleware/auth");

const router = express.Router();
const ALLOWED_SORTS = new Set(["createdAt", "-createdAt", "updatedAt", "-updatedAt"]);
const ALLOWED_TAGS = new Set(["work", "personal", "idea", "urgent"]);

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const toSafeText = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const buildCreatePayload = (body = {}) => {
  const payload = {
    title: toSafeText(body.title),
    content: toSafeText(body.content),
  };

  if (body.tag !== undefined) {
    payload.tag = toSafeText(body.tag).toLowerCase();
  }

  return payload;
};

const buildUpdatePayload = (body = {}) => {
  const payload = {};

  if (body.title !== undefined) payload.title = toSafeText(body.title);
  if (body.content !== undefined) payload.content = toSafeText(body.content);
  if (body.tag !== undefined) payload.tag = toSafeText(body.tag).toLowerCase();

  return payload;
};

// Create
router.post("/", protect, async (req, res) => {
  try {
    const payload = buildCreatePayload(req.body);
    if (payload.tag && !ALLOWED_TAGS.has(payload.tag)) {
      return res.status(400).json({ error: "Invalid tag value" });
    }

    const note = await Note.create({
      ...payload,
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
    const rawPage = Number.parseInt(req.query.page, 10);
    const rawLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isNaN(rawPage) ? 1 : Math.max(rawPage, 1);
    const limit = Number.isNaN(rawLimit) ? 10 : Math.min(Math.max(rawLimit, 1), 100);
    const sort = ALLOWED_SORTS.has(req.query.sort) ? req.query.sort : "-createdAt";

    const query = {};

    const notes = await Note.find({
      ...query,
      userId: req.user.userId,
    })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("title content tag createdAt");

    const total = await Note.countDocuments({
      ...query,
      userId: req.user.userId,
    });

    res.json({
      notes,
      pagination: {
        page,
        limit,
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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const note = await Note.findOne({
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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const updates = buildUpdatePayload(req.body);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields provided" });
    }
    if (updates.tag && !ALLOWED_TAGS.has(updates.tag)) {
      return res.status(400).json({ error: "Invalid tag value" });
    }

    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      { $set: updates },
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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const note = await Note.findOneAndDelete({
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
