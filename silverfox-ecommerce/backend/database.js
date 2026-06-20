/**
 * SQLite (default) or PostgreSQL when DATABASE_URL is set (Railway).
 * Exports a sqlite3-compatible callback API for minimal churn in index.js.
 */
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.DB_PATH
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.join(__dirname, 'db.sqlite');

function toPgSql(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function createPgDb(connectionString) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString,
    ssl:
      process.env.PGSSL === 'false'
        ? false
        : process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
  });

  const db = {
    isPostgres: true,
    _pool: pool,
    run(sql, params, cb) {
      if (typeof params === 'function') {
        cb = params;
        params = [];
      }
      const upper = sql.trim().toUpperCase();
      let pgSql = toPgSql(sql);
      if (upper.startsWith('INSERT') && !/RETURNING/i.test(pgSql)) {
        pgSql = `${pgSql.replace(/;\s*$/, '')} RETURNING id`;
      }
      pool.query(pgSql, params || [], (err, result) => {
        if (err) return cb(err);
        const ctx = {
          lastID: result.rows?.[0]?.id ?? result.rows?.[0]?.ID,
          changes: result.rowCount,
        };
        cb.call(ctx, null);
      });
    },
    get(sql, params, cb) {
      if (typeof params === 'function') {
        cb = params;
        params = [];
      }
      pool.query(toPgSql(sql), params || [], (err, result) => {
        if (err) return cb(err);
        cb(null, result.rows[0]);
      });
    },
    all(sql, params, cb) {
      if (typeof params === 'function') {
        cb = params;
        params = [];
      }
      pool.query(toPgSql(sql), params || [], (err, result) => {
        if (err) return cb(err);
        cb(null, result.rows);
      });
    },
    serialize(fn) {
      fn();
    },
    close(cb) {
      pool.end(cb);
    },
  };

  console.log('Connected to PostgreSQL database.');
  return db;
}

function createSqliteDb() {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) throw err;
    console.log('Connected to SQLite database.');
  });
  db.isPostgres = false;
  return db;
}

function initSchema(db, done) {
  const statements = db.isPostgres
    ? [
        `CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          image TEXT,
          price DOUBLE PRECISION NOT NULL,
          stock INTEGER DEFAULT 0,
          category TEXT,
          description TEXT,
          size_us TEXT,
          size_eu TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS cart (
          id SERIAL PRIMARY KEY,
          session TEXT NOT NULL,
          product_id INTEGER,
          size TEXT,
          quantity INTEGER,
          currency TEXT,
          price DOUBLE PRECISION,
          FOREIGN KEY(product_id) REFERENCES products(id)
        )`,
        `CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          session TEXT NOT NULL,
          user_id INTEGER,
          total DOUBLE PRECISION,
          currency TEXT,
          status TEXT DEFAULT 'pending',
          customer_name TEXT,
          customer_email TEXT,
          customer_phone TEXT,
          country TEXT,
          address TEXT,
          payment_method TEXT,
          notes TEXT,
          items_json TEXT,
          order_reference TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS contact_inquiries (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          email TEXT,
          display_name TEXT
        )`,
      ]
    : [
        `CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          image TEXT,
          price REAL NOT NULL,
          stock INTEGER DEFAULT 0,
          category TEXT,
          description TEXT,
          size_us TEXT,
          size_eu TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session TEXT NOT NULL,
          product_id INTEGER,
          size TEXT,
          quantity INTEGER,
          currency TEXT,
          price REAL,
          FOREIGN KEY(product_id) REFERENCES products(id)
        )`,
        `CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session TEXT NOT NULL,
          user_id INTEGER,
          total REAL,
          currency TEXT,
          status TEXT DEFAULT 'pending',
          customer_name TEXT,
          customer_email TEXT,
          customer_phone TEXT,
          country TEXT,
          address TEXT,
          payment_method TEXT,
          notes TEXT,
          items_json TEXT,
          order_reference TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS contact_inquiries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT,
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          email TEXT,
          display_name TEXT
        )`,
      ];

  const migrations = db.isPostgres
    ? [
        'ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT',
      ]
    : [];

  db.serialize(() => {
    statements.forEach((sql) => db.run(sql));
    if (db.isPostgres) {
      migrations.forEach((sql) => db.run(sql, () => {}));
      done();
      return;
    }
    db.all('PRAGMA table_info(orders)', [], (err, cols) => {
      if (!err && cols && !cols.some((c) => c.name === 'user_id')) {
        db.run('ALTER TABLE orders ADD COLUMN user_id INTEGER');
      }
      db.all('PRAGMA table_info(users)', [], (err2, ucols) => {
        if (!err2 && ucols) {
          if (!ucols.some((c) => c.name === 'email')) db.run('ALTER TABLE users ADD COLUMN email TEXT');
          if (!ucols.some((c) => c.name === 'display_name')) db.run('ALTER TABLE users ADD COLUMN display_name TEXT');
        }
        done();
      });
    });
  });
}

const db = process.env.DATABASE_URL ? createPgDb(process.env.DATABASE_URL) : createSqliteDb();

module.exports = { db, initSchema, DB_PATH };
