/**
 * Browser helper: turn DB `image` (filename, images/..., /images/..., URL) into a URL for <img src>.
 * Use with Express so paths are always absolute from site root: /images/...
 */
(function (global) {
  function productImageUrl(image) {
    if (image == null || image === '') return '/images/placeholder.png';
    const t = String(image).trim();
    if (!t) return '/images/placeholder.png';
    if (t.startsWith('http://') || t.startsWith('https://')) return t;
    if (t.startsWith('/uploads/') || t.startsWith('/images/')) return t;
    const noPrefix = t.replace(/^images\//i, '').replace(/^\/+/, '');
    if (!noPrefix) return '/images/placeholder.png';
    const enc = noPrefix.split('/').map(function (seg) { return encodeURIComponent(seg); }).join('/');
    return '/images/' + enc;
  }
  global.productImageUrl = productImageUrl;
})(typeof window !== 'undefined' ? window : globalThis);
