from django.db import models
from django.utils.text import slugify


def unique_product_slug(name, exclude_pk=None):
    from inventory.models import Product
    base = slugify(name)[:200] or 'product'
    slug = base
    counter = 2
    qs = Product.objects.all()
    if exclude_pk is not None:
        qs = qs.exclude(pk=exclude_pk)
    while qs.filter(slug=slug).exists():
        suffix = f'-{counter}'
        slug = f'{base[:200 - len(suffix)]}{suffix}'
        counter += 1
    return slug


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    price_usd = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_ugx = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    color = models.CharField(max_length=100, blank=True)
    stock_quantity = models.PositiveIntegerField(default=1)
    sizes = models.CharField(
        max_length=200,
        blank=True,
        help_text='Comma-separated sizes (EU or One Size)',
    )
    static_image = models.CharField(
        max_length=255,
        blank=True,
        help_text='Filename under static/core/images/',
    )
    in_stock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def size_list(self):
        if not self.sizes:
            return []
        return [s.strip() for s in self.sizes.split(',') if s.strip()]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_product_slug(self.name, exclude_pk=self.pk)
        self.in_stock = self.stock_quantity > 0
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
