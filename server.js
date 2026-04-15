const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/events', (req, res) => {
  db.query('SELECT * FROM events', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'something went wrong' });
    }
    res.json(result);
  });
});

app.get('/clubs', (req, res) => {
  db.query('SELECT * FROM clubs', (err, result) => {
    if (err) {
      console.log("Clubs error:", err);
      return res.status(500).json({
        error: err.message
      });
    }

    res.json(result);
  });
});

// Fix for Railway
const PORT = process.env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log('server running on ' + PORT);
});