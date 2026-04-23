/**
 * SilverFox Data Validation Module
 * Comprehensive validation for products, users, orders, and form data
 * Implements data integrity and business logic validation
 */

// ============================================
// PRODUCT VALIDATION
// ============================================

/**
 * Validate product data for creation/update
 * @param {Object} product - Product object to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateProduct(product, isUpdate = false) {
  const errors = [];

  // Name validation
  if (!product.name) {
    errors.push('Product name is required');
  } else if (product.name.trim().length < 3) {
    errors.push('Product name must be at least 3 characters');
  } else if (product.name.length > 200) {
    errors.push('Product name cannot exceed 200 characters');
  }

  // Price validation
  if (product.price === undefined || product.price === null) {
    errors.push('Price is required');
  } else if (isNaN(product.price) || parseFloat(product.price) < 0) {
    errors.push('Price must be a valid positive number');
  } else if (parseFloat(product.price) > 1000000) {
    errors.push('Price cannot exceed 1,000,000');
  }

  // Stock validation
  if (product.stock === undefined || product.stock === null) {
    errors.push('Stock quantity is required');
  } else if (!Number.isInteger(parseInt(product.stock)) || parseInt(product.stock) < 0) {
    errors.push('Stock must be a non-negative integer');
  }

  // Category validation (optional but if provided, validate)
  if (product.category && product.category.trim().length > 100) {
    errors.push('Category name cannot exceed 100 characters');
  }

  // Description validation (optional but if provided, validate)
  if (product.description && product.description.length > 1000) {
    errors.push('Description cannot exceed 1000 characters');
  }

  // Image validation (optional but if provided, validate format)
  if (product.image) {
    if (typeof product.image !== 'string') {
      errors.push('Image must be a string (filename or URL)');
    } else if (!isValidImageFilename(product.image)) {
      errors.push('Invalid image filename or format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================
// USER/ADMIN VALIDATION
// ============================================

/**
 * Validate user credentials for registration
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateUserRegistration(username, password) {
  const errors = [];

  // Username validation
  if (!username) {
    errors.push('Username is required');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  } else if (username.length > 50) {
    errors.push('Username cannot exceed 50 characters');
  } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  } else if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit');
  } else if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate user login credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateUserLogin(username, password) {
  const errors = [];

  if (!username || username.trim() === '') {
    errors.push('Username is required');
  }

  if (!password || password === '') {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================
// ORDER/CART VALIDATION
// ============================================

/**
 * Validate cart item
 * @param {Object} item - Cart item with productId and quantity
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateCartItem(item) {
  const errors = [];

  if (!item.productId && item.productId !== 0) {
    errors.push('Product ID is required');
  } else if (!Number.isInteger(item.productId) || item.productId < 0) {
    errors.push('Product ID must be a positive integer');
  }

  if (!item.quantity) {
    errors.push('Quantity is required');
  } else if (!Number.isInteger(parseInt(item.quantity)) || parseInt(item.quantity) < 1) {
    errors.push('Quantity must be a positive integer');
  } else if (parseInt(item.quantity) > 1000) {
    errors.push('Quantity cannot exceed 1000');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate checkout/order data
 * @param {Object} order - Order object
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateCheckout(order) {
  const errors = [];

  // Cart items validation
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    order.items.forEach((item, index) => {
      const itemValidation = validateCartItem(item);
      if (!itemValidation.isValid) {
        itemValidation.errors.forEach(err => {
          errors.push(`Item ${index + 1}: ${err}`);
        });
      }
    });
  }

  // Total validation
  if (order.total === undefined || order.total === null) {
    errors.push('Order total is required');
  } else if (isNaN(order.total) || parseFloat(order.total) <= 0) {
    errors.push('Order total must be a positive number');
  }

  // Currency validation
  if (!order.currency) {
    errors.push('Currency is required');
  } else if (!['EUR', 'USD', 'GBP', 'UGX', 'KES'].includes(order.currency)) {
    errors.push('Invalid currency. Accepted: EUR, USD, GBP, UGX, KES');
  }

  // Email validation (optional but if provided)
  if (order.email && !isValidEmail(order.email)) {
    errors.push('Invalid email format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================
// HELPER VALIDATION FUNCTIONS
// ============================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate image filename
 * @param {string} filename - Image filename
 * @returns {boolean}
 */
function isValidImageFilename(filename) {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension) && filename.length > 0 && filename.length < 255;
}

/**
 * Sanitize user input (prevent XSS)
 * @param {string} input - User input
 * @returns {string}
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Validate product quantity against available stock
 * @param {number} requestedQuantity - Quantity requested
 * @param {number} availableStock - Available stock
 * @returns {boolean}
 */
function isStockAvailable(requestedQuantity, availableStock) {
  return requestedQuantity > 0 && requestedQuantity <= availableStock;
}

/**
 * Validate discount code format
 * @param {string} code - Discount code
 * @returns {boolean}
 */
function isValidDiscountCode(code) {
  return /^[A-Z0-9]{3,20}$/.test(code);
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  validateProduct,
  validateUserRegistration,
  validateUserLogin,
  validateCartItem,
  validateCheckout,
  isValidEmail,
  isValidImageFilename,
  sanitizeInput,
  isStockAvailable,
  isValidDiscountCode
};
