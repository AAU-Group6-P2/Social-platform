const fs = require('fs');
const path = require('path');
const db = require('./db');

// This is a path to our event.json
const filePath = path.join(__dirname, '../data/event_card.json');

// And here it reads the file
const events = JSON.parse(
  fs.readFileSync(filePath, 'utf8')
);


// This applicable for every event
events.forEach(event => {
  db.query(
    `INSERT INTO events 
    (id, club_id, title, date, time, location, description, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event.id,
      event.clubId,
      event.title,
      event.date,
      event.time,
      event.location,
      event.description,
      event.isPublished
    ]
  );
});

console.log("Import done")