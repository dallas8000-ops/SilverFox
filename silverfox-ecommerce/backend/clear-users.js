// clear-users.js
// Run with: node clear-users.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH ? path.resolve(__dirname, process.env.DB_PATH) : path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(DB_PATH);

db.run('DELETE FROM users', function(err) {
  if (err) {
    console.error('Error clearing users:', err.message);
    process.exit(1);
  }
  console.log('All users deleted from users table.');
  process.exit(0);
});
