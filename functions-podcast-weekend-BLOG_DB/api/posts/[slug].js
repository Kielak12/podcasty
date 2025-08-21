
// /functions/api/posts/[slug].js
export async function onRequestGet({ params, env }) {
  const { slug } = params;
  const { results } = await env.BLOG_DB.prepare(
    `SELECT slug, tile_title, header, cover, content_html, created_at
     FROM posts WHERE slug = ? LIMIT 1`
  ).bind(slug).all();

  if (!results.length) {
    return new Response("Not found", { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  return new Response(JSON.stringify(results[0]), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
  });
}
