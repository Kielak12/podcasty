
// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (navToggle) {
  navToggle.addEventListener('click', ()=> nav.classList.toggle('show'));
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    // allow hash-only links to work within page
  });
});

// Newsletter fake handler (replace with real embed)
const nlForm = document.querySelector('#newsletter-form');
if (nlForm){
  nlForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    alert('Dziękujemy! Sprawdź skrzynkę – potwierdź subskrypcję.');
    nlForm.reset();
  });
}

// Blog: render posts stored in localStorage (admin can add new)
function renderDynamicPosts(){
  const list = document.querySelector('#dynamic-posts');
  if(!list) return;
  const posts = JSON.parse(localStorage.getItem('pw_posts')||'[]');
  list.innerHTML = '';
  posts.forEach(p=>{
    const card = document.createElement('article');
    card.className='blog-card';
    card.innerHTML = `
      <img src="${p.cover || 'assets/img/hero.jpg'}" alt="Okładka">
      <div class="body">
        <h3>${p.title}</h3>
        <p class="small">${new Date(p.date).toLocaleDateString()}</p>
        <p>${p.excerpt}</p>
        <a class="cta" href="article-dynamic.html#${encodeURIComponent(p.title)}">Czytaj</a>
      </div>
    `;
    list.appendChild(card);
  });
}
renderDynamicPosts();
