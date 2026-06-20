const sqlite3 = require('sqlite3').verbose();
const { spawn } = require('node:child_process');
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

db.get('SELECT COUNT(*) AS count FROM products', [], (err, row) => {
  if (err) {
    console.error('seed-if-empty: could not read products:', err.message);
    db.close();
    process.exit(1);
  }
  db.close();
  if (row && row.count > 0) {
    console.log(`seed-if-empty: ${row.count} products already loaded — skipping.`);
    process.exit(0);
  }
  console.log('seed-if-empty: empty catalog — running seed-mens-clothing.js');
  const child = spawn(process.execPath, [path.join(__dirname, 'seed-mens-clothing.js')], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 0));
});
