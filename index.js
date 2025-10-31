/* Paste this into the JS panel in CodePen */
/* Main JS: SPA navigation, sticky header, mobile nav toggle, rating & reviews storage */
(function(){
  // caching
  const header = document.getElementById('siteHeader');
  const main = document.getElementById('mainContent');
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');

  // SPA navigation: show section by id (data-nav attributes)
  function showPage(id){
    document.querySelectorAll('.page').forEach(p=>{
      if(p.id === id) p.classList.add('active'); else p.classList.remove('active');
    });
    // close mobile nav if open
    if(window.innerWidth <= 660 && navList){ navList.style.display = 'none'; navToggle.setAttribute('aria-expanded','false'); }
    // focus top
    window.scrollTo({top:0, behavior:'smooth'});
  }

  // set default home active
  showPage('home');

  // nav link clicks
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-nav]');
    if(!t) return;
    e.preventDefault();
    const id = t.getAttribute('data-nav');
    if(id) showPage(id);
  });

  // sticky header shadow on scroll
  const onScroll = () => {
    if(window.scrollY > 10) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // mobile nav toggle
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      if(navList.style.display === 'flex' || navList.style.display === 'block'){
        navList.style.display = 'none';
      } else {
        navList.style.display = 'flex';
        navList.style.flexDirection = 'column';
      }
    });
  }

  // Reviews UI: rating stars
  const ratingEl = document.getElementById('rating');
  if(ratingEl){
    const stars = ratingEl.querySelectorAll('.star');
    const ratingValue = document.getElementById('ratingValue');
    let current = 5;
    function setStars(v){
      stars.forEach(s=>{ const val = Number(s.dataset.value); s.classList.toggle('active', val <= v); });
      if(ratingValue) ratingValue.value = v;
    }
    stars.forEach(s=>{
      s.addEventListener('click', ()=>{ current = Number(s.dataset.value); setStars(current); });
      s.addEventListener('mouseover', ()=>{ setStars(Number(s.dataset.value)); });
      s.addEventListener('mouseout', ()=>{ setStars(current); });
    });
    setStars(current);
  }

  // Reviews storage in localStorage
  const reviewForm = document.getElementById('reviewForm');
  function loadReviews(){
    const raw = localStorage.getItem('wm_reviews');
    if(!raw) return [];
    try{ return JSON.parse(raw); } catch(e){ return []; }
  }
  function saveReviews(arr){ localStorage.setItem('wm_reviews', JSON.stringify(arr)); }
  function escapeHTML(s){ return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":"&#39;"}[c])); }

  function renderReviews(){
    const list = document.getElementById('reviewsList');
    if(!list) return;
    const reviews = loadReviews();
    list.innerHTML = '';
    if(reviews.length === 0){
      list.innerHTML = '<p class="muted">Немає відгуків — станьте першим!</p>';
      return;
    }
    reviews.slice().reverse().forEach(r=>{
      const el = document.createElement('article');
      el.className = 'card review';
      el.innerHTML = `
        <div class="meta">
          <div style="width:56px;height:56px;border-radius:50%;background:${'#fff1f0'};display:inline-block;margin-right:10px"></div>
          <div><strong>${escapeHTML(r.name)}</strong><div class="small muted">${new Date(r.date).toLocaleDateString()}</div></div>
        </div>
        <p class="muted">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</p>
        <p>${escapeHTML(r.message)}</p>
      `;
      list.appendChild(el);
    });
  }

  if(reviewForm){
    reviewForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(reviewForm);
      const obj = { name: fd.get('name') || 'Анонім', email: fd.get('email'), message: fd.get('message') || '', rating: Number(fd.get('ratingValue')||5), date: new Date().toISOString() };
      const arr = loadReviews(); arr.push(obj); saveReviews(arr);
      reviewForm.reset();
      // reset stars UI
      if(ratingEl){ ratingEl.querySelectorAll('.star').forEach(s=>s.classList.toggle('active', Number(s.dataset.value) <= 5)); }
      document.getElementById('ratingValue').value = 5;
      renderReviews();
      alert('Дякуємо! Ваш відгук збережено локально.');
      showPage('reviews');
    });
  }

  renderReviews();

  // Contact form handler (demo)
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      // In real site, integrate backend service (Netlify Forms / Formspree / server).
      alert('Дякуємо! Ваше повідомлення надіслано (демо). Ми зв\'яжемося з вами найближчим часом.');
      contactForm.reset();
      showPage('contact');
    });
  }

  // keyboard accessibility: Esc closes mobile nav
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && navList && window.innerWidth <= 660){
      navList.style.display = 'none';
      navToggle.setAttribute('aria-expanded','false');
    }
  });

})();
