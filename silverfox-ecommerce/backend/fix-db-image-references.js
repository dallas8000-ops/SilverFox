// Script to fix DB image references to match actual files in /images (case-insensitive, trimmed)
// and report any truly missing images
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'db.sqlite');
const IMAGES_DIR = path.join(__dirname, '../images');

function normalize(filename) {
  return filename ? filename.trim().toLowerCase() : '';
}

function getImageFiles() {
  return fs.readdirSync(IMAGES_DIR)
    .filter(f => fs.statSync(path.join(IMAGES_DIR, f)).isFile())
    .map(f => ({
      original: f,
      normalized: normalize(f)
    }));
}

function main() {
  const imageFiles = getImageFiles();
  const normalizedToOriginal = {};
  imageFiles.forEach(f => { normalizedToOriginal[f.normalized] = f.original; });

  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    db.all('SELECT id, name, image FROM products', (err, rows) => {
      if (err) {
        console.error('DB error:', err);
        db.close();
        return;
      }
      let updated = 0;
      let missing = [];
      let unchanged = 0;
      let fixes = [];
      const updatePromises = [];
      rows.forEach(row => {
        const origImage = row.image;
        const normImage = normalize(origImage);
        if (normImage in normalizedToOriginal) {
          const correctImage = normalizedToOriginal[normImage];
          if (origImage !== correctImage) {
            // Update DB to use correct case/trimmed filename
            fixes.push({id: row.id, from: origImage, to: correctImage});
            updatePromises.push(new Promise((resolve, reject) => {
              db.run('UPDATE products SET image = ? WHERE id = ?', [correctImage, row.id], function(err2) {
                if (err2) reject(err2); else resolve();
              });
            }));
            updated++;
          } else {
            unchanged++;
          }
        } else {
          missing.push({id: row.id, name: row.name, image: origImage});
        }
      });
      Promise.all(updatePromises).then(() => {
        console.log(`Updated ${updated} image references in DB.`);
        if (fixes.length > 0) {
          console.log('Fixes applied:');
          fixes.forEach(f => {
            console.log(`  Product ID ${f.id}: "${f.from}" -> "${f.to}"`);
          });
        }
        if (missing.length > 0) {
          console.log('\nProducts with missing images (no match in /images):');
          missing.forEach(m => {
            console.log(`  ID ${m.id} | Name: ${m.name} | Image: ${m.image}`);
          });
        } else {
          console.log('No products with missing images.');
        }
        db.close();
      }).catch(e => {
        console.error('Error updating DB:', e);
        db.close();
      });
    });
  });
}

if (require.main === module) {
  main();
}