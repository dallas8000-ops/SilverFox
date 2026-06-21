from rest_framework import serializers
from inventory.models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description')


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'description', 'price_eur', 'price_usd', 'price_ugx', 'price_kes',
            'category', 'category_name', 'color', 'stock_quantity', 'sizes',
            'static_image', 'image_verified', 'in_stock',
        )
