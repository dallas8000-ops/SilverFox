// Script to import static products into the SQLite database
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const products = require('./products');

const DB_PATH = process.env.DB_PATH ? path.resolve(__dirname, process.env.DB_PATH) : path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run('DELETE FROM products'); // Clear existing products
  const stmt = db.prepare('INSERT INTO products (id, name, image, price, stock) VALUES (?, ?, ?, ?, ?)');
  products.forEach(p => {
    stmt.run(p.id, p.name, p.image, p.basePrice, 10); // Default stock: 10
  });
  stmt.finalize();
  console.log('Imported static products into database.');
});

db.close();
