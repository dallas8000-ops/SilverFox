// Script to update all product image paths in the database to use only 'images/' (relative to React/public/images/)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH ? path.resolve(__dirname, process.env.DB_PATH) : path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(DB_PATH);

// Update all product image paths to start with 'images/' only
const updateSql = `UPDATE products SET image = REPLACE(image, 'image/', 'images/') WHERE image LIKE 'image/%';`;

// Also fix any absolute or double slashes
const fixDoubleSlashSql = `UPDATE products SET image = REPLACE(image, '//', '/');`;

// Optionally, remove any leading slashes
const removeLeadingSlashSql = `UPDATE products SET image = SUBSTR(image, 2) WHERE image LIKE '/images/%';`;

db.serialize(() => {
  db.run(updateSql, [], function(err) {
    if (err) console.error('Error updating image paths:', err.message);
    else console.log('Updated image paths to use images/');
  });
  db.run(fixDoubleSlashSql, [], function(err) {
    if (err) console.error('Error fixing double slashes:', err.message);
  });
  db.run(removeLeadingSlashSql, [], function(err) {
    if (err) console.error('Error removing leading slashes:', err.message);
  });
});

db.close();
