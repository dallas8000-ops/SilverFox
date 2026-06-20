// Ensures default staff admin exists: username admin / password admin
// Run: node add-admin.js

const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');
const bcrypt = require('bcrypt');

const DB_PATH = process.env.DB_PATH ? path.resolve(__dirname, process.env.DB_PATH) : path.join(__dirname, 'db.sqlite');
const username = process.env.DEFAULT_ADMIN_USER || 'admin';
const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )`
  );

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err.message);
      db.close();
      process.exit(1);
    }

    db.get('SELECT id FROM users WHERE username = ?', [username], (selErr, row) => {
      if (selErr) {
        console.error('Error checking user:', selErr.message);
        db.close();
        process.exit(1);
      }

      const done = (runErr) => {
        if (runErr) {
          console.error('Error saving admin user:', runErr.message);
          db.close();
          process.exit(1);
        }
        console.log(`Admin ready — username: ${username}, password: ${password}`);
        db.close();
        process.exit(0);
      };

      if (row) {
        db.run('UPDATE users SET password = ?, role = ? WHERE username = ?', [hash, 'admin', username], done);
      } else {
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, 'admin'], done);
      }
    });
  });
});
