const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tag: {
      type: String,
      enum: ["work", "personal", "idea", "urgent"],
      default: "work",
    },
    clientMutationId: { type: String },
  },
  { timestamps: true },
);

noteSchema.index(
  { userId: 1, clientMutationId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientMutationId: { $type: "string" } },
  },
);

module.exports = mongoose.model("Note", noteSchema);
