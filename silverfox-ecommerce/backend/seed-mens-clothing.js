const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const imagesDir = path.join(__dirname, '..', 'React', 'public', 'images');
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
    names: [
      'Charcoal Slim-Fit Suit',
      'Navy Two-Piece Suit',
      'Midnight Blue Blazer',
      'Graphite Windowpane Suit',
      'Black Peak Lapel Tuxedo',
    ],
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
    names: [
      'White Oxford Dress Shirt',
      'Light Blue Poplin Shirt',
      'French Cuff Formal Shirt',
      'Striped Business Shirt',
      'Slim Fit Spread Collar Shirt',
    ],
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
    names: [
      'Slim Navy Chinos',
      'Charcoal Dress Trousers',
      'Khaki Tailored Pants',
      'Grey Wool Trousers',
      'Stretch Slim Chinos',
    ],
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
    names: [
      'Navy Linen Shirt',
      'White Polo Shirt',
      'Checked Flannel Shirt',
      'Olive Casual Button-Down',
      'Striped Weekend Shirt',
    ],
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
    names: [
      'Merino V-Neck Sweater',
      'Charcoal Crew Neck Knit',
      'Navy Cable Knit Pullover',
      'Cashmere Blend Cardigan',
      'Roll Neck Wool Sweater',
    ],
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
    names: [
      'Wool Overcoat',
      'Navy Trench Coat',
      'Quilted Field Jacket',
      'Leather Bomber Jacket',
      'Camel Topcoat',
    ],
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
    names: [
      'Brown Leather Oxford',
      'Black Cap-Toe Derby',
      'Tan Suede Loafers',
      'Chelsea Boot',
      'Monk Strap Dress Shoe',
    ],
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
    names: [
      'Cognac Leather Belt',
      'Silk Tie & Pocket Square Set',
      'Chronograph Watch',
      'Leather Bifold Wallet',
      'Sterling Cufflinks',
    ],
    description:
      'Refined finishing touches — belts, ties, watches, and leather goods that complete the gentleman\'s wardrobe.',
  },
];

function hashCode(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function priceFromRange(min, max, seed) {
  return Number((min + (seed % (max - min + 1))).toFixed(2));
}

function stockFromRange(min, max, seed) {
  return min + (seed % (max - min + 1));
}

function pickCategory(seed) {
  return categories[seed % categories.length];
}

function productName(category, seed, index) {
  const names = category.names;
  return names[seed % names.length] + (index > names.length ? ` ${index + 1}` : '');
}

const AI_PRODUCTS = {
  'navy-mens-suit.png': { name: 'Navy Two-Piece Suit', category: 'Suits & Blazers', price: 389, stock: 8 },
  'white-dress-shirt.png': { name: 'White Oxford Dress Shirt', category: 'Dress Shirts', price: 79, stock: 24 },
  'brown-oxford-shoes.png': { name: 'Brown Leather Oxford', category: 'Shoes', price: 245, stock: 12 },
  'charcoal-overcoat.png': { name: 'Charcoal Wool Overcoat', category: 'Outerwear', price: 320, stock: 6 },
  'navy-chinos.png': { name: 'Slim Navy Chinos', category: 'Trousers & Chinos', price: 89, stock: 18 },
  'navy-sweater.png': { name: 'Merino V-Neck Sweater', category: 'Knitwear', price: 125, stock: 15 },
  'cognac-leather-belt.png': { name: 'Cognac Leather Belt', category: 'Accessories', price: 69, stock: 30 },
  'burgundy-silk-tie.png': { name: 'Burgundy Silk Tie', category: 'Accessories', price: 55, stock: 22 },
  'midnight-leather-belt.png': { name: 'Heritage Cognac Belt', category: 'Accessories', price: 89, stock: 20 },
  'silver-chronograph-watch.png': { name: 'Atlas Chronograph', category: 'Accessories', price: 349, stock: 10 },
  'sterling-cufflinks.png': { name: 'Regent Gold Cufflinks', category: 'Accessories', price: 125, stock: 16 },
  'black-leather-wallet.png': { name: 'Executive Bifold Wallet', category: 'Accessories', price: 79, stock: 28 },
  'aviator-sunglasses.png': { name: 'Monaco Aviators', category: 'Accessories', price: 189, stock: 14 },
};

const imageFiles = fs
  .readdirSync(imagesDir)
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort();

if (!imageFiles.length) {
  console.error('No product images found in', imagesDir);
  db.close();
  process.exit(1);
}

const products = imageFiles.map((image, index) => {
  const ai = AI_PRODUCTS[image];
  if (ai) {
    const category = categories.find((c) => c.name === ai.category) || categories[0];
    return {
      name: ai.name,
      image,
      price: ai.price,
      stock: ai.stock,
      category: ai.category,
      description: category.description,
      size_us: category.usSizes,
      size_eu: category.euSizes,
    };
  }
  const seed = hashCode(`${image}-${index}`);
  const category = pickCategory(seed);
  return {
    name: productName(category, seed, index),
    image,
    price: priceFromRange(category.priceMin, category.priceMax, seed),
    stock: stockFromRange(category.stockMin, category.stockMax, seed),
    category: category.name,
    description: category.description,
    size_us: category.usSizes,
    size_eu: category.euSizes,
  };
});

db.serialize(() => {
  db.run('DELETE FROM products', (err) => {
    if (err) {
      console.error('Failed to clear products:', err.message);
      db.close();
      return;
    }

    const stmt = db.prepare(
      `INSERT INTO products (name, image, price, stock, category, description, size_us, size_eu)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    products.forEach((p) => {
      stmt.run(p.name, p.image, p.price, p.stock, p.category, p.description, p.size_us, p.size_eu);
    });

    stmt.finalize((finalizeErr) => {
      if (finalizeErr) {
        console.error('Failed to seed products:', finalizeErr.message);
      } else {
        console.log(`Seeded ${products.length} men's clothing products across ${categories.length} categories.`);
      }
      db.close();
    });
  });
});
