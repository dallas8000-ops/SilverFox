// fix-product-images.js
// Run with: node fix-product-images.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'db.sqlite');
const { PRODUCT_IMAGES_DIR: imagesDir } = require('./paths');
const db = new sqlite3.Database(dbPath);

// Get all image filenames in the public/images folder
const availableImages = new Set(fs.readdirSync(imagesDir));

// Update each product's image field to match a file in public/images
// If the image field is a full path, just use the filename

db.serialize(() => {
  db.all('SELECT id, image FROM products', [], (err, rows) => {
    if (err) {
      console.error('Error reading products:', err.message);
      db.close();
      return;
    }
    rows.forEach(row => {
      if (!row.image) return;
      const filename = path.basename(row.image);
      if (availableImages.has(filename)) {
        db.run('UPDATE products SET image = ? WHERE id = ?', [`${filename}`, row.id], function (err2) {
          if (err2) {
            console.error(`Error updating product ${row.id}:`, err2.message);
          }
        });
      } else {
        console.warn(`Image not found for product ${row.id}: ${filename}`);
      }
    });
    console.log('Product image fields updated to match public/images folder.');
    db.close();
  });
});
