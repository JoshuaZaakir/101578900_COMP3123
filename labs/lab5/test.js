const assert = require('assert/strict');
const app = require('./index');

async function runTests() {
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    let response = await fetch(`${baseUrl}/home`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /<h1>Welcome to ExpressJs Tutorial<\/h1>/);

    response = await fetch(`${baseUrl}/api/v1/user/profile`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).username, 'bret');

    response = await fetch(`${baseUrl}/api/v1/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'bret', password: 'bret@123' })
    });
    assert.deepEqual(await response.json(), {
      status: true,
      message: 'User Is valid'
    });

    response = await fetch(`${baseUrl}/api/v1/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'wrong', password: 'bret@123' })
    });
    assert.deepEqual(await response.json(), {
      status: false,
      message: 'User Name is invalid'
    });

    response = await fetch(`${baseUrl}/api/v1/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'bret', password: 'wrong' })
    });
    assert.deepEqual(await response.json(), {
      status: false,
      message: 'Password is invalid'
    });

    response = await fetch(`${baseUrl}/api/v1/user/logout/bret`);
    assert.equal(await response.text(), '<b>bret successfully logged out.</b>');

    const originalConsoleError = console.error;
    console.error = () => {};

    try {
      response = await fetch(`${baseUrl}/api/v1/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid json}'
      });
      assert.equal(response.status, 500);
      assert.equal(await response.text(), 'Server Error');
    } finally {
      console.error = originalConsoleError;
    }

    console.log('All route tests passed.');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
