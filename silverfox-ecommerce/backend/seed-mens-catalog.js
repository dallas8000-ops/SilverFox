/**
 * Full men's catalog seed — at least 15 products per category (128 total).
 * Run: node seed-mens-catalog.js  (clears and re-seeds products)
 */
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const imagesDir = path.join(__dirname, '..', 'React', 'public', 'images');
const db = new sqlite3.Database(dbPath);

const MIN_PER_CATEGORY = 15;

const CATEGORY_META = {
  'Suits & Blazers': {
    priceMin: 180,
    priceMax: 520,
    stockMin: 3,
    stockMax: 14,
    usSizes: '38R,40R,42R,44R,46R,48R',
    euSizes: '48,50,52,54,56,58',
    description:
      'Expertly tailored suit with structured shoulders, smooth drape, and refined finishing for boardroom and formal occasions.',
    preferredImages: ['navy-mens-suit.png'],
  },
  'Dress Shirts': {
    priceMin: 55,
    priceMax: 145,
    stockMin: 8,
    stockMax: 32,
    usSizes: 'S,M,L,XL,XXL',
    euSizes: '48,50,52,54,56',
    description:
      'Premium cotton dress shirt with crisp collar, precise stitching, and a polished fit for professional wear.',
    preferredImages: ['white-dress-shirt.png'],
  },
  'Trousers & Chinos': {
    priceMin: 65,
    priceMax: 165,
    stockMin: 6,
    stockMax: 28,
    usSizes: '30,32,34,36,38,40',
    euSizes: '46,48,50,52,54',
    description:
      'Tailored trousers with clean lines, comfortable stretch, and versatile styling from office to evening.',
    preferredImages: ['navy-chinos.png'],
  },
  'Casual Shirts': {
    priceMin: 45,
    priceMax: 110,
    stockMin: 10,
    stockMax: 30,
    usSizes: 'S,M,L,XL,XXL',
    euSizes: '48,50,52,54,56',
    description:
      'Relaxed-fit casual shirt in breathable fabric — ideal for weekends, travel, and smart-casual dressing.',
    preferredImages: ['white-dress-shirt.png'],
  },
  Knitwear: {
    priceMin: 75,
    priceMax: 195,
    stockMin: 5,
    stockMax: 22,
    usSizes: 'S,M,L,XL,XXL',
    euSizes: '48,50,52,54,56',
    description:
      'Fine-gauge knit with soft hand-feel and classic silhouette — a refined layer for cooler days.',
    preferredImages: ['navy-sweater.png'],
  },
  Outerwear: {
    priceMin: 120,
    priceMax: 420,
    stockMin: 4,
    stockMax: 16,
    usSizes: 'S,M,L,XL,XXL',
    euSizes: '48,50,52,54,56',
    description:
      'Premium outerwear with structured cut and quality lining — built for warmth without sacrificing style.',
    preferredImages: ['charcoal-overcoat.png'],
  },
  Shoes: {
    priceMin: 95,
    priceMax: 385,
    stockMin: 4,
    stockMax: 18,
    usSizes: '8,9,10,11,12,13',
    euSizes: '41,42,43,44,45,46',
    description:
      'Hand-finished leather footwear with cushioned insole and durable sole — the foundation of a polished look.',
    preferredImages: ['brown-oxford-shoes.png'],
  },
  Accessories: {
    priceMin: 35,
    priceMax: 450,
    stockMin: 6,
    stockMax: 35,
    usSizes: 'One Size',
    euSizes: 'One Size',
    description:
      "Refined finishing touches — belts, ties, watches, and leather goods that complete the gentleman's wardrobe.",
    preferredImages: [
      'cognac-leather-belt.png',
      'midnight-leather-belt.png',
      'burgundy-silk-tie.png',
      'silver-chronograph-watch.png',
      'sterling-cufflinks.png',
      'black-leather-wallet.png',
      'aviator-sunglasses.png',
    ],
  },
};

const PRODUCT_NAMES = {
  'Suits & Blazers': [
    'Charcoal Slim-Fit Suit',
    'Navy Two-Piece Suit',
    'Midnight Blue Blazer',
    'Graphite Windowpane Suit',
    'Black Peak Lapel Tuxedo',
    'Herringbone Three-Piece Suit',
    'Italian Wool Double-Breasted Suit',
    'Light Grey Summer Suit',
    'Burgundy Velvet Dinner Jacket',
    'Tan Linen Blazer',
    'Pinstripe Executive Suit',
    'Forest Green Sport Coat',
    'Slim Fit Morning Suit',
    'Sand Beige Linen Suit',
    'Navy Shawl Collar Tuxedo',
    'Charcoal Prince of Wales Suit',
  ],
  'Dress Shirts': [
    'White Oxford Dress Shirt',
    'Light Blue Poplin Shirt',
    'French Cuff Formal Shirt',
    'Striped Business Shirt',
    'Slim Fit Spread Collar Shirt',
    'Pink Herringbone Dress Shirt',
    'Egyptian Cotton Non-Iron Shirt',
    'Micro Check Executive Shirt',
    'Ivory Twill Dress Shirt',
    'Sky Blue End-on-End Shirt',
    'Charcoal Tab Collar Shirt',
    'White Broadcloth Wing Collar Shirt',
    'Navy Bengal Stripe Shirt',
    'Lavender Fine Poplin Shirt',
    'Double Cuff Marcella Shirt',
    'Slim Fit Cutaway Collar Shirt',
  ],
  'Trousers & Chinos': [
    'Slim Navy Chinos',
    'Charcoal Dress Trousers',
    'Khaki Tailored Pants',
    'Grey Wool Trousers',
    'Stretch Slim Chinos',
    'Olive Garment-Dyed Chinos',
    'Black Formal Trousers',
    'Stone Cotton Twill Chinos',
    'Midnight Corduroy Trousers',
    'Camel Pleated Dress Pants',
    'Slim Fit Flannel Trousers',
    'Navy Performance Chinos',
    'Charcoal Tapered Wool Pants',
    'Sand Linen Blend Trousers',
    'Graphite Stretch Dress Pants',
    'British Tan Cord Trousers',
  ],
  'Casual Shirts': [
    'Navy Linen Shirt',
    'White Polo Shirt',
    'Checked Flannel Shirt',
    'Olive Casual Button-Down',
    'Striped Weekend Shirt',
    'Chambray Work Shirt',
    'Burgundy Brushed Cotton Shirt',
    'Short Sleeve Cuban Collar Shirt',
    'Indigo Denim Shirt',
    'Grey Melange Henley',
    'Forest Green Oxford Shirt',
    'White Linen Resort Shirt',
    'Navy Rugby Stripe Polo',
    'Sand Relaxed Camp Collar Shirt',
    'Charcoal Brushed Twill Shirt',
    'Sky Blue Seersucker Shirt',
  ],
  Knitwear: [
    'Merino V-Neck Sweater',
    'Charcoal Crew Neck Knit',
    'Navy Cable Knit Pullover',
    'Cashmere Blend Cardigan',
    'Roll Neck Wool Sweater',
    'Camel Shawl Collar Cardigan',
    'Forest Green Merino Polo Knit',
    'Heather Grey Half-Zip Sweater',
    'Burgundy Fine Gauge Crew',
    'Oatmeal Fisherman Rib Sweater',
    'Navy Quarter-Zip Knit',
    'Charcoal Merino Turtleneck',
    'Steel Blue Lambswool V-Neck',
    'Black Lightweight Merino Crew',
    'Sand Cotton-Cashmere Blend Knit',
    'Navy Windowpane Knit Blazer',
  ],
  Outerwear: [
    'Charcoal Wool Overcoat',
    'Navy Trench Coat',
    'Quilted Field Jacket',
    'Leather Bomber Jacket',
    'Camel Topcoat',
    'Black Peacoat',
    'Olive Utility Parka',
    'Navy Quilted Gilet',
    'Brown Suede Trucker Jacket',
    'Graphite Down Puffer Coat',
    'Herringbone Car Coat',
    'Waxed Cotton Barn Jacket',
    'Navy Double-Breasted Peacoat',
    'Charcoal Mackintosh Raincoat',
    'Tan Shearling Collar Jacket',
    'Midnight Wool Blend Overcoat',
  ],
  Shoes: [
    'Brown Leather Oxford',
    'Black Cap-Toe Derby',
    'Tan Suede Loafers',
    'Chelsea Boot',
    'Monk Strap Dress Shoe',
    'Burgundy Wholecut Oxford',
    'Black Patent Formal Shoe',
    'Tan Brogue Derby',
    'Navy Suede Chukka Boot',
    'Chocolate Double Monk Strap',
    'Grey Suede Penny Loafer',
    'Black Chelsea Boot',
    'Cognac Wingtip Brogue',
    'White Leather Sneaker',
    'Dark Brown Suede Loafer',
    'Black Plain Toe Oxford',
  ],
  Accessories: [
    'Cognac Leather Belt',
    'Burgundy Silk Tie',
    'Atlas Chronograph Watch',
    'Executive Bifold Wallet',
    'Regent Gold Cufflinks',
    'Monaco Aviator Sunglasses',
    'Heritage Cognac Belt',
    'Mayfair Silk Tie Set',
    'Navy Knitted Silk Tie',
    'Brown Leather Card Holder',
    'Sterling Tie Bar',
    'Charcoal Wool Pocket Square',
    'Black Leather Dress Gloves',
    'Navy Merino Beanie',
    'Tan Leather Weekender Strap',
    'Silver Dress Watch',
  ],
};

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

function buildImagePool() {
  const allImages = fs
    .readdirSync(imagesDir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort();
  if (!allImages.length) {
    console.error('No product images found in', imagesDir);
    process.exit(1);
  }
  return allImages;
}

function imageForProduct(category, index, allImages) {
  const meta = CATEGORY_META[category];
  const pool = [...new Set([...(meta.preferredImages || []), ...allImages])].filter((img) =>
    allImages.includes(img)
  );
  return pool[index % pool.length];
}

function buildCatalog(allImages) {
  const products = [];
  for (const [category, names] of Object.entries(PRODUCT_NAMES)) {
    if (names.length < MIN_PER_CATEGORY) {
      console.error(`Category "${category}" has only ${names.length} names; need ${MIN_PER_CATEGORY}.`);
      process.exit(1);
    }
    const meta = CATEGORY_META[category];
    names.forEach((name, index) => {
      const seed = hashCode(`${category}-${name}-${index}`);
      products.push({
        name,
        image: imageForProduct(category, index, allImages),
        price: priceFromRange(meta.priceMin, meta.priceMax, seed),
        stock: stockFromRange(meta.stockMin, meta.stockMax, seed),
        category,
        description: meta.description,
        size_us: meta.usSizes,
        size_eu: meta.euSizes,
      });
    });
  }
  return products;
}

const allImages = buildImagePool();
const products = buildCatalog(allImages);

const counts = {};
products.forEach((p) => {
  counts[p.category] = (counts[p.category] || 0) + 1;
});

console.log('Catalog breakdown:');
Object.entries(counts).forEach(([cat, n]) => console.log(`  ${cat}: ${n}`));
console.log(`Total: ${products.length} products`);

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
        console.log(`Seeded ${products.length} men's products (${MIN_PER_CATEGORY}+ per category).`);
      }
      db.close();
    });
  });
});
