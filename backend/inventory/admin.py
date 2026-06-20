from django.contrib import admin
from inventory.models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price_usd', 'stock_quantity', 'in_stock')
    list_filter = ('category', 'in_stock')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
