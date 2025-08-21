
// /functions/api/posts/index.js
export async function onRequestGet({ env }) {
  const { results } = await env.BLOG_DB.prepare(
    `SELECT slug, tile_title, header, cover, created_at
     FROM posts ORDER BY created_at DESC`
  ).all();
  return new Response(JSON.stringify(results), {
    headers: corsJsonHeaders()
  });
}

export async function onRequestPost({ request, env }) {
  const auth = request.headers.get("Authorization") || "";
  const ok = checkBasicAuth(auth, env.ADMIN_USER, env.ADMIN_PASS);
  if (!ok) return new Response("Unauthorized", { status: 401, headers: corsHeaders() });

  let body;
  try { body = await request.json(); } catch { 
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders() });
  }

  const tileTitle = (body.tileTitle || "").trim();
  const header    = (body.header || "").trim();
  const cover     = (body.cover || "").trim();
  const content   = sanitizeHtml(body.contentHtml || "");
  const baseSlug  = slugify(tileTitle || header);
  const slug      = ((body.slug || baseSlug) + "-" + Date.now());

  if (!tileTitle || !header || !content) {
    return new Response("Invalid payload", { status: 400, headers: corsHeaders() });
  }

  await env.BLOG_DB.prepare(
    `INSERT INTO posts (slug, tile_title, header, cover, content_html)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(slug, tileTitle, header, cover || null, content).run();

  return new Response(JSON.stringify({ ok: true, slug }), {
    headers: corsJsonHeaders()
  });
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };
}
function corsJsonHeaders() {
  return { ...corsHeaders(), "Content-Type": "application/json; charset=utf-8" };
}

function checkBasicAuth(auth, user, pass) {
  if (!user || !pass) return false;
  if (!auth.startsWith("Basic ")) return false;
  try {
    const decoded = atob(auth.slice(6));
    const idx = decoded.indexOf(":");
    if (idx === -1) return false;
    const u = decoded.slice(0, idx);
    const p = decoded.slice(idx + 1);
    return u === user && p === pass;
  } catch {
    return false;
  }
}

function slugify(str = "") {
  return str.toLowerCase()
    .normalize("NFD").replace(/\u0300-\u036f/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sanitizeHtml(html = "") {
  let out = html
    .replace(/\s+(style|class|id|on\w+)=["'][^"']*["']/gi, "")
    .replace(/<\/?font[^>]*>/gi, "")
    .replace(/href=["']\s*javascript:[^"']*["']/gi, 'href="#"')
    .replace(/src=["']\s*data:[^"']*["']/gi, 'src=""');
  const allowed = /<\/?(p|h1|h2|h3|h4|strong|em|b|i|u|ul|ol|li|a|blockquote|code|pre|img|br|hr)(\s+[^>]*)?>/gi;
  out = out.replace(/<\/?[^>]+>/g, m => (m.match(allowed) ? m : ""));
  return out;
}
