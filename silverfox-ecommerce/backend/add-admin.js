// add-admin.js
// Run with: node add-admin.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH ? path.resolve(__dirname, process.env.DB_PATH) : path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(DB_PATH);

const username = 'admin';
const password = 'admin'; // Change this if you want a different password

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err.message);
    process.exit(1);
  }
const role = 'admin'; // Set the role for the admin user
  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role], function(err) {
    if (err) {
      console.error('Error adding admin user:', err.message);
      process.exit(1);
    }
    console.log('Admin user created with username: admin and password: admin');
    process.exit(0);
  });
});
