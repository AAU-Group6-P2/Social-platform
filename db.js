const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'mysql.railway.internal',
  user: 'root',
  password: 'xlzKxUNDSMocgAqzccCWvgVhmjzkmZvR',
  database: 'railway',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.log("MySQL connection failed:", err.message);
  } else {
    console.log("Connected to Railway MySQL");
  }
});

module.exports = db;