const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
}, {timestamps: true});

modeule.exports = mongoose.model("Note", noteSchema);