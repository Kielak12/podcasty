
/* Blog & Admin dynamic logic (client-side storage)
   - Stores posts in localStorage under 'pw_posts_v2'
   - Admin can add posts with: cover (image), tileTitle, header, content HTML
   - Blog list renders cards
   - Article page renders header + content
   - Sanitization removes inline styles and classes to keep typography consistent
*/

const STORAGE_KEY = 'pw_posts_v2';

function getPosts(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch(e){ return []; }
}
function setPosts(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function slugify(str){
  return (str || '').toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

function sanitizeHtml(html){
  // Create a DOM, remove style/class attributes to maintain site typography
  const tpl = document.createElement('template');
  tpl.innerHTML = html || '';
  const walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_ELEMENT, null);
  let node;
  while ((node = walker.nextNode())){
    node.removeAttribute('style');
    node.removeAttribute('class');
    // Drop font tags completely
    if (node.tagName && node.tagName.toLowerCase() === 'font'){
      const parent = node.parentNode;
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      parent.removeChild(node);
    }
  }
  // Allow only basic tags; strip disallowed by replacing with text
  const allowed = new Set(['p','h1','h2','h3','h4','strong','em','b','i','u','ul','ol','li','a','blockquote','code','pre','img','br','hr']);
  function filter(node){
    if (node.nodeType === Node.ELEMENT_NODE){
      const tag = node.tagName.toLowerCase();
      if (!allowed.has(tag)){
        // unwrap: replace element by its children
        const parent = node.parentNode;
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
        return;
      }
      // links: ensure rel noopener and keep href only
      if (tag === 'a'){
        const href = node.getAttribute('href') || '#';
        node.getAttributeNames().forEach(n=>{
          if (n!=='href' && n!=='title') node.removeAttribute(n);
        });
        node.setAttribute('rel','noopener noreferrer');
        node.setAttribute('target','_blank');
        node.setAttribute('href', href);
      }
      // images: keep src, alt
      if (tag === 'img'){
        const src = node.getAttribute('src') || '';
        const alt = node.getAttribute('alt') || '';
        node.getAttributeNames().forEach(n=>{
          if (n!=='src' && n!=='alt') node.removeAttribute(n);
        });
        node.setAttribute('alt', alt);
        node.setAttribute('loading','lazy');
        // Block data URLs for safety
        if (/^data:/i.test(src)) node.remove();
      }
    }
    // Recurse children
    Array.from(node.childNodes).forEach(filter);
  }
  filter(tpl.content);
  return tpl.innerHTML;
}

// Render list on blog.html
function renderBlogList(){
  const mount = document.querySelector('#blog-cards-dynamic');
  if (!mount) return;
  const posts = getPosts();
  mount.innerHTML = '';
  posts.forEach(p=>{
    const a = document.createElement('article');
    a.className = 'blog-card';
    a.innerHTML = `
      <img src="${p.cover || 'assets/img/hero.jpg'}" alt="Okładka" />
      <div class="body">
        <h3>${p.tileTitle || p.header || 'Artykuł'}</h3>
        <p class="small">${new Date(p.date).toLocaleDateString()}</p>
        <a class="cta" href="article-dynamic.html#${encodeURIComponent(p.slug)}">Czytaj</a>
      </div>
    `;
    mount.appendChild(a);
  });
}

// Render single article on article-dynamic.html
function renderDynamicArticle(){
  const root = document.querySelector('#dyn-article-root');
  if (!root) return;
  const slug = decodeURIComponent(location.hash.replace('#',''));
  const posts = getPosts();
  const post = posts.find(x=>x.slug===slug);
  if (!post){
    root.innerHTML = '<p>Nie znaleziono artykułu.</p>';
    return;
  }
  const h = document.getElementById('dyn-header');
  const d = document.getElementById('dyn-date');
  const c = document.getElementById('dyn-cover');
  const body = document.getElementById('dyn-content');
  h.textContent = post.header || post.tileTitle;
  d.textContent = new Date(post.date).toLocaleDateString();
  c.src = post.cover || 'assets/img/hero.jpg';
  body.innerHTML = post.contentHtml;
}

// Admin init on admin.html
function initAdmin(){
  const form = document.querySelector('#admin-post-form');
  if (!form) return;
  const loginForm = document.getElementById('login-form');
  const loginBox  = document.getElementById('login-box');
  const adminBox  = document.getElementById('admin-box');

  loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const u = document.getElementById('login').value.trim();
    const p = document.getElementById('password').value.trim();
    if (u==='123' && p==='123'){
      sessionStorage.setItem('pw_admin','1');
      loginBox.style.display='none';
      adminBox.style.display='block';
    } else {
      alert('Błędne dane logowania.');
    }
  });
  if (sessionStorage.getItem('pw_admin')==='1'){
    loginBox.style.display='none';
    adminBox.style.display='block';
  }
  document.getElementById('logout').addEventListener('click', ()=>{
    sessionStorage.removeItem('pw_admin');
    location.reload();
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const tileTitle = document.getElementById('tileTitle').value.trim();
    const header    = document.getElementById('header').value.trim();
    const cover     = document.getElementById('cover').value.trim();
    const content   = document.getElementById('content').value;
    const cleaned   = sanitizeHtml(content);
    const slug      = slugify(tileTitle || header) + '-' + Date.now();
    const post = {
      slug,
      tileTitle,
      header,
      cover,
      contentHtml: cleaned,
      date: new Date().toISOString()
    };
    const list = getPosts();
    list.unshift(post);
    setPosts(list);
    alert('Artykuł zapisany. Sprawdź zakładkę Blog.');
    form.reset();
  });
}

// Init
document.addEventListener('DOMContentLoaded', ()=>{
  renderBlogList();
  renderDynamicArticle();
  initAdmin();
});
