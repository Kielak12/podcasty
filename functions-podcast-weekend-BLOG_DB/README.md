
# functions/ — API dla bloga (Cloudflare Pages Functions + D1)

## Wymagania
- D1 Database: `podcast_weekend`
- Binding (Variable name): `BLOG_DB`
- Sekrety: `ADMIN_USER`, `ADMIN_PASS` (Basic Auth dla POST)

## Endpointy
- GET  /api/posts
- POST /api/posts
- GET  /api/posts/:slug

## Payload POST
{
  "tileTitle": "Tytuł kafelka",
  "header": "Nagłówek H1",
  "cover": "https://...",
  "contentHtml": "<p>Treść HTML</p>",
  "slug": "opcjonalny-slug"
}
