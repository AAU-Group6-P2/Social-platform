const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("Backend is running");
});

app.get('/events', (req, res) => {
  db.query('SELECT * FROM events', (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

app.get('/clubs', (req, res) => {
  db.query('SELECT * FROM clubs', (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
