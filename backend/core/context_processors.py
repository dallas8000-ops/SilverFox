def site_context(request):
    from cart.utils import get_cart_count
    return {
        'site_name': 'SilverFox',
        'cart_count': get_cart_count(request),
    }
