// fix-image-names-in-db.js
// Run with: node fix-image-names-in-db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all('SELECT id, image FROM products', [], (err, rows) => {
    if (err) {
      console.error('Error reading products:', err.message);
      db.close();
      return;
    }
    rows.forEach(row => {
      if (!row.image) return;
      const newName = row.image.replace(/-/g, '');
      if (newName !== row.image) {
        db.run('UPDATE products SET image = ? WHERE id = ?', [newName, row.id], function (err2) {
          if (err2) {
            console.error(`Error updating product ${row.id}:`, err2.message);
          }
        });
      }
    });
    console.log('Image filenames in DB updated to remove dashes.');
    db.close();
  });
});
