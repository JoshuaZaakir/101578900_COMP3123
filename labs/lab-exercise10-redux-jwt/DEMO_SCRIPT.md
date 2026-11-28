# Lab Exercise 10 video walkthrough

Joshua Zaakir · 101578900 · COMP3123

The submitted video records the running application. Its captions explain the steps; audio is not required to follow it.

1. Show the signed-out StudyBoard and request a protected profile without a token: 401.
2. Try the wrong password, then sign in with the public demo account.
3. Show the protected task list, JWT claims and the successful profile verification.
4. Alter the token payload while preserving the signature: the server rejects it with 401.
5. Add, complete, filter and delete a task to demonstrate Redux actions and reducers.
6. Scroll through the six numbered Redux concepts and the live state/action/subscriber inspector.
7. Sign out to clear session state; sign in with a ten-second token and wait for automatic expiration.

Talking points: the store owns state; actions describe events; dispatch sends them to reducers; subscribers update the UI. JWT payloads are readable, but protected access requires server verification of signature and claims. Task edits exist only for the current session.
