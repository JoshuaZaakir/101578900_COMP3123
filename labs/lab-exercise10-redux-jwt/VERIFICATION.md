# Verification results

Verified on November 28, 2026 for Joshua Zaakir (101578900).

| Check | Actual result |
| --- | --- |
| `npm test` | **10 tests passed, 0 failed**; process exit 0. Real isolated Express servers check JWT authentication, tampering, actual expiry, claim/algorithm validation, protected resources and input errors. Redux tests check immutable updates, subscriptions/unsubscribe, and ignoring a late task response after logout. |
| `npm run build` | **Passed**, process exit 0; Vite creates the production `dist` directory. |
| Postman CLI collection | **11 requests, 21 assertions, 0 failures**, exit 0 against the real local API on port 3010. No mocked responses. Local execution does not require Postman login. |
| Playwright browser demonstration | **Passed**, exit 0: missing token, wrong credentials, login, protected tasks, valid token, tampered token, add/toggle/filter/delete, subscriber updates, logout, actual ten-second expiration and refresh behavior. |
| Browser runtime | No uncaught JavaScript errors or local HTTP 5xx responses in the walkthrough. Deliberate **401** responses are expected evidence of authentication enforcement. |
| Mobile layout | Authenticated task board rendered at **390 × 844**; no horizontal document overflow. |
| Visual review | Desktop and mobile screenshots inspected. Video captures the actual running app with explanatory captions. |

The video is approximately **72 seconds**. The separate MP4 uses H.264 at 1440 × 1000, 25 fps; the original WebM is also supplied. There is no narration; on-screen captions explain the demonstration.

## Known limitations

The demo account and its credentials are public educational values. Tasks and JWTs live only in memory; refresh/sign-out resets the session. Logout is client-side clearing and does not revoke a previously copied token. Server restart creates a new signing secret unless `JWT_SECRET` is supplied. This is a local demonstration, without a production user database or login abuse protection.

No known application errors prevent the tested flows from running. Network/API unavailability is surfaced to the user. Both ports 5174 and 3010 must be available when using the development command.
