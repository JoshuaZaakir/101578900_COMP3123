const fs = require('fs');
const path = require('path');
const express = require('express');

const routerUser = express.Router();
const userFilePath = path.join(__dirname, '..', 'user.json');

routerUser.get('/profile', (req, res, next) => {
  res.sendFile(userFilePath, (err) => {
    if (err) {
      next(err);
    }
  });
});

routerUser.post('/login', (req, res, next) => {
  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) {
      next(err);
      return;
    }

    try {
      const user = JSON.parse(data);
      const { username, password } = req.body;

      if (username !== user.username) {
        res.json({
          status: false,
          message: 'User Name is invalid'
        });
        return;
      }

      if (password !== user.password) {
        res.json({
          status: false,
          message: 'Password is invalid'
        });
        return;
      }

      res.json({
        status: true,
        message: 'User Is valid'
      });
    } catch (parseError) {
      next(parseError);
    }
  });
});

routerUser.get('/logout/:username', (req, res) => {
  res.send(`<b>${req.params.username} successfully logged out.</b>`);
});

module.exports = routerUser;
