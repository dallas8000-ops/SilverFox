const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

const categories = [
  {
    name: 'Suits & Blazers',
    priceMin: 180,
    priceMax: 450,
    stockMin: 3,
    stockMax: 12,
    usSizes: '38R,40R,42R,44R,46R',
    euSizes: '48,50,52,54,56',
    description:
      'Expertly tailored suit with structured shoulders, smooth drape, and refined finishing for boardroom and formal occasions.',
  },
  {
    name: 'Dress Shirts',
    priceMin: 55,
    priceMax: 120,
    stockMin: 8,
    stockMax: 30,
    usSizes: 'S,M,L,XL,XXL',
    euSizes: '48,50,52,54,56',
    description:
      'Premium cotton dress shirt with crisp collar, precise stitching, and a polished fit for professional wear.',
  },
  {
    name: 'Trousers & Chinos',
    priceMin: 65,
    priceMax: 145,
    stockMin: 6,
    stockMax: 24,
    usSizes: '30,32,34,36,38,40',
    euSizes: '46,48,50,52,54',
    description:
      'Tailored trousers with clean lines, comfortable stretch, and versatile styling from office to evening.',
  },
  {
    name: 'Casual Shirts',
    priceMin: 45,
    priceMax: 95,
    stockMin: 10,
    stockMax: 28,
    usSizes: 'S,M,L,XL,XXL',
    euSizes: '48,50,52,54,56',
    description:
      'Relaxed-fit casual shirt in breathable fabric — ideal for weekends, travel, and smart-casual dressing.',
  },
  {
    name: 'Knitwear',
    priceMin: 75,
    priceMax: 165,
    stockMin: 5,
    stockMax: 18,
    usSizes: 'S,M,L,XL,XXL',
    euSizes: '48,50,52,54,56',
    description:
      'Fine-gauge knit with soft hand-feel and classic silhouette — a refined layer for cooler days.',
  },
  {
    name: 'Outerwear',
    priceMin: 120,
    priceMax: 380,
    stockMin: 4,
    stockMax: 14,
    usSizes: 'S,M,L,XL,XXL',
    euSizes: '48,50,52,54,56',
    description:
      'Premium outerwear with structured cut and quality lining — built for warmth without sacrificing style.',
  },
  {
    name: 'Shoes',
    priceMin: 95,
    priceMax: 320,
    stockMin: 4,
    stockMax: 16,
    usSizes: '8,9,10,11,12',
    euSizes: '41,42,43,44,45',
    description:
      'Hand-finished leather footwear with cushioned insole and durable sole — the foundation of a polished look.',
  },
  {
    name: 'Accessories',
    priceMin: 35,
    priceMax: 350,
    stockMin: 6,
    stockMax: 30,
    usSizes: 'One Size',
    euSizes: 'One Size',
    description:
      'Refined finishing touches — belts, ties, watches, and leather goods that complete the gentleman\'s wardrobe.',
  },
];

const mensNames = [
  'Charcoal Slim-Fit Suit', 'Navy Two-Piece Suit', 'White Oxford Shirt',
  'Slim Navy Chinos', 'Merino V-Neck Sweater', 'Wool Overcoat',
  'Brown Leather Oxford', 'Cognac Leather Belt', 'Midnight Blue Blazer',
  'Light Blue Poplin Shirt', 'Khaki Tailored Pants', 'Navy Linen Shirt',
  'Charcoal Crew Neck Knit', 'Navy Trench Coat', 'Black Cap-Toe Derby',
  'Silk Tie Set', 'Graphite Windowpane Suit', 'French Cuff Shirt',
  'Grey Wool Trousers', 'White Polo Shirt', 'Cashmere Cardigan',
  'Leather Bomber Jacket', 'Tan Suede Loafers', 'Chronograph Watch',
  'Black Peak Lapel Tuxedo', 'Striped Business Shirt', 'Stretch Slim Chinos',
  'Checked Flannel Shirt', 'Navy Cable Knit', 'Camel Topcoat', 'Chelsea Boot',
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
  return Number((min + (seed % (max - min + 1))).toFixed(2));
}

function stockFromRange(min, max, seed) {
  return min + (seed % (max - min + 1));
}

function titleFromImage(image, index) {
  return mensNames[index % mensNames.length];
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
          console.log(`Enriched ${rows.length} products with men's clothing data.`);
          db.close();
        }
      }
    );
  });
});
