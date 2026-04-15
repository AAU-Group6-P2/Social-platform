const db = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send("Backend is running 🚀");
});

// GET all events
app.get('/events', (req, res) => {
  db.query('SELECT * FROM events', (err, result) => {
    if (err) {
      console.error("Events error:", err.message);
      return res.status(500).json({
        error: "Database query failed",
        details: err.message
      });
    }
    res.json(result);
  });
});

// GET all clubs
app.get('/clubs', (req, res) => {
  db.query('SELECT * FROM clubs', (err, result) => {
    if (err) {
      console.error("Clubs error:", err.message);
      return res.status(500).json({
        error: "Database query failed",
        details: err.message
      });
    }
    res.json(result);
  });
});

// IMPORTANT for Railway
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});