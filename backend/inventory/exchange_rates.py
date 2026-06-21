"""Live exchange rates — EUR base, sync product USD/UGX/KES."""
from __future__ import annotations

import logging
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

import requests
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

CACHE_KEY = 'silverfox_fx_rates'
CACHE_TTL = 60 * 60 * 6  # 6 hours

FALLBACK = {
    'EUR': Decimal('1'),
    'USD': Decimal('1.08'),
    'UGX': Decimal('3700'),
    'KES': Decimal('140'),
}


def _q(value: Decimal) -> Decimal:
    return value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def fetch_rates() -> dict[str, Any]:
    cached = cache.get(CACHE_KEY)
    if cached:
        return cached

    rates = dict(FALLBACK)
    source = 'fallback'
    try:
        resp = requests.get('https://open.er-api.com/v6/latest/EUR', timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if data.get('result') == 'success':
            raw = data.get('rates', {})
            for code in ('USD', 'UGX', 'KES'):
                val = raw.get(code)
                if val is not None:
                    rates[code] = Decimal(str(val))
            rates['EUR'] = Decimal('1')
            source = 'open.er-api.com'
    except Exception as exc:
        logger.warning('FX fetch failed: %s', exc)

    payload = {
        'rates': {k: str(v) for k, v in rates.items()},
        'source': source,
    }
    cache.set(CACHE_KEY, payload, CACHE_TTL)
    return payload


def get_rates() -> dict[str, Decimal]:
    payload = fetch_rates()
    return {k: Decimal(v) for k, v in payload['rates'].items()}


def convert_from_eur(amount_eur: Decimal, currency: str) -> Decimal:
    rates = get_rates()
    rate = rates.get(currency.upper(), Decimal('1'))
    return _q(amount_eur * rate)


def apply_rates_to_product(product) -> dict[str, Decimal]:
    """Update product FX fields from price_eur. Returns dict of updated values."""
    base = product.price_eur if product.price_eur else product.price_usd
    rates = get_rates()
    product.price_eur = _q(Decimal(str(base)))
    product.price_usd = _q(product.price_eur * rates['USD'])
    product.price_ugx = _q(product.price_eur * rates['UGX'])
    product.price_kes = _q(product.price_eur * rates['KES'])
    return {
        'EUR': product.price_eur,
        'USD': product.price_usd,
        'UGX': product.price_ugx,
        'KES': product.price_kes,
    }
