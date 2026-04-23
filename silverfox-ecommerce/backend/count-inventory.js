// count-inventory.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

db.all(`SELECT COUNT(*) as count FROM products WHERE image IS NOT NULL AND image != '' AND LOWER(image) NOT LIKE '%blog%' AND LOWER(image) NOT LIKE '%contact%' AND LOWER(image) NOT LIKE '%contact1%' AND LOWER(image) NOT LIKE '%contact2%' AND LOWER(image) NOT LIKE '%contact2-2%';`, (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } else {
    console.log('Inventory count:', rows[0].count);
    process.exit(0);
  }
});
