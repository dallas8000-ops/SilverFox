/**
 * Basic API smoke tests for CI (Node built-in test runner).
 */
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

process.env.SESSION_SECRET = 'test-secret';
process.env.DB_PATH = path.join(__dirname, 'test-db.sqlite');
process.env.DEFAULT_ADMIN_USER = 'admin';
process.env.DEFAULT_ADMIN_PASSWORD = 'admin';
process.env.NODE_ENV = 'test';

const TEST_DB = process.env.DB_PATH;
if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);

let server;
let baseUrl;

before(async () => {
  const { server: srv } = require('../index');
  server = srv;
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
});

after(() => new Promise((resolve) => {
  const mod = require('../index');
  const finish = () => {
    try {
      if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
    } catch { /* ignore locked file on Windows */ }
    resolve();
  };
  if (server) {
    server.close(() => mod.db.close(finish));
  } else {
    finish();
  }
}));

function request(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    const opts = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('SilverFox API', () => {
  it('GET /health returns ok', async () => {
    const res = await request('GET', '/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'silverfox');
  });

  it('GET /api/products returns array', async () => {
    const res = await request('GET', '/api/products');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });

  it('POST /api/login with admin credentials', async () => {
    const res = await request('POST', '/api/login', { username: 'admin', password: 'admin' });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('POST /api/contact stores inquiry', async () => {
    const res = await request('POST', '/api/contact', {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'CI test',
      message: 'Automated test message',
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.success);
  });
});
