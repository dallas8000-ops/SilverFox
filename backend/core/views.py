import json
from decimal import Decimal

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_GET, require_POST

from cart.models import CartItem, Order, OrderItem
from cart.utils import get_or_create_cart, merge_guest_cart_into_user
from inventory.models import Product, Category
from pages.models import ContactInquiry


def health(request):
    return JsonResponse({'status': 'ok', 'service': 'silverfox'})


def home(request):
    return redirect('shop')


def legacy_shop_redirect(request):
    qs = request.META.get('QUERY_STRING', '')
    url = reverse('shop')
    if qs:
        url = f'{url}?{qs}'
    return HttpResponseRedirect(url)


def about(request):
    return render(request, 'core/about.html')


def terms(request):
    return render(request, 'core/terms.html')


def shop(request):
    products = Product.objects.select_related('category').filter(in_stock=True)
    category_name = request.GET.get('category', '').strip()
    search = request.GET.get('q', '').strip()
    if category_name and category_name.lower() != 'all':
        products = products.filter(category__name=category_name)
    if search:
        products = products.filter(
            Q(name__icontains=search) | Q(description__icontains=search) | Q(category__name__icontains=search)
        )
    categories = Category.objects.all()
    return render(request, 'core/shop.html', {
        'products': products,
        'categories': categories,
        'active_category': category_name or 'All',
        'search_query': search,
    })


def contact(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        subject = request.POST.get('subject', '').strip()
        message = request.POST.get('message', '').strip()
        if not name or not email or not message:
            messages.error(request, 'Name, email, and message are required.')
        else:
            ContactInquiry.objects.create(name=name, email=email, subject=subject, message=message)
            messages.success(request, 'Thank you — we will reply shortly.')
            return redirect('contact')
    return render(request, 'core/contact.html')


def cart_view(request):
    cart = get_or_create_cart(request)
    items = cart.items.select_related('product', 'product__category')
    total = sum((item.product.price_usd * item.quantity for item in items), Decimal('0'))
    return render(request, 'core/cart.html', {'items': items, 'total': total, 'currency': 'EUR'})


@require_POST
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, pk=product_id, in_stock=True)
    size = request.POST.get('size', '').strip()
    quantity = max(1, int(request.POST.get('quantity', 1) or 1))
    cart = get_or_create_cart(request)
    item, created = CartItem.objects.get_or_create(
        cart=cart, product=product, size=size,
        defaults={'quantity': quantity},
    )
    if not created:
        item.quantity += quantity
        item.save(update_fields=['quantity'])
    messages.success(request, f'Added {product.name} to cart.')
    next_url = request.POST.get('next') or reverse('shop')
    return redirect(next_url)


@require_POST
def remove_cart_item(request, item_id):
    cart = get_or_create_cart(request)
    CartItem.objects.filter(cart=cart, pk=item_id).delete()
    messages.info(request, 'Item removed.')
    return redirect('cart')


def checkout(request):
    cart = get_or_create_cart(request)
    items = list(cart.items.select_related('product'))
    if not items:
        messages.warning(request, 'Your cart is empty.')
        return redirect('shop')

    total = sum((item.product.price_usd * item.quantity for item in items), Decimal('0'))

    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        phone = request.POST.get('phone', '').strip()
        country = request.POST.get('country', '').strip()
        address = request.POST.get('address', '').strip()
        payment_method = request.POST.get('payment_method', 'MTN').strip()
        notes = request.POST.get('notes', '').strip()
        currency = request.POST.get('currency', 'EUR').strip()

        if not all([name, phone, country, address]):
            messages.error(request, 'Name, phone, country, and address are required.')
        else:
            order = Order.objects.create(
                user=request.user if request.user.is_authenticated else None,
                session_key=request.session.session_key or '',
                customer_name=name,
                customer_email=email,
                phone=phone,
                country=country,
                address=address,
                notes=notes,
                payment_method=payment_method,
                currency=currency,
                total_amount=total,
            )
            for item in items:
                line = item.product.price_usd * item.quantity
                OrderItem.objects.create(
                    order=order,
                    product_name=item.product.name,
                    quantity=item.quantity,
                    size=item.size,
                    unit_price=item.product.price_usd,
                    line_total=line,
                )
            cart.items.all().delete()
            messages.success(
                request,
                f'Order {order.order_ref} received. Complete payment via {payment_method}. '
                'Our team will confirm dispatch from Kampala.',
            )
            return redirect('order_history' if request.user.is_authenticated else 'shop')

    defaults = {}
    if request.user.is_authenticated:
        defaults = {
            'name': request.user.get_full_name() or request.user.username,
            'email': request.user.email,
        }
    return render(request, 'core/checkout.html', {
        'items': items,
        'total': total,
        'currency': 'EUR',
        'defaults': defaults,
    })


def signup_view(request):
    if request.user.is_authenticated:
        return redirect('order_history')
    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')
        name = request.POST.get('name', '').strip()
        if len(password) < 6:
            messages.error(request, 'Password must be at least 6 characters.')
        elif User.objects.filter(username=email).exists():
            messages.error(request, 'An account with this email already exists.')
        else:
            user = User.objects.create_user(username=email, email=email, password=password, first_name=name)
            merge_guest_cart_into_user(request, user)
            login(request, user)
            messages.success(request, 'Welcome to SilverFox.')
            return redirect('order_history')
    return render(request, 'core/signup.html')


def login_view(request):
    if request.user.is_authenticated:
        return redirect('order_history')
    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')
        user = authenticate(request, username=email, password=password)
        if user:
            merge_guest_cart_into_user(request, user)
            login(request, user)
            return redirect(request.GET.get('next') or 'order_history')
        messages.error(request, 'Invalid email or password.')
    return render(request, 'core/login.html')


def logout_view(request):
    logout(request)
    return redirect('shop')


def staff_login_view(request):
    if request.user.is_staff:
        return redirect('staff_dashboard')
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user and user.is_staff:
            login(request, user)
            return redirect('staff_dashboard')
        messages.error(request, 'Invalid staff credentials.')
    return render(request, 'core/staff_login.html')


@login_required
@user_passes_test(lambda u: u.is_staff)
def staff_dashboard(request):
    low_stock = Product.objects.filter(stock_quantity__lte=5).order_by('stock_quantity')[:10]
    orders = Order.objects.all()[:20]
    inquiries = ContactInquiry.objects.all()[:10]
    stats = {
        'pending': Order.objects.filter(status=Order.STATUS_PENDING).count(),
        'total': Order.objects.count(),
        'low_stock': Product.objects.filter(stock_quantity__lte=5).count(),
        'inquiries': ContactInquiry.objects.count(),
    }
    if request.method == 'POST' and 'order_id' in request.POST:
        order = get_object_or_404(Order, pk=request.POST['order_id'])
        new_status = request.POST.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save(update_fields=['status'])
            messages.success(request, f'Order {order.order_ref} updated.')
            return redirect('staff_dashboard')
    return render(request, 'core/staff_dashboard.html', {
        'orders': orders,
        'low_stock': low_stock,
        'inquiries': inquiries,
        'stats': stats,
        'status_choices': Order.STATUS_CHOICES,
    })


@login_required
def order_history(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items')
    return render(request, 'core/order_history.html', {'orders': orders})


def _chat_reply(message):
    m = message.lower()
    if 'ship' in m or 'kampala' in m:
        return 'We ship from Kampala worldwide. Contact us for bulk or international quotes.'
    if 'size' in m or 'fit' in m:
        return 'Use EU sizing on the shop page. For suits try EU 50; shirts M/L; shoes EU 43.'
    if 'suit' in m or 'blazer' in m:
        return 'Browse Suits & Blazers — tailored pieces for boardroom and formal events.'
    if 'pay' in m or 'mtn' in m or 'stripe' in m:
        return 'Checkout supports mobile money and bank transfer today; Stripe card payments coming soon.'
    return "SilverFox offers premium men's fashion — suits, shirts, shoes, and accessories."


@require_POST
def api_chat(request):
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    message = payload.get('message', '').strip()
    if not message:
        return JsonResponse({'error': 'Message required'}, status=400)
    if settings.OPENAI_API_KEY:
        try:
            import requests
            resp = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={'Authorization': f'Bearer {settings.OPENAI_API_KEY}'},
                json={
                    'model': settings.OPENAI_MODEL,
                    'messages': [
                        {'role': 'system', 'content': "You are SilverFox, a men's fashion assistant shipping from Kampala."},
                        {'role': 'user', 'content': message},
                    ],
                    'max_tokens': 300,
                },
                timeout=20,
            )
            if resp.ok:
                reply = resp.json()['choices'][0]['message']['content']
                return JsonResponse({'reply': reply, 'source': 'openai'})
        except Exception:
            pass
    return JsonResponse({'reply': _chat_reply(message), 'source': 'rules'})


@require_POST
def api_size_recommend(request):
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        payload = {}
    category = (payload.get('category') or '').lower()
    system = (payload.get('sizeSystem') or 'EU').upper()
    if 'shoe' in category:
        return JsonResponse({'recommended': '43' if system == 'EU' else '10', 'sizeSystem': system})
    if 'suit' in category or 'blazer' in category or 'outerwear' in category:
        return JsonResponse({'recommended': '50' if system == 'EU' else '40R', 'sizeSystem': system})
    if 'trouser' in category or 'chino' in category:
        return JsonResponse({'recommended': '50' if system == 'EU' else '34', 'sizeSystem': system})
    if 'accessories' in category:
        return JsonResponse({'recommended': 'One Size', 'sizeSystem': system})
    return JsonResponse({'recommended': '52' if system == 'EU' else 'L', 'sizeSystem': system})
