# Lab Exercise 10 — StudyBoard: React Redux + JWT

**Joshua Zaakir · 101578900 · COMP3123**

A small study-task application demonstrating all six Redux concepts and real server-verified JSON Web Token authentication. Sign in, inspect token claims, fetch a protected task list, add/complete/filter/delete tasks, and watch the state and action stream update.

**Public source:** [GitHub lab folder](https://github.com/JoshuaZaakir/101578900_COMP3123/tree/main/labs/lab-exercise10-redux-jwt).

## Run the application

Prerequisite: Node.js **22 or newer**, with npm. No database, API key, or environment file is needed.

```bash
git clone https://github.com/JoshuaZaakir/101578900_COMP3123.git
cd 101578900_COMP3123/labs/lab-exercise10-redux-jwt
npm ci
npm run dev
```

Open **http://127.0.0.1:5174**. This starts Vite and the Express API together. Keep the terminal open. Demo login:

| Email | Password |
| --- | --- |
| `demo@studyboard.dev` | `ReduxJWT10!` |

To run the production build on one server:

```bash
npm run build
npm start
```

Then open **http://127.0.0.1:3010**. Stop `npm run dev` first so port 3010 is free. If running from the submitted ZIP, open the extracted application folder and start at `npm ci`.

## Demonstration steps

1. While signed out, request the protected profile without a token. The API responds **401 Unauthorized**.
2. Sign in with the demo credentials. Express signs a JWT and returns the user. The app stores the token **only in Redux memory**, then sends `Authorization: Bearer <token>` to fetch the task list.
3. Add a task, complete it, use Active/Completed filters, and delete it. Watch the action stream and state inspector. The subscriber count increases with dispatches.
4. Inspect the JWT header and payload. Click **Verify my token** for a real **200** response, then **Test tampered token** for **401**. The latter changes the payload without re-signing it.
5. Sign out. Both the token and tasks are cleared. Sign in with **Use a 10-second token to test expiry**, wait ten seconds, and observe automatic sign-out. The API independently rejects expired tokens.

## Research: React Redux

Redux manages shared application data using a predictable action-to-state flow. React Redux connects that store to React components; `Provider` supplies the store, `useSelector` subscribes to selected data, and `useDispatch` sends actions. Redux Toolkit reduces setup code with `configureStore`, `createSlice`, and async thunks.

| # | Concept | Meaning and implementation in this app |
| --- | --- | --- |
| 0 | **State** | The current data: `auth` contains user/token/status; `tasks` contains items/filter/status. The live inspector displays a redacted snapshot. |
| 1 | **Store** | The central container created by `configureStore` in `src/store.js`. `src/main.jsx` passes it to React Redux's `Provider`. |
| 2 | **Reducer** | Calculates the next state from the previous state and an action. The auth and tasks slices handle their actions. Toolkit uses Immer so draft updates produce immutable state. No fetches or random ID generation occur in reducers. |
| 3 | **Action** | An object describing an event, such as `{ type: 'tasks/toggled', payload: '2' }`. `createSlice` generates action creators. The stream shows action types without credential-bearing payloads. |
| 4 | **Dispatch** | `dispatch(added({ id, title, completed: false }))` sends an event through middleware to the reducer. `login` and `loadTasks` thunks manage asynchronous API requests and pending/fulfilled/rejected actions. |
| 5 | **Subscribe** | An explicit `store.subscribe` callback counts store notifications. React Redux's `useSelector` also subscribes to updates. The inspector uses a separate observer so its subscriber never recursively dispatches. `subscribe` returns an unsubscribe function, demonstrated in the Redux test. |

Flow: **user interaction → dispatch(action) → reducer → next state → subscribers → React UI**.

Local form fields use React state because their drafts do not need sharing. Auth, tasks and the task filter are shared Redux state. Add/toggle/delete are local Redux operations; only the initial task list comes from the protected server. They are intentionally session-only and are not database writes.

## Research: JSON Web Tokens

A JWT transports claims between parties. This app uses the **signed JWS compact form**, with three Base64URL parts: `header.payload.signature`. JWT also supports other representations such as encrypted JWE; this demo uses signed tokens only.

- **Header:** `alg: HS256`, `typ: JWT`.
- **Payload:** `sub` identifies the student, `name` is a display claim, `iss` identifies the API, `aud` identifies the client, `iat` records issuance, and `exp` records expiry. Numeric dates are Unix seconds.
- **Signature:** an HMAC over the encoded header and payload using a server-only secret. Changing either signed part invalidates the signature. Base64URL encoding is **not encryption**, so tokens must not contain passwords or private secrets.
- **Verification:** Express uses `jwt.verify` with an HS256 allowlist and expected issuer/audience. It validates expiry and the expected subject before granting protected access. Client-side decoding in the explorer is educational inspection, not proof of authenticity.
- **Lifetime:** normal sessions last 15 minutes; the expiry checkbox issues an actual 10-second token. The UI clears expired sessions, while the API enforces expiration independently.

JWTs can allow the server to validate requests without a stored session record. A copied valid token can still be used until expiry: this demo's logout clears the client token and does **not** revoke issued tokens on the server. Production logout/revocation needs additional design.

## API contract

Base URL: `http://127.0.0.1:3010/api`. Requests and responses use JSON; authenticated requests use an `Authorization: Bearer <JWT>` header. Errors return `{ "message": "..." }`. API responses have `Cache-Control: no-store`.

| Method / path | Input | Success | Errors |
| --- | --- | --- | --- |
| `POST /auth/login` | Required string `email`, string `password`; optional boolean `shortLived` (default false) | 200 `{ token, user, expiresIn }` | 400 malformed input; 401 wrong credentials |
| `GET /auth/me` | Bearer token | 200 `{ user: { id, name, email } }` | 401 missing, altered, expired, or invalid claims |
| `GET /tasks` | Bearer token | 200 `{ tasks: [{ id, title, completed }, ...] }` | 401 missing or invalid token |

Unknown API paths return 404. Task endpoints are read-only; edits remain in the browser's Redux store.

## Verification

```bash
npm test
npm run build
```

`npm test` starts isolated API servers and checks missing/invalid credentials, signed tokens, protected routes, tampering, expiry, issuer/audience/subject, algorithm restrictions, malformed JSON, plus Redux immutability, dispatch, subscription and unsubscribe behavior.

With the application API running, the included Postman collection tests real HTTP behavior:

```bash
postman collection run postman/StudyBoard.postman_collection.json --no-report-events
```

Postman CLI is optional for running the application. You can also import the JSON collection into Postman Desktop. Its credentials are deliberately public demo values, not private account credentials.

Browser verification/recording uses Playwright with an installed Chrome (or a Playwright Chromium installation):

```bash
npx playwright install chromium
npm run test:e2e
```

Start the app first. Optional environment variables: `APP_URL` (default `http://127.0.0.1:5174`), `EVIDENCE_DIR` (default `./evidence`), and `CHROME_PATH` for an existing Chrome executable. The script saves actual screenshots, a WebM walkthrough, and a browser verification report. It also checks a 390-pixel mobile layout and token expiry.

## Security scope and limitations

This is a local educational demo with one public account. Password comparison uses a salted scrypt hash and a constant-time comparison. A cryptographically random signing secret is created at server startup, or you can provide a private `JWT_SECRET` through `.env` (see `.env.example`). The secret never enters the frontend build. Restarting without a fixed secret invalidates earlier tokens.

Tokens are not persisted in localStorage or cookies; refreshing requires signing in again. Browser memory is still accessible to injected JavaScript. This demo has no database, registration, refresh tokens, revocation list, or login rate limiter. A public deployment should add HTTPS, suitable session storage, abuse protection, and an appropriate token revocation strategy. The server binds to loopback by default.

No known errors should prevent the verified demo from running. If either port is occupied, stop the earlier instance before starting. An API connection error is shown in the UI rather than silently succeeding. UI fonts use Google Fonts when available and fall back to local sans-serif fonts offline.

## Submission materials

The submission folder contains a **code ZIP**, **PNG screenshots**, and **demo video** as separate files. Submit the public GitHub link as well; media should be uploaded separately from the code ZIP as required by the rubric. See `DEMO_SCRIPT.md` for the video sequence and `VERIFICATION.md` for the actual verification results.

## Sources

Official sources consulted for the research and implementation:

1. [Redux Fundamentals — Overview](https://redux.js.org/tutorials/fundamentals/part-1-overview) — actions, reducers, state, dispatch and subscriptions.
2. [React Redux Hooks](https://react-redux.js.org/api/hooks) — Provider, useSelector and useDispatch.
3. [Redux Toolkit configureStore](https://redux-toolkit.js.org/api/configureStore) and [createSlice](https://redux-toolkit.js.org/api/createSlice) — modern store/reducer setup and immutable draft updates.
4. [RFC 7519 — JSON Web Token](https://www.rfc-editor.org/rfc/rfc7519.html) — token representation and registered claims.
5. [node-jsonwebtoken documentation](https://github.com/auth0/node-jsonwebtoken) — signing, verification, algorithms and expiration.
