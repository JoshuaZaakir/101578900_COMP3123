
/*
Joshua Zaakir | Student ID: 101578900 | COMP3123 Lab 6

Purpose:
Set up the Express middleware and root route.
Mount the notes routes.
Connect to MongoDB Atlas before starting the server.
*/

const express = require("express");
const mongoose = require("mongoose");
const notesRoutes = require("./routes/notesRoutes.js");

const PORT = process.env.PORT || 8081;
const DB_URL = process.env.DB_URL;

if (!DB_URL) {
  console.error("DB_URL is missing. Copy .env.example to .env and add your MongoDB Atlas URL.");
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (request, response) => {
  response.send("<h1>Welcome to the root path of the server</h1>");
});

app.use("/api", notesRoutes);

// Return a clear response for malformed JSON and unexpected request errors.
app.use((error, request, response, next) => {
  if (response.headersSent) return next(error);

  const status = error.type === "entity.parse.failed" ? 400 : 500;
  return response.status(status).send({
    message: status === 400 ? "Invalid JSON body" : "Server error",
  });
});

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("Successfully connected to the MongoDB Atlas server");
    app.listen(PORT, () => {
      console.log(`Server listening at port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
    console.error("Could not connect to the MongoDB server");
    process.exit(1);
  });
