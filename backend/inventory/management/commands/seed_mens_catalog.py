import shutil
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from inventory.models import Category, Product
from inventory.mens_catalog_data import (
    CATEGORY_META,
    DESCRIPTIONS,
    IMAGE_POOL,
    MENS_CATEGORIES,
    PRODUCT_NAMES,
)


class Command(BaseCommand):
    help = 'Seed SilverFox men\'s catalog (128 products) if empty, or with --force to replace.'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Clear and re-seed all products')

    def handle(self, *args, **options):
        if Product.objects.exists() and not options['force']:
            self.stdout.write(self.style.SUCCESS(
                f'Skipping seed — {Product.objects.count()} products already exist. Use --force to replace.'
            ))
            return

        self._copy_images()
        if options['force']:
            Product.objects.all().delete()

        ugx_rate = Decimal(str(settings.UGX_RATE))
        created = 0

        for cat_name, cat_desc in MENS_CATEGORIES:
            category, _ = Category.objects.get_or_create(
                name=cat_name,
                defaults={'description': cat_desc},
            )
            meta = CATEGORY_META[cat_name]
            names = PRODUCT_NAMES[cat_name]
            for idx, name in enumerate(names):
                seed = hash(f'{cat_name}-{name}-{idx}') & 0xFFFFFFFF
                price = meta['price_min'] + (seed % (meta['price_max'] - meta['price_min'] + 1))
                stock = 3 + (seed % 25)
                image = meta['image'] if idx == 0 else IMAGE_POOL[idx % len(IMAGE_POOL)]
                Product.objects.update_or_create(
                    name=name,
                    category=category,
                    defaults={
                        'description': DESCRIPTIONS[cat_name],
                        'price_usd': Decimal(price),
                        'price_ugx': Decimal(price) * ugx_rate,
                        'stock_quantity': stock,
                        'sizes': meta['sizes'],
                        'static_image': image,
                        'color': '',
                    },
                )
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Seeded {created} men\'s products across {len(MENS_CATEGORIES)} categories.'))

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
        self.stdout.write(f'Copied product images to {dest}')
