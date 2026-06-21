from pathlib import Path
from django.test import TestCase

from inventory.catalog_integrity import resolve_image, name_matches_category
from inventory.mens_catalog_data import PRODUCT_NAMES
from inventory.product_image_map import EXACT_PRODUCT_IMAGE


class CatalogIntegrityTests(TestCase):
    def test_sunglasses_get_aviator_image(self):
        static = Path(__file__).resolve().parents[1] / 'core' / 'static' / 'core' / 'images'
        img, exact, _ = resolve_image('Monaco Aviator Sunglasses', 'Accessories', static)
        self.assertEqual(img, 'aviator-sunglasses.png')
        self.assertTrue(exact)

    def test_boots_get_shoe_image_not_sunglasses(self):
        static = Path(__file__).resolve().parents[1] / 'core' / 'static' / 'core' / 'images'
        img, _, _ = resolve_image('Black Chelsea Boot', 'Shoes', static)
        self.assertEqual(img, 'black-chelsea-boot.png')

    def test_screenshot_inspired_boots(self):
        static = Path(__file__).resolve().parents[1] / 'core' / 'static' / 'core' / 'images'
        img, _, _ = resolve_image('Tan Buckle Ankle Boot', 'Shoes', static)
        self.assertEqual(img, 'tan-buckle-ankle-boot.png')

    def test_suits_get_unique_images(self):
        static = Path(__file__).resolve().parents[1] / 'core' / 'static' / 'core' / 'images'
        img, _, _ = resolve_image('Black Peak Lapel Tuxedo', 'Suits & Blazers', static)
        self.assertEqual(img, 'black-peak-lapel-tuxedo.png')

    def test_watch_gets_watch_image(self):
        static = Path(__file__).resolve().parents[1] / 'core' / 'static' / 'core' / 'images'
        img, _, _ = resolve_image('Atlas Chronograph Watch', 'Accessories', static)
        self.assertEqual(img, 'silver-chronograph-watch.png')

    def test_name_category_match(self):
        self.assertTrue(name_matches_category('Black Chelsea Boot', 'Shoes'))
        self.assertFalse(name_matches_category('Black Chelsea Boot', 'Accessories'))

    def test_every_product_has_unique_image(self):
        static = Path(__file__).resolve().parents[1] / 'core' / 'static' / 'core' / 'images'
        seen: dict[str, str] = {}
        for cat, names in PRODUCT_NAMES.items():
            for name in names:
                img, exact, _ = resolve_image(name, cat, static)
                self.assertTrue(exact, f'{name} should resolve to its dedicated image, got fallback')
                self.assertTrue((static / img).is_file(), f'Missing file {img} for {name}')
                if img in seen and seen[img] != cat:
                    pass  # same image in different categories would be bad
                self.assertNotIn(img, seen, f'Duplicate image {img}: {seen.get(img)} and {name}')
                seen[img] = name

    def test_exact_map_covers_all_catalog_products(self):
        total = sum(len(v) for v in PRODUCT_NAMES.values())
        self.assertEqual(len(EXACT_PRODUCT_IMAGE), total)