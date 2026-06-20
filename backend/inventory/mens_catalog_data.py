"""Men's catalog seed data — 16 products × 8 categories (128 total)."""

MENS_CATEGORIES = [
    ('Suits & Blazers', 'Tailored suits and sharp blazers'),
    ('Dress Shirts', 'Oxford, poplin and formal shirts'),
    ('Trousers & Chinos', 'Tailored pants for every occasion'),
    ('Casual Shirts', 'Polos, linen and weekend shirts'),
    ('Knitwear', 'Sweaters, cardigans and layers'),
    ('Outerwear', 'Coats, jackets and overcoats'),
    ('Shoes', 'Oxfords, loafers and boots'),
    ('Accessories', 'Belts, watches, ties and more'),
]

CATEGORY_META = {
    'Suits & Blazers': {'price_min': 180, 'price_max': 520, 'sizes': '48,50,52,54,56', 'image': 'navy-mens-suit.png'},
    'Dress Shirts': {'price_min': 55, 'price_max': 145, 'sizes': '48,50,52,54,56', 'image': 'white-dress-shirt.png'},
    'Trousers & Chinos': {'price_min': 65, 'price_max': 165, 'sizes': '46,48,50,52,54', 'image': 'navy-chinos.png'},
    'Casual Shirts': {'price_min': 45, 'price_max': 110, 'sizes': '48,50,52,54,56', 'image': 'white-dress-shirt.png'},
    'Knitwear': {'price_min': 75, 'price_max': 195, 'sizes': '48,50,52,54,56', 'image': 'navy-sweater.png'},
    'Outerwear': {'price_min': 120, 'price_max': 420, 'sizes': '48,50,52,54,56', 'image': 'charcoal-overcoat.png'},
    'Shoes': {'price_min': 95, 'price_max': 385, 'sizes': '41,42,43,44,45', 'image': 'brown-oxford-shoes.png'},
    'Accessories': {'price_min': 35, 'price_max': 450, 'sizes': 'One Size', 'image': 'cognac-leather-belt.png'},
}

PRODUCT_NAMES = {
    'Suits & Blazers': [
        'Charcoal Slim-Fit Suit', 'Navy Two-Piece Suit', 'Midnight Blue Blazer', 'Graphite Windowpane Suit',
        'Black Peak Lapel Tuxedo', 'Herringbone Three-Piece Suit', 'Italian Wool Double-Breasted Suit',
        'Light Grey Summer Suit', 'Burgundy Velvet Dinner Jacket', 'Tan Linen Blazer', 'Pinstripe Executive Suit',
        'Forest Green Sport Coat', 'Slim Fit Morning Suit', 'Sand Beige Linen Suit', 'Navy Shawl Collar Tuxedo',
        'Charcoal Prince of Wales Suit',
    ],
    'Dress Shirts': [
        'White Oxford Dress Shirt', 'Light Blue Poplin Shirt', 'French Cuff Formal Shirt', 'Striped Business Shirt',
        'Slim Fit Spread Collar Shirt', 'Pink Herringbone Dress Shirt', 'Egyptian Cotton Non-Iron Shirt',
        'Micro Check Executive Shirt', 'Ivory Twill Dress Shirt', 'Sky Blue End-on-End Shirt', 'Charcoal Tab Collar Shirt',
        'White Broadcloth Wing Collar Shirt', 'Navy Bengal Stripe Shirt', 'Lavender Fine Poplin Shirt',
        'Double Cuff Marcella Shirt', 'Slim Fit Cutaway Collar Shirt',
    ],
    'Trousers & Chinos': [
        'Slim Navy Chinos', 'Charcoal Dress Trousers', 'Khaki Tailored Pants', 'Grey Wool Trousers',
        'Stretch Slim Chinos', 'Olive Garment-Dyed Chinos', 'Black Formal Trousers', 'Stone Cotton Twill Chinos',
        'Midnight Corduroy Trousers', 'Camel Pleated Dress Pants', 'Slim Fit Flannel Trousers', 'Navy Performance Chinos',
        'Charcoal Tapered Wool Pants', 'Sand Linen Blend Trousers', 'Graphite Stretch Dress Pants', 'British Tan Cord Trousers',
    ],
    'Casual Shirts': [
        'Navy Linen Shirt', 'White Polo Shirt', 'Checked Flannel Shirt', 'Olive Casual Button-Down',
        'Striped Weekend Shirt', 'Chambray Work Shirt', 'Burgundy Brushed Cotton Shirt', 'Short Sleeve Cuban Collar Shirt',
        'Indigo Denim Shirt', 'Grey Melange Henley', 'Forest Green Oxford Shirt', 'White Linen Resort Shirt',
        'Navy Rugby Stripe Polo', 'Sand Relaxed Camp Collar Shirt', 'Charcoal Brushed Twill Shirt', 'Sky Blue Seersucker Shirt',
    ],
    'Knitwear': [
        'Merino V-Neck Sweater', 'Charcoal Crew Neck Knit', 'Navy Cable Knit Pullover', 'Cashmere Blend Cardigan',
        'Roll Neck Wool Sweater', 'Camel Shawl Collar Cardigan', 'Forest Green Merino Polo Knit', 'Heather Grey Half-Zip Sweater',
        'Burgundy Fine Gauge Crew', 'Oatmeal Fisherman Rib Sweater', 'Navy Quarter-Zip Knit', 'Charcoal Merino Turtleneck',
        'Steel Blue Lambswool V-Neck', 'Black Lightweight Merino Crew', 'Sand Cotton-Cashmere Blend Knit', 'Navy Windowpane Knit Blazer',
    ],
    'Outerwear': [
        'Charcoal Wool Overcoat', 'Navy Trench Coat', 'Quilted Field Jacket', 'Leather Bomber Jacket', 'Camel Topcoat',
        'Black Peacoat', 'Olive Utility Parka', 'Navy Quilted Gilet', 'Brown Suede Trucker Jacket', 'Graphite Down Puffer Coat',
        'Herringbone Car Coat', 'Waxed Cotton Barn Jacket', 'Navy Double-Breasted Peacoat', 'Charcoal Mackintosh Raincoat',
        'Tan Shearling Collar Jacket', 'Midnight Wool Blend Overcoat',
    ],
    'Shoes': [
        'Brown Leather Oxford', 'Black Cap-Toe Derby', 'Tan Suede Loafers', 'Chelsea Boot', 'Monk Strap Dress Shoe',
        'Burgundy Wholecut Oxford', 'Black Patent Formal Shoe', 'Tan Brogue Derby', 'Navy Suede Chukka Boot',
        'Chocolate Double Monk Strap', 'Grey Suede Penny Loafer', 'Black Chelsea Boot', 'Cognac Wingtip Brogue',
        'White Leather Sneaker', 'Dark Brown Suede Loafer', 'Black Plain Toe Oxford',
    ],
    'Accessories': [
        'Cognac Leather Belt', 'Burgundy Silk Tie', 'Atlas Chronograph Watch', 'Executive Bifold Wallet', 'Regent Gold Cufflinks',
        'Monaco Aviator Sunglasses', 'Heritage Cognac Belt', 'Mayfair Silk Tie Set', 'Navy Knitted Silk Tie',
        'Brown Leather Card Holder', 'Sterling Tie Bar', 'Charcoal Wool Pocket Square', 'Black Leather Dress Gloves',
        'Navy Merino Beanie', 'Tan Leather Weekender Strap', 'Silver Dress Watch',
    ],
}

DESCRIPTIONS = {
    'Suits & Blazers': 'Expertly tailored suit with structured shoulders and refined finishing.',
    'Dress Shirts': 'Premium cotton dress shirt with crisp collar and polished fit.',
    'Trousers & Chinos': 'Tailored trousers with clean lines and versatile styling.',
    'Casual Shirts': 'Relaxed-fit casual shirt in breathable fabric.',
    'Knitwear': 'Fine-gauge knit with soft hand-feel and classic silhouette.',
    'Outerwear': 'Premium outerwear built for warmth without sacrificing style.',
    'Shoes': 'Hand-finished leather footwear — the foundation of a polished look.',
    'Accessories': "Refined finishing touches for the gentleman's wardrobe.",
}

IMAGE_POOL = [
    'navy-mens-suit.png', 'white-dress-shirt.png', 'navy-chinos.png', 'navy-sweater.png',
    'charcoal-overcoat.png', 'brown-oxford-shoes.png', 'cognac-leather-belt.png', 'burgundy-silk-tie.png',
    'silver-chronograph-watch.png', 'sterling-cufflinks.png', 'black-leather-wallet.png', 'aviator-sunglasses.png',
    'midnight-leather-belt.png',
]
