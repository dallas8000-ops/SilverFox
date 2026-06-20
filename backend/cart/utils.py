from django.contrib.sessions.backends.db import SessionStore


def _session_key(request):
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


def get_or_create_cart(request):
    from cart.models import Cart
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user, defaults={'session_key': ''})
        return cart
    key = _session_key(request)
    cart, _ = Cart.objects.get_or_create(session_key=key, user=None)
    return cart


def get_cart_count(request):
    cart = get_or_create_cart(request)
    return sum(item.quantity for item in cart.items.select_related('product'))


def merge_guest_cart_into_user(request, user):
    from cart.models import Cart, CartItem
    guest_key = request.session.session_key
    if not guest_key:
        return
    try:
        guest_cart = Cart.objects.get(session_key=guest_key, user=None)
    except Cart.DoesNotExist:
        return
    user_cart, _ = Cart.objects.get_or_create(user=user, defaults={'session_key': ''})
    for item in guest_cart.items.all():
        existing = user_cart.items.filter(product=item.product, size=item.size).first()
        if existing:
            existing.quantity += item.quantity
            existing.save(update_fields=['quantity'])
        else:
            CartItem.objects.create(
                cart=user_cart,
                product=item.product,
                quantity=item.quantity,
                size=item.size,
            )
    guest_cart.delete()
