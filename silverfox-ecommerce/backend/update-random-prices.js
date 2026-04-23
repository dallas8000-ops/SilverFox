// Script to update all product prices to random realistic values
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.sqlite');

function getRandomPrice() {
  // Generate a random price between 30 and 300, rounded to 2 decimals
  return Math.round((30 + Math.random() * 270) * 100) / 100;
}

function main() {
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    db.all('SELECT id FROM products', (err, rows) => {
      if (err) {
        console.error('DB error:', err);
        db.close();
        return;
      }
      let updated = 0;
      rows.forEach(row => {
        const price = getRandomPrice();
        db.run('UPDATE products SET price = ? WHERE id = ?', [price, row.id], function(err2) {
          if (!err2) updated++;
        });
      });
      db.close(() => {
        console.log(`Updated prices for ${rows.length} products.`);
      });
    });
  });
}

if (require.main === module) {
  main();
}