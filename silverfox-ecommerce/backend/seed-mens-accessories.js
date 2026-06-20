const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

const products = [
  {
    name: 'Heritage Cognac Belt',
    image: 'midnight-leather-belt.png',
    price: 89.0,
    stock: 24,
    category: 'Belts & Leather',
    description: 'Full-grain cognac leather belt with polished gold buckle. A wardrobe essential that pairs with denim or tailored trousers.',
    size_us: '32,34,36,38,40,42',
    size_eu: '80,85,90,95,100,105',
  },
  {
    name: 'Atlas Chronograph',
    image: 'silver-chronograph-watch.png',
    price: 349.0,
    stock: 12,
    category: 'Watches',
    description: 'Precision chronograph with deep blue dial, silver case, and hand-stitched brown leather strap. Water-resistant to 50m.',
    size_us: '40mm,42mm,44mm',
    size_eu: '40mm,42mm,44mm',
  },
  {
    name: 'Regent Gold Cufflinks',
    image: 'sterling-cufflinks.png',
    price: 125.0,
    stock: 18,
    category: 'Cufflinks',
    description: 'Polished gold cufflinks with deep navy enamel inlay. The perfect finishing touch for boardroom and black-tie occasions.',
    size_us: 'One Size',
    size_eu: 'One Size',
  },
  {
    name: 'Executive Bifold Wallet',
    image: 'black-leather-wallet.png',
    price: 79.0,
    stock: 30,
    category: 'Wallets',
    description: 'Hand-finished chocolate brown leather bifold with RFID blocking. Slim profile, eight card slots, and a bill compartment.',
    size_us: 'One Size',
    size_eu: 'One Size',
  },
  {
    name: 'Mayfair Silk Tie',
    image: 'navy-silk-tie.png',
    price: 65.0,
    stock: 22,
    category: 'Ties & Squares',
    description: '100% silk tie in rich burgundy with a subtle navy stripe. Hand-rolled edges and a classic 3.25" width.',
    size_us: 'Standard',
    size_eu: 'Standard',
  },
  {
    name: 'Monaco Aviators',
    image: 'aviator-sunglasses.png',
    price: 189.0,
    stock: 15,
    category: 'Eyewear',
    description: 'Rose gold aviator frames with warm amber gradient lenses. UV400 protection with anti-reflective coating.',
    size_us: 'One Size',
    size_eu: 'One Size',
  },
  {
    name: 'Oxford Leather Briefcase',
    image: 'leather-briefcase.png',
    price: 425.0,
    stock: 8,
    category: 'Bags',
    description: 'Handcrafted tan cognac briefcase with brass hardware. Fits a 15" laptop with dedicated organizer pockets.',
    size_us: 'One Size',
    size_eu: 'One Size',
  },
  {
    name: 'Heritage Pocket Square Set',
    image: 'silk-pocket-squares.png',
    price: 55.0,
    stock: 20,
    category: 'Ties & Squares',
    description: 'Set of three silk pocket squares in emerald, burgundy, and navy. Pre-folded presentation packaging included.',
    size_us: 'One Size',
    size_eu: 'One Size',
  },
];

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
        console.log(`Seeded ${products.length} men's accessory products.`);
      }
      db.close();
    });
  });
});
