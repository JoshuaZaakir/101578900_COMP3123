/*
Joshua Zaakir | Student ID: 101578900 | COMP3123 Lab 6

Define the note document structure for MongoDB and Mongoose.
*/

const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema({
  noteTitle: {
    type: String,
    required: true,
  },
  noteDescription: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
    enum: ["HIGH", "LOW", "MEDIUM"],
  },
  dateAdded: {
    type: String,
    required: true,
  },
  dateUpdated: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Notes", notesSchema);
