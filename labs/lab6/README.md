# COMP3123 Lab Exercise 6 — Notes API

Joshua Zaakir | Student ID: 101578900 | COMP3123 Lab 6

Node.js, Express 5.1.0 and Mongoose 8.24.5 CRUD API connected to MongoDB Atlas.

## Setup and run

1. Run `npm install` in this folder.
2. Copy `.env.example` to `.env`.
3. Replace `DB_URL` in `.env` with your MongoDB Atlas connection string. Keep `.env` private and add your current IP address to the Atlas access list.
4. Run `npm start` with Node.js 20.6 or newer.
5. Wait for both the MongoDB connection and port 8081 messages before testing.

## API endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | Welcome page |
| POST | `/api/notes` | Create a note and return HTTP 201 |
| GET | `/api/notes` | Retrieve every note |
| GET | `/api/notes/:noteId` | Retrieve one note |
| PUT | `/api/notes/:noteId` | Update and return one note |
| DELETE | `/api/notes/:noteId` | Delete one note |

POST and PUT expect JSON in this shape:

```json
{
  "content": {
    "noteTitle": "Sample Note Title",
    "noteDescription": "Sample Note Description",
    "priority": "HIGH",
    "dateAdded": "06/Oct/2025",
    "dateUpdated": "06/Oct/2025"
  }
}
```

All five fields are required strings. `priority` accepts `HIGH`, `LOW` or `MEDIUM`.

## Postman tests

Import `Lab6.postman_collection.json` into Postman and run the collection in order against `http://localhost:8081`. The collection creates a temporary test note, saves its `_id`, exercises all CRUD routes, deletes the test note and checks common error responses.
