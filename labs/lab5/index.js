const path = require('path');
const express = require('express');
const userRouter = require('./routes/users');

const app = express();

app.use(express.json());
app.use('/api/v1/user', userRouter);

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server Error');
});

const port = process.env.PORT || process.env.port || 8081;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Web Server is listening at port ${port}`);
  });
}

module.exports = app;
