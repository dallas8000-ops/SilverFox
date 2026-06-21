from django.core.management.base import BaseCommand
from django.conf import settings
from pathlib import Path

from inventory.models import Product
from inventory.catalog_integrity import resolve_image, build_description, audit_product, name_matches_category
from inventory.exchange_rates import apply_rates_to_product, fetch_rates
from inventory.ai_catalog import ai_validate_product


class Command(BaseCommand):
    help = 'Fix product images, descriptions, FX pricing, and optionally AI-audit catalog integrity.'

    def add_arguments(self, parser):
        parser.add_argument('--ai', action='store_true', help='Run OpenAI validation on mismatches (requires API key)')
        parser.add_argument('--hide-unverified', action='store_true', help='Set stock to 0 for products failing name/category rules')

    def handle(self, *args, **options):
        static_dir = Path(settings.BASE_DIR) / 'core' / 'static' / 'core' / 'images'
        fx = fetch_rates()
        self.stdout.write(f"FX source: {fx.get('source')} — USD {fx['rates']['USD']}, UGX {fx['rates']['UGX']}")

        fixed_images = 0
        fixed_prices = 0
        hidden = 0
        issues_total = 0

        for product in Product.objects.select_related('category'):
            cat = product.category.name
            image, exact, note = resolve_image(product.name, cat, static_dir)

            if image and product.static_image != image:
                product.static_image = image
                fixed_images += 1

            product.image_verified = exact and name_matches_category(product.name, cat)
            product.description = build_description(product.name, cat, note)

            if options['hide_unverified'] and not product.image_verified:
                product.stock_quantity = 0
                hidden += 1

            if not product.price_eur and product.price_usd:
                product.price_eur = product.price_usd

            apply_rates_to_product(product)
            fixed_prices += 1

            product.save()

            audit = audit_product(product.name, cat, product.static_image, static_dir)
            if audit:
                issues_total += len(audit)
                for msg in audit:
                    self.stdout.write(self.style.WARNING(f'  [{product.name}] {msg}'))

            if options['ai'] and audit:
                ai = ai_validate_product(product.name, cat, product.static_image)
                if ai and not ai.get('ok'):
                    self.stdout.write(self.style.ERROR(f'  AI: {ai.get("issue")}'))

        self.stdout.write(self.style.SUCCESS(
            f'Synced {Product.objects.count()} products — {fixed_images} images corrected, '
            f'{fixed_prices} prices updated to live FX, {hidden} hidden (unverified). '
            f'{issues_total} integrity notes.'
        ))
