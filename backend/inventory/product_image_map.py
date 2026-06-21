"""One unique static image filename per catalog product (128 total)."""
from __future__ import annotations

import re

from inventory.mens_catalog_data import PRODUCT_NAMES

# Pre-generated studio assets — keep these filenames for existing PNGs on disk.
IMAGE_OVERRIDES: dict[str, str] = {
    # Shoes (16 unique)
    'brown leather oxford': 'brown-oxford-shoes.png',
    'black cap-toe derby': 'black-cap-toe-derby.png',
    'tan suede loafers': 'tan-suede-loafers.png',
    'tan chelsea boot': 'tan-chelsea-boot.png',
    'monk strap dress shoe': 'monk-strap-dress-shoe.png',
    'burgundy wholecut oxford': 'burgundy-wholecut-oxford.png',
    'black patent formal shoe': 'black-patent-formal-shoe.png',
    'tan brogue derby': 'tan-brogue-derby.png',
    'brown lace dress boot': 'brown-lace-dress-boot.png',
    'brown stitched casual boot': 'brown-stitched-casual-boot.png',
    'tan buckle ankle boot': 'tan-buckle-ankle-boot.png',
    'black chelsea boot': 'black-chelsea-boot.png',
    'cognac wingtip brogue': 'cognac-wingtip-brogue.png',
    'brown outdoor lace boot': 'brown-outdoor-lace-boot.png',
    'burgundy lace boot': 'burgundy-lace-boot.png',
    'black plain toe oxford': 'black-plain-toe-oxford.png',
    # Suits & Blazers (16 unique)
    'charcoal slim-fit suit': 'charcoal-windowpane-suit.png',
    'navy two-piece suit': 'navy-mens-suit.png',
    'midnight blue blazer': 'royal-blue-suit.png',
    'graphite windowpane suit': 'graphite-windowpane-suit.png',
    'black peak lapel tuxedo': 'black-peak-lapel-tuxedo.png',
    'herringbone three-piece suit': 'navy-tweed-three-piece-suit.png',
    'italian wool double-breasted suit': 'tan-double-breasted-suit.png',
    'light grey summer suit': 'light-grey-summer-suit.png',
    'burgundy velvet dinner jacket': 'burgundy-velvet-dinner-jacket.png',
    'tan linen blazer': 'tan-linen-blazer.png',
    'pinstripe executive suit': 'beige-pinstripe-suit.png',
    'forest green sport coat': 'forest-green-sport-coat.png',
    'slim fit morning suit': 'slim-morning-suit.png',
    'sand beige linen suit': 'sand-linen-suit.png',
    'navy shawl collar tuxedo': 'navy-shawl-collar-tuxedo.png',
    'charcoal prince of wales suit': 'brown-plaid-three-piece-suit.png',
    # Accessories — dedicated assets
    'cognac leather belt': 'cognac-leather-belt.png',
    'burgundy silk tie': 'burgundy-silk-tie.png',
    'atlas chronograph watch': 'silver-chronograph-watch.png',
    'executive bifold wallet': 'black-leather-wallet.png',
    'regent gold cufflinks': 'sterling-cufflinks.png',
    'monaco aviator sunglasses': 'aviator-sunglasses.png',
    'heritage cognac belt': 'midnight-leather-belt.png',
    # Representative defaults reused only when slug file missing (legacy)
    'white oxford dress shirt': 'white-dress-shirt.png',
    'slim navy chinos': 'navy-chinos.png',
    'merino v-neck sweater': 'navy-sweater.png',
    'charcoal wool overcoat': 'charcoal-overcoat.png',
}


def product_image_slug(name: str) -> str:
    s = name.lower().replace('&', 'and')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return f'{s}.png'


def image_for_product(name: str) -> str:
    key = name.strip().lower()
    return IMAGE_OVERRIDES.get(key, product_image_slug(name))


def build_exact_product_image() -> dict[str, str]:
    mapping: dict[str, str] = {}
    for names in PRODUCT_NAMES.values():
        for name in names:
            mapping[name.strip().lower()] = image_for_product(name)
    return mapping


EXACT_PRODUCT_IMAGE = build_exact_product_image()
