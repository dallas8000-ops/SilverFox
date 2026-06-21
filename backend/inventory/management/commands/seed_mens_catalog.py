import shutil
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from inventory.models import Category, Product
from inventory.catalog_integrity import resolve_image, build_description, name_matches_category
from inventory.exchange_rates import apply_rates_to_product, fetch_rates
from inventory.mens_catalog_data import (
    CATEGORY_META,
    MENS_CATEGORIES,
    PRODUCT_NAMES,
)


class Command(BaseCommand):
    help = "Seed SilverFox men's catalog (128 products) if empty, or with --force to replace."

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Clear and re-seed all products')
        parser.add_argument('--sync-only', action='store_true', help='After seed, run sync_catalog logic inline')

    def handle(self, *args, **options):
        if Product.objects.exists() and not options['force']:
            self.stdout.write(self.style.SUCCESS(
                f'Skipping seed — {Product.objects.count()} products exist. Use --force to replace, or: python manage.py sync_catalog'
            ))
            return

        self._copy_images()
        if options['force']:
            Product.objects.all().delete()

        fetch_rates()
        static_dir = Path(settings.BASE_DIR) / 'core' / 'static' / 'core' / 'images'
        created = 0

        for cat_name, cat_desc in MENS_CATEGORIES:
            category, _ = Category.objects.get_or_create(
                name=cat_name,
                defaults={'description': cat_desc},
            )
            meta = CATEGORY_META[cat_name]
            for idx, name in enumerate(PRODUCT_NAMES[cat_name]):
                seed = hash(f'{cat_name}-{name}-{idx}') & 0xFFFFFFFF
                price_eur = meta['price_min'] + (seed % (meta['price_max'] - meta['price_min'] + 1))
                stock = 3 + (seed % 25)

                image, exact, note = resolve_image(name, cat_name, static_dir)
                verified = exact and name_matches_category(name, cat_name)

                product, _ = Product.objects.update_or_create(
                    name=name,
                    category=category,
                    defaults={
                        'description': build_description(name, cat_name, note),
                        'price_eur': Decimal(price_eur),
                        'stock_quantity': stock if verified or image else 0,
                        'sizes': meta['sizes'],
                        'static_image': image,
                        'image_verified': verified,
                        'color': '',
                    },
                )
                apply_rates_to_product(product)
                product.save()
                created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {created} products. Run: python manage.py sync_catalog --ai (optional AI audit)'
        ))

    def _copy_images(self):
        dest = Path(settings.BASE_DIR) / 'core' / 'static' / 'core' / 'images'
        dest.mkdir(parents=True, exist_ok=True)
        src = settings.LEGACY_IMAGES_DIR
        if not src.exists():
            self.stdout.write(self.style.WARNING(f'Legacy images not found at {src}'))
            return
        for png in src.glob('*.png'):
            if png.name.lower().startswith('screenshot'):
                continue
            shutil.copy2(png, dest / png.name)
