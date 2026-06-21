"""Stripe integration stubs + health view for deployment readiness tooling."""

from django.http import JsonResponse


def health(_request):
    """Alias health check — also exposed at /health/ in core.urls."""
    return JsonResponse({'status': 'healthy', 'service': 'silverfox'}, status=200)
