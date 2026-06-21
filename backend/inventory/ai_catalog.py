"""Optional OpenAI catalog audit — degrades gracefully without API key."""
from __future__ import annotations

import json
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def ai_validate_product(name: str, category: str, image: str) -> dict | None:
    """
    Ask OpenAI if name/category/image assignment looks correct.
    Returns {'ok': bool, 'issue': str, 'suggested_image': str|None} or None if unavailable.
    """
    if not settings.OPENAI_API_KEY:
        return None
    try:
        import requests
        prompt = (
            f'Product: "{name}"\nCategory: "{category}"\nImage file: "{image}"\n'
            'Images available: suit, dress shirt, chinos, sweater, overcoat, oxford shoes, '
            'belt, tie, watch, wallet, cufflinks, aviator sunglasses.\n'
            'Reply JSON only: {"ok": true/false, "issue": "short reason", "suggested_image": "filename or null"}'
        )
        resp = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={'Authorization': f'Bearer {settings.OPENAI_API_KEY}'},
            json={
                'model': settings.OPENAI_MODEL,
                'messages': [
                    {'role': 'system', 'content': "You audit men's fashion catalog data integrity."},
                    {'role': 'user', 'content': prompt},
                ],
                'max_tokens': 150,
            },
            timeout=25,
        )
        if not resp.ok:
            return None
        text = resp.json()['choices'][0]['message']['content'].strip()
        if text.startswith('```'):
            text = text.split('\n', 1)[-1].rsplit('```', 1)[0]
        return json.loads(text)
    except Exception as exc:
        logger.warning('AI catalog audit failed: %s', exc)
        return None
