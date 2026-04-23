const path = require('path');

/**
 * Canonical product image directory for this project.
 * - SQLite `products.image` = filename only (e.g. `photo.jpg`) or `/uploads/...` for uploads
 * - URLs are always `/images/<filename>` (Express + Vite both serve this folder)
 * Do not add a second "images" tree under kistie-store/ for inventory—use this path only.
 */
const PRODUCT_IMAGES_DIR = path.join(__dirname, '..', 'React', 'public', 'images');

module.exports = { PRODUCT_IMAGES_DIR };
