from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.contrib.auth import views as auth_views
from . import views

if settings.ENABLE_ADMIN:
    admin.site.site_header = 'SilverFox Admin'
    admin.site.site_title = 'SilverFox'
    admin.site.index_title = "Men's fashion operations"

urlpatterns = [
    path('health/', views.health, name='health'),
    path('', views.home, name='home'),
    path('shop/', views.shop, name='shop'),
    path('about/', views.about, name='about'),
    path('terms/', views.terms, name='terms'),
    path('contact/', views.contact, name='contact'),
    path('cart/', views.cart_view, name='cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('add-to-cart/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
    path('cart/remove/<int:item_id>/', views.remove_cart_item, name='remove_cart_item'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('staff/login/', views.staff_login_view, name='staff_login'),
    path('staff/dashboard/', views.staff_dashboard, name='staff_dashboard'),
    path('account/orders/', views.order_history, name='order_history'),
    path('catalog/', views.legacy_shop_redirect, name='catalog'),
    path('inventory/', views.legacy_shop_redirect, name='inventory'),
    path('api/chat/', views.api_chat, name='api_chat'),
    path('api/size-recommend/', views.api_size_recommend, name='api_size_recommend'),
    path('api/inventory/', include('inventory.urls')),
]

if settings.ENABLE_ADMIN:
    urlpatterns.append(path('admin/', admin.site.urls))
