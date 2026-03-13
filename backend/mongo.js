const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    console.log("MongoDB connected to:", process.env.MONGO_URI)
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // stops backend if DB fails
  }
};

module.exports = connectDB;