# COMP3123 Lab Exercise 4

Joshua Zaakir · Student ID 101578900

## Run

From this directory:

```sh
npm install
npm start
```

The server runs at `http://localhost:8080`. Use `npm run dev` for nodemon.

## API checks

- `GET /hello` returns `Hello Express JS` as plain text.
- `GET /user` defaults to Pritesh Patel; add `firstname` and `lastname` query parameters to override them.
- `POST /user/:firstname/:lastname` returns the path parameters as JSON.
- `POST /users` accepts a JSON array of users with `firstname` and `lastname`; invalid input returns a JSON error.
- `GET /instruction.html` serves the provided instructions using static middleware.

Import `Lab4.postman_collection.json` into Postman to run the seven success/error checks. For the array request, set `Content-Type: application/json`.
