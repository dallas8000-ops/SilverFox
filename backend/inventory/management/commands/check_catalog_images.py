from django.core.management.base import BaseCommand
from django.conf import settings
from pathlib import Path

from inventory.mens_catalog_data import PRODUCT_NAMES
from inventory.product_image_map import image_for_product


class Command(BaseCommand):
    help = 'List catalog products whose unique image PNG is missing from static files.'

    def handle(self, *args, **options):
        static_dir = Path(settings.BASE_DIR) / 'core' / 'static' / 'core' / 'images'
        on_disk = {p.name for p in static_dir.glob('*.png')}
        missing = []
        for cat, names in PRODUCT_NAMES.items():
            for name in names:
                img = image_for_product(name)
                if img not in on_disk:
                    missing.append((cat, name, img))
        if not missing:
            self.stdout.write(self.style.SUCCESS(f'All {sum(len(v) for v in PRODUCT_NAMES.values())} catalog images present.'))
            return
        self.stdout.write(self.style.WARNING(f'{len(missing)} images missing:'))
        for cat, name, img in missing:
            self.stdout.write(f'  [{cat}] {name} -> {img}')
