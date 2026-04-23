/**
 * Build a safe URL for a product image from the DB `image` field (filename, images/..., /uploads/..., or absolute URL).
 * Files live in `silverfox-ecommerce/React/public/images` (canonical); Express and Vite both serve them as `/images/...`.
 */
export function productImageUrl(image) {
  if (!image || typeof image !== 'string') return ''
  const t = image.trim()
  if (!t) return ''
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  if (t.startsWith('/uploads/') || t.startsWith('/images/')) return t
  const noPrefix = t.replace(/^images\//i, '').replace(/^\/+/, '')
  if (!noPrefix) return ''
  const encoded = noPrefix
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')
  return `/images/${encoded}`
}
