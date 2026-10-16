/*
Joshua Zaakir | Student ID: 101578900 | COMP3123 Lab 6

Set up all CRUD routes for the notes API.
*/

const express = require("express");
const NotesModel = require("../models/NotesModel.js");

const router = express.Router();

function hasContent(request) {
  return request.body?.content &&
    typeof request.body.content === "object" &&
    !Array.isArray(request.body.content) &&
    Object.keys(request.body.content).length > 0;
}

function noteFields(content) {
  return {
    noteTitle: content.noteTitle,
    noteDescription: content.noteDescription,
    priority: content.priority,
    dateAdded: content.dateAdded,
    dateUpdated: content.dateUpdated,
  };
}

function databaseError(response, error, fallbackMessage) {
  const isBadRequest = ["CastError", "ValidationError"].includes(error.name);

  return response.status(isBadRequest ? 400 : 500).send({
    message: error.name === "CastError"
      ? "Invalid note ID"
      : error.name === "ValidationError"
        ? error.message
        : fallbackMessage,
  });
}

// POST http://localhost:8081/api/notes
router.post("/notes", async (request, response) => {
  if (!hasContent(request)) {
    return response.status(400).send({
      message: "Note content in the POST body cannot be left empty",
    });
  }

  try {
    const note = new NotesModel(noteFields(request.body.content));
    const savedNote = await note.save();
    return response.status(201).send(savedNote);
  } catch (error) {
    return databaseError(response, error, "Some error occurred while creating the note");
  }
});

// GET http://localhost:8081/api/notes
router.get("/notes", async (request, response) => {
  try {
    const notes = await NotesModel.find();
    return response.status(200).send(notes);
  } catch (error) {
    return databaseError(response, error, "Could not retrieve notes");
  }
});

// GET http://localhost:8081/api/notes/:noteId
router.get("/notes/:noteId", async (request, response) => {
  try {
    const note = await NotesModel.findById(request.params.noteId);

    if (!note) {
      return response.status(404).send({ message: "Note not found" });
    }

    return response.status(200).send(note);
  } catch (error) {
    return databaseError(response, error, "Could not retrieve the note");
  }
});

// PUT http://localhost:8081/api/notes/:noteId
router.put("/notes/:noteId", async (request, response) => {
  if (!hasContent(request)) {
    return response.status(400).send({
      message: "Note content in the PUT body cannot be left empty",
    });
  }

  try {
    const note = await NotesModel.findByIdAndUpdate(
      request.params.noteId,
      noteFields(request.body.content),
      { new: true, runValidators: true },
    );

    if (!note) {
      return response.status(404).send({ message: "Note not found" });
    }

    return response.status(200).send(note);
  } catch (error) {
    return databaseError(response, error, "Could not update the note");
  }
});

// DELETE http://localhost:8081/api/notes/:noteId
router.delete("/notes/:noteId", async (request, response) => {
  try {
    const note = await NotesModel.findByIdAndDelete(request.params.noteId);

    if (!note) {
      return response.status(404).send({ message: "Note not found" });
    }

    return response.status(200).send({ message: "Note deleted successfully" });
  } catch (error) {
    return databaseError(response, error, "Could not delete the note");
  }
});

module.exports = router;
