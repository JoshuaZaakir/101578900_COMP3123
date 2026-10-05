const express = require("express");
const path = require("path");
const app = express();

const SERVER_PORT = process.env.PORT || 8080;

// Middleware: static files, JSON bodies, and URL-encoded bodies.
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (request, response) => {
  response.type("text/plain").send("COMP3123 Lab Exercise 4 Express server");
});

app.get("/hello", (request, response) => {
  response.type("text/plain").send("Hello Express JS");
});

app.get("/user", (request, response) => {
  const firstname = request.query.firstname || "Pritesh";
  const lastname = request.query.lastname || "Patel";
  response.json({
    firstname,
    lastname
  });
});

app.post("/user/:firstname/:lastname", (request, response) => {
  const { firstname, lastname } = request.params;
  response.json({
    firstname,
    lastname
  });
});

app.post("/users", (request, response) => {
  const users = Array.isArray(request.body) ? request.body : request.body?.users;

  if (!Array.isArray(users)) {
    return response.status(400).json({
      error: "Request body must be an array of users"
    });
  }

  const invalidUser = users.some((user) =>
    !user || typeof user.firstname !== "string" || !user.firstname.trim() ||
    typeof user.lastname !== "string" || !user.lastname.trim()
  );
  if (invalidUser) {
    return response.status(400).json({
      error: "Each user requires firstname and lastname"
    });
  }

  response.json(users);
});

// The route below is retained from the classroom Express example.
app.get("/college", (request, response) => {
  response.json({
    name: "George Brown Polytechnic",
    location: "Toronto",
    established: 1967
  });
});

app.listen(SERVER_PORT, () => {
  console.log("Server is running on http://localhost:" + SERVER_PORT);
});
