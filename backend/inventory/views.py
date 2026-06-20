from rest_framework import viewsets
from inventory.models import Category, Product
from inventory.serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.select_related('category').filter(in_stock=True)
    serializer_class = ProductSerializer
