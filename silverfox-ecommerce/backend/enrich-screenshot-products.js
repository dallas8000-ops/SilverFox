const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

const categories = [
  {
    name: 'Dresses',
    priceMin: 85,
    priceMax: 145,
    stockMin: 4,
    stockMax: 14,
    usSizes: 'US 4,6,8,10,12',
    euSizes: 'EU 36,38,40,42,44',
    description:
      'Elegant occasion dress with premium finishing, flattering silhouette, and comfortable structured lining for all-day wear.',
  },
  {
    name: 'Suits',
    priceMin: 140,
    priceMax: 240,
    stockMin: 2,
    stockMax: 9,
    usSizes: 'US 6,8,10,12,14',
    euSizes: 'EU 38,40,42,44,46',
    description:
      'Tailored suit set with polished cut, smooth drape, and versatile styling suited for professional and formal occasions.',
  },
  {
    name: 'Cocktail & Evening',
    priceMin: 120,
    priceMax: 210,
    stockMin: 3,
    stockMax: 10,
    usSizes: 'US 4,6,8,10',
    euSizes: 'EU 36,38,40,42',
    description:
      'Statement evening piece featuring refined details and balanced structure, designed to deliver a confident luxury look.',
  },
  {
    name: 'Daywear',
    priceMin: 65,
    priceMax: 120,
    stockMin: 6,
    stockMax: 20,
    usSizes: 'US 2,4,6,8,10,12',
    euSizes: 'EU 34,36,38,40,42,44',
    description:
      'Modern daywear essential with breathable comfort, clean lines, and easy styling from workday to weekend.',
  },
];

function hashCode(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickCategory(seed) {
  return categories[seed % categories.length];
}

function priceFromRange(min, max, seed) {
  const spread = max - min;
  const step = (seed % (spread + 1));
  return Number((min + step).toFixed(2));
}

function stockFromRange(min, max, seed) {
  const spread = max - min;
  return min + (seed % (spread + 1));
}

function titleFromImage(image, index) {
  const core = (image || '').replace(/\.[^.]+$/, '');
  const numeric = core.match(/(\d{6,})/g);
  const suffix = numeric && numeric.length ? numeric[numeric.length - 1].slice(-4) : String(index + 1).padStart(3, '0');
  return `Signature Look ${suffix}`;
}

db.all("SELECT id, name, image FROM products WHERE image LIKE 'Screenshot %'", [], (err, rows) => {
  if (err) {
    console.error('Failed to load products:', err.message);
    db.close();
    return;
  }

  if (!rows.length) {
    console.log('No screenshot products found for enrichment.');
    db.close();
    return;
  }

  let completed = 0;

  rows.forEach((row, index) => {
    const seed = hashCode(`${row.id}-${row.image || row.name || ''}`);
    const category = pickCategory(seed);
    const price = priceFromRange(category.priceMin, category.priceMax, seed);
    const stock = stockFromRange(category.stockMin, category.stockMax, seed);
    const name = titleFromImage(row.image, index);

    db.run(
      `UPDATE products
       SET name = ?,
           price = ?,
           stock = ?,
           category = ?,
           description = ?,
           size_us = ?,
           size_eu = ?
       WHERE id = ?`,
      [
        name,
        price,
        stock,
        category.name,
        category.description,
        category.usSizes,
        category.euSizes,
        row.id,
      ],
      (updateErr) => {
        if (updateErr) {
          console.error(`Failed to enrich product ${row.id}:`, updateErr.message);
        }
        completed += 1;
        if (completed === rows.length) {
          console.log(`Enriched ${rows.length} screenshot products with realistic pricing, sizes, and descriptions.`);
          db.close();
        }
      }
    );
  });
});
