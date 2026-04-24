const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tag: {
      type: String,
      enum: ["work", "personal", "idea", "urgent"],
      default: "work",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Note", noteSchema);
