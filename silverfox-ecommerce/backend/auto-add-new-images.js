// auto-add-new-images.js
// Run with: node auto-add-new-images.js
// This script scans the images folder and adds any new images as products (excluding non-inventory images)

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { PRODUCT_IMAGES_DIR } = require('./paths');

const dbPath = path.join(__dirname, 'db.sqlite');
const imagesDir = PRODUCT_IMAGES_DIR;
const excludedExact = new Set([
  'blog.png',
  'contact.jpg',
  'contact1.jpg',
  'contact11.jpg',
  'contact2.jpg',
  'contact2-2.jpg',
  'contact22.jpg',
  'screenshot 2025-11-06 232000.png',
  'screenshot 20251106 232000.png',
]);
const excludedContains = [
  'contact',
  'screenshot',
  'banner',
  'hero',
  'logo',
];

function isExcludedImage(filename) {
  const lower = filename.toLowerCase();
  if (excludedExact.has(lower)) return true;
  return excludedContains.some((token) => lower.includes(token));
}

const db = new sqlite3.Database(dbPath);

// Get all image filenames in the images folder
const availableImages = fs.readdirSync(imagesDir)
  .filter(f => !isExcludedImage(f) && /\.(jpg|jpeg|png)$/i.test(f));

// Get all product images already in the database
function getProductImages(callback) {
  db.all('SELECT image FROM products', [], (err, rows) => {
    if (err) {
      console.error('Error reading products:', err.message);
      process.exit(1);
    }
    const dbImages = rows.map(r => r.image ? path.basename(r.image).toLowerCase() : '').filter(Boolean);
    callback(dbImages);
  });
}

function addProduct(imageFile) {
  const name = path.parse(imageFile).name.replace(/[-_]/g, ' ');
  const price = 100; // Default price, adjust as needed
  db.run(
    'INSERT INTO products (name, image, price, stock) VALUES (?, ?, ?, ?)',
    [name, imageFile, price, 10],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          console.log(`Product for ${imageFile} already exists.`);
        } else {
          console.error('Error adding product:', err.message);
        }
      } else {
        console.log(`Added product: ${name} (${imageFile})`);
      }
    }
  );
}

getProductImages(dbImages => {
  const newImages = availableImages.filter(img => !dbImages.includes(img.toLowerCase()));
  if (newImages.length === 0) {
    console.log('No new images to add as products.');
    db.close();
    return;
  }
  newImages.forEach(addProduct);
  db.close();
});
