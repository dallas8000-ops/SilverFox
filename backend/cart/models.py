from django.conf import settings
from django.db import models
from django.utils import timezone
from inventory.models import Product
from uuid import uuid4


class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Cart {self.id}'


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    size = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f'{self.quantity} x {self.product.name}'


class Order(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_PAID = 'paid'
    STATUS_SHIPPED = 'shipped'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = (
        (STATUS_PENDING, 'Pending payment'),
        (STATUS_PAID, 'Payment received'),
        (STATUS_SHIPPED, 'Shipped'),
        (STATUS_CANCELLED, 'Cancelled'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    order_ref = models.CharField(max_length=20, unique=True, editable=False)
    customer_name = models.CharField(max_length=120)
    customer_email = models.EmailField(max_length=254, blank=True)
    phone = models.CharField(max_length=30)
    country = models.CharField(max_length=60)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    payment_method = models.CharField(max_length=20, default='MTN')
    currency = models.CharField(max_length=10, default='EUR')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_ref:
            self.order_ref = f'SF-{uuid4().hex[:8].upper()}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.order_ref


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    size = models.CharField(max_length=50, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f'{self.quantity} x {self.product_name}'
