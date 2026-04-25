const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();
const MIN_PASSWORD_LENGTH = 8;

const normalizeUsername = (username = "") => username.trim().toLowerCase();
const isValidUsername = (username) => /^[a-z0-9_]{3,30}$/.test(username);
const isValidPassword = (password) =>
  typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;

const createAuthToken = (user) =>
  jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// Register
router.post("/register", async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Auth is not configured" });
    }

    const username = normalizeUsername(req.body?.username);
    const { password } = req.body ?? {};

    if (!isValidUsername(username)) {
      return res.status(400).json({
        error:
          "Username must be 3-30 chars and only contain lowercase letters, numbers, and underscores.",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
    }

    const existingUser = await User.findOne({ username }).lean();
    if (existingUser) {
      return res.status(409).json({ error: "Username is already taken." });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, password: hash });
    const token = createAuthToken(user);

    res.status(201).json({ token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Username is already taken." });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Login JWT sign
router.post("/login", async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Auth is not configured" });
    }

    const username = normalizeUsername(req.body?.username);
    const { password } = req.body ?? {};

    if (!isValidUsername(username) || typeof password !== "string") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createAuthToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
