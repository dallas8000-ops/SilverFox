from django.contrib import admin
from inventory.models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price_eur', 'static_image', 'image_verified', 'stock_quantity', 'in_stock')
    list_filter = ('category', 'in_stock', 'image_verified')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
