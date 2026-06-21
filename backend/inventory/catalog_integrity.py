"""
Match product names to the correct static image — never assign cross-category images.
Only filenames that exist under core/static/core/images/ are used.
"""
from __future__ import annotations

from pathlib import Path

from inventory.product_image_map import EXACT_PRODUCT_IMAGE, image_for_product

# Category → fallback when slug file not yet on disk
CATEGORY_DEFAULT_IMAGE = {
    'Suits & Blazers': 'navy-mens-suit.png',
    'Dress Shirts': 'white-dress-shirt.png',
    'Trousers & Chinos': 'navy-chinos.png',
    'Casual Shirts': 'white-dress-shirt.png',
    'Knitwear': 'navy-sweater.png',
    'Outerwear': 'charcoal-overcoat.png',
    'Shoes': 'brown-oxford-shoes.png',
    'Accessories': 'cognac-leather-belt.png',
}

# Legacy keyword rules — only used if slug-mapped file is missing from disk
IMAGE_KEYWORD_RULES: list[tuple[tuple[str, ...], str, tuple[str, ...]]] = [
    (('aviator', 'sunglass'), 'aviator-sunglasses.png', ('Accessories',)),
    (('chronograph', 'watch'), 'silver-chronograph-watch.png', ('Accessories',)),
    (('cufflink',), 'sterling-cufflinks.png', ('Accessories',)),
    (('wallet', 'bifold', 'card holder'), 'black-leather-wallet.png', ('Accessories',)),
    (('tie', 'pocket square'), 'burgundy-silk-tie.png', ('Accessories',)),
    (('heritage cognac belt',), 'midnight-leather-belt.png', ('Accessories',)),
    (('belt', 'weekender strap'), 'cognac-leather-belt.png', ('Accessories',)),
    (('glove', 'beanie', 'tie bar'), 'burgundy-silk-tie.png', ('Accessories',)),
    (('black chelsea',), 'black-chelsea-boot.png', ('Shoes',)),
    (('tan chelsea', 'chelsea boot'), 'tan-chelsea-boot.png', ('Shoes',)),
    (('buckle', 'ankle boot'), 'tan-buckle-ankle-boot.png', ('Shoes',)),
    (('outdoor', 'lace boot'), 'brown-outdoor-lace-boot.png', ('Shoes',)),
    (('stitched', 'casual boot'), 'brown-stitched-casual-boot.png', ('Shoes',)),
    (('burgundy lace', 'burgundy lace boot'), 'burgundy-lace-boot.png', ('Shoes',)),
    (('lace dress boot',), 'brown-lace-dress-boot.png', ('Shoes',)),
    (('chukka',), 'navy-chukka-boot.png', ('Shoes',)),
    (('monk',), 'monk-strap-dress-shoe.png', ('Shoes',)),
    (('sneaker',), 'white-leather-sneaker.png', ('Shoes',)),
    (('penny loafer', 'suede loafer'), 'tan-suede-loafers.png', ('Shoes',)),
    (('brogue', 'wingtip'), 'cognac-wingtip-brogue.png', ('Shoes',)),
    (('wholecut',), 'burgundy-wholecut-oxford.png', ('Shoes',)),
    (('patent',), 'black-patent-formal-shoe.png', ('Shoes',)),
    (('derby',), 'black-cap-toe-derby.png', ('Shoes',)),
    (('loafer',), 'dark-brown-suede-loafer.png', ('Shoes',)),
    (('oxford', 'plain toe'), 'black-plain-toe-oxford.png', ('Shoes',)),
    (('oxford', 'derby', 'loafer', 'boot', 'monk', 'sneaker', 'brogue', 'chukka', 'shoe'), 'brown-oxford-shoes.png', ('Shoes',)),
    (('overcoat', 'trench', 'peacoat', 'topcoat', 'parka', 'gilet', 'puffer', 'raincoat', 'bomber', 'jacket', 'coat'), 'charcoal-overcoat.png', ('Outerwear',)),
    (('sweater', 'knit', 'cardigan', 'pullover', 'turtleneck', 'henley'), 'navy-sweater.png', ('Knitwear',)),
    (('chino', 'trouser', 'pant', 'cord'), 'navy-chinos.png', ('Trousers & Chinos',)),
    (('shirt', 'polo', 'flannel', 'linen', 'oxford', 'poplin', 'chambray', 'seersucker'), 'white-dress-shirt.png', ('Dress Shirts', 'Casual Shirts')),
    (('peak lapel tuxedo', 'black peak'), 'black-peak-lapel-tuxedo.png', ('Suits & Blazers',)),
    (('velvet dinner', 'burgundy velvet'), 'burgundy-velvet-dinner-jacket.png', ('Suits & Blazers',)),
    (('double-breasted',), 'tan-double-breasted-suit.png', ('Suits & Blazers',)),
    (('windowpane', 'prince of wales'), 'charcoal-windowpane-suit.png', ('Suits & Blazers',)),
    (('herringbone three', 'tweed three'), 'navy-tweed-three-piece-suit.png', ('Suits & Blazers',)),
    (('plaid',), 'brown-plaid-three-piece-suit.png', ('Suits & Blazers',)),
    (('pinstripe',), 'beige-pinstripe-suit.png', ('Suits & Blazers',)),
    (('light grey summer', 'light grey'), 'light-grey-summer-suit.png', ('Suits & Blazers',)),
    (('forest green sport', 'sport coat'), 'forest-green-sport-coat.png', ('Suits & Blazers',)),
    (('morning suit',), 'slim-morning-suit.png', ('Suits & Blazers',)),
    (('linen suit', 'linen blazer', 'sand beige'), 'sand-linen-suit.png', ('Suits & Blazers',)),
    (('midnight blue blazer', 'royal blue'), 'royal-blue-suit.png', ('Suits & Blazers',)),
    (('charcoal slim',), 'charcoal-windowpane-suit.png', ('Suits & Blazers',)),
    (('suit', 'blazer', 'tuxedo', 'sport coat'), 'navy-mens-suit.png', ('Suits & Blazers',)),
]

# Category keywords — product name should relate to category or it gets flagged
CATEGORY_NAME_HINTS = {
    'Suits & Blazers': ('suit', 'blazer', 'tuxedo', 'sport coat', 'morning suit', 'jacket', 'dinner', 'velvet', 'linen suit'),
    'Dress Shirts': ('shirt', 'poplin', 'oxford', 'cuff', 'collar', 'twill', 'broadcloth', 'marcella'),
    'Trousers & Chinos': ('chino', 'trouser', 'pant', 'cord', 'flannel', 'linen blend', 'wool pant'),
    'Casual Shirts': ('shirt', 'polo', 'linen', 'flannel', 'henley', 'chambray', 'camp collar', 'button-down', 'button down', 'seersucker', 'cuban', 'denim', 'rugby'),
    'Knitwear': ('sweater', 'knit', 'cardigan', 'pullover', 'turtleneck', 'merino', 'wool', 'crew', 'gauge', 'lambswool', 'cashmere', 'fisherman', 'quarter-zip', 'half-zip', 'shawl'),
    'Outerwear': ('coat', 'jacket', 'overcoat', 'trench', 'peacoat', 'parka', 'gilet', 'bomber', 'puffer', 'raincoat', 'car coat', 'barn', 'mackintosh', 'shearling', 'field', 'trucker', 'waxed', 'quilted', 'utility'),
    'Shoes': ('oxford', 'derby', 'loafer', 'boot', 'monk', 'sneaker', 'brogue', 'chukka', 'shoe', 'wholecut', 'penny', 'patent', 'suede'),
    'Accessories': ('belt', 'tie', 'watch', 'wallet', 'cufflink', 'sunglass', 'aviator', 'glove', 'beanie', 'pocket square', 'card holder', 'chronograph', 'strap', 'sterling', 'mayfair', 'heritage', 'atlas', 'monaco', 'regent', 'executive'),
}


def available_images(static_dir: Path) -> set[str]:
    if not static_dir.is_dir():
        return set()
    return {p.name for p in static_dir.glob('*.png') if not p.name.lower().startswith('screenshot')}


def name_matches_category(name: str, category: str) -> bool:
    hints = CATEGORY_NAME_HINTS.get(category, ())
    lower = name.lower()
    return any(h in lower for h in hints)


def resolve_image(name: str, category: str, static_dir: Path | None = None) -> tuple[str, bool, str]:
    """
    Returns (image_filename, is_exact_match, note).
    Each catalog product has a dedicated slug filename; exact match when that file exists.
    """
    images = available_images(static_dir) if static_dir else set(CATEGORY_DEFAULT_IMAGE.values()) | set(
        EXACT_PRODUCT_IMAGE.values()
    )

    normalized = name.strip().lower()
    preferred = EXACT_PRODUCT_IMAGE.get(normalized) or image_for_product(name)
    if preferred in images:
        return preferred, True, 'exact catalog match'

    lower = normalized
    for keywords, image, allowed_cats in IMAGE_KEYWORD_RULES:
        if category not in allowed_cats:
            continue
        if any(kw in lower for kw in keywords):
            if image in images:
                return image, False, f"fallback keyword ({', '.join(keywords)})"

    default = CATEGORY_DEFAULT_IMAGE.get(category, '')
    if default and default in images:
        return default, False, 'category representative image'

    return '', False, 'no valid image'


def build_description(name: str, category: str, note: str) -> str:
    base = {
        'Suits & Blazers': 'Tailored construction with refined fit for formal occasions.',
        'Dress Shirts': 'Premium cotton shirt with crisp collar and professional finish.',
        'Trousers & Chinos': 'Tailored leg with comfortable fit for office or weekend.',
        'Casual Shirts': 'Breathable fabric and relaxed cut for smart-casual wear.',
        'Knitwear': 'Soft knit layer with classic silhouette.',
        'Outerwear': 'Structured outer layer for cooler weather.',
        'Shoes': 'Hand-finished leather footwear with cushioned support.',
        'Accessories': 'Refined finishing piece for the complete look.',
    }.get(category, "Premium men's fashion piece.")
    if 'representative' in note:
        return f'{base} Product photo shows our {category.lower()} collection style.'
    return base


def audit_product(name: str, category: str, image: str, static_dir: Path) -> list[str]:
    """Return list of integrity issues for a product."""
    issues = []
    images = available_images(static_dir)
    if not image or image not in images:
        issues.append(f'Missing or invalid image: {image or "(empty)"}')
    if not name_matches_category(name, category):
        issues.append(f'Name "{name}" does not match category "{category}"')
    resolved, exact, _ = resolve_image(name, category, static_dir)
    if resolved and image != resolved:
        issues.append(f'Image should be {resolved}, got {image}')
    if image and image not in images:
        issues.append(f'Image file not on disk: {image}')
    return issues
