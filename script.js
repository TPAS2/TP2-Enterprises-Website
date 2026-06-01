'use strict';

// ===== FLOATING IIS =====
const iisEl = document.getElementById('floatingIis');
if (iisEl) {
  iisEl.style.top = '0';
  iisEl.style.left = '0';
  const pad = 10;
  const w = iisEl.offsetWidth;
  const h = iisEl.offsetHeight;
  const maxX = window.innerWidth  - w - pad;
  const maxY = window.innerHeight - h - pad;
  let x = Math.random() * maxX;
  let y = Math.random() * maxY;
  let vx = (Math.random() * 0.6 + 0.3) * (Math.random() > 0.5 ? 1 : -1);
  let vy = (Math.random() * 0.6 + 0.3) * (Math.random() > 0.5 ? 1 : -1);
  let scrolling = false;
  let scrollTimer;

  // Only show iis when home page is visible
  const homePage = document.getElementById('home');
  const iisObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      iisEl.style.opacity = e.isIntersecting ? '1' : '0';
      iisEl.style.pointerEvents = e.isIntersecting ? 'auto' : 'none';
    });
  }, { threshold: 0.5 });
  iisObserver.observe(homePage);

  window.addEventListener('scroll', () => {
    scrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { scrolling = false; }, 200);
  }, { passive: true });

  function driftIis() {
    if (!scrolling) {
      x += vx; y += vy;
      if (x <= pad)  { x = pad;  vx =  Math.abs(vx); }
      if (x >= maxX) { x = maxX; vx = -Math.abs(vx); }
      if (y <= pad)  { y = pad;  vy =  Math.abs(vy); }
      if (y >= maxY) { y = maxY; vy = -Math.abs(vy); }
      iisEl.style.transform = `translate(${x}px, ${y}px)`;
    }
    requestAnimationFrame(driftIis);
  }
  driftIis();
}


// ===== NAVBAR =====
const navbar = document.getElementById('navbar');

// ===== MOBILE NAV =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// ===== JS PAGE SNAPPING =====
const pages = document.querySelectorAll('.page');
const indicator = document.getElementById('pageIndicator');
let currentPage = 0;
let isAnimating = false;
let lastScrollTime = 0;

pages.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'page-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Go to page ${i + 1}`);
  dot.addEventListener('click', () => goToPage(i));
  indicator.appendChild(dot);
});

function updateDots(index) {
  document.querySelectorAll('.page-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.side-nav-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
}

function goToPage(index) {
  if (index < 0 || index >= pages.length) return;
  const now = Date.now();
  if (now - lastScrollTime < 900) return;
  lastScrollTime = now;
  isAnimating = true;
  currentPage = index;
  updateDots(index);
  navbar.classList.toggle('scrolled', index > 0);
  pages[index].scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    isAnimating = false;
    revealCardsInPage(pages[index]);
    if (pages[index].querySelector('.stat-number')) triggerCounters();
  }, 800);
}

// Wheel handler — one tick = one page
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (e.deltaY > 0) goToPage(currentPage + 1);
  else if (e.deltaY < 0) goToPage(currentPage - 1);
}, { passive: false });

// Touch handler
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });
window.addEventListener('touchend', (e) => {
  if (isAnimating) return;
  const diff = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(diff) > 40) {
    if (diff > 0) goToPage(currentPage + 1);
    else goToPage(currentPage - 1);
  }
}, { passive: true });

// ===== SERVICE CARD FADE-IN (triggered on page change) =====
function revealCardsInPage(pageEl) {
  pageEl.querySelectorAll('.service-card:not(.visible)').forEach((card, i) => {
    const delay = card.dataset.delay || (i * 80);
    setTimeout(() => card.classList.add('visible'), parseInt(delay));
  });
}

// ===== STAT COUNTERS =====
let countersTriggered = false;
function animateCounter(el, target) {
  const duration = 1800;
  const start = performance.now();
  const update = (time) => {
    const elapsed = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (elapsed < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(update);
}
function triggerCounters() {
  if (countersTriggered) return;
  countersTriggered = true;
  document.querySelectorAll('.stat-number').forEach(el => {
    animateCounter(el, parseInt(el.dataset.target, 10));
  });
}

// Reveal cards on initial page
revealCardsInPage(pages[0]);

// ===== CAR SLIDER =====
const sliderTrack = document.getElementById('sliderTrack');
const sliderPrev = document.getElementById('sliderPrev');
const sliderNext = document.getElementById('sliderNext');
const sliderDotsEl = document.getElementById('sliderDots');

if (sliderTrack) {
  const cards = sliderTrack.querySelectorAll('.car-card');
  const total = cards.length;
  let current = 0;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goSlide(i));
    sliderDotsEl.appendChild(dot);
  });

  function goSlide(index) {
    current = (index + total) % total;
    const cardWidth = cards[0].offsetWidth + 24; // width + gap
    sliderTrack.style.transform = `translateX(-${current * cardWidth}px)`;
    sliderTrack.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
    sliderDotsEl.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  sliderPrev.addEventListener('click', () => goSlide(current - 1));
  sliderNext.addEventListener('click', () => goSlide(current + 1));

  // Touch/swipe support
  let startX = 0;
  sliderTrack.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  sliderTrack.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goSlide(diff > 0 ? current + 1 : current - 1);
  });
}

// ===== CONTACT FORM =====
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...';
  btn.disabled = true;
  setTimeout(() => {
    form.reset();
    btn.textContent = 'Send Message';
    btn.disabled = false;
    formSuccess.classList.add('show');
    setTimeout(() => formSuccess.classList.remove('show'), 5000);
  }, 1200);
});

// ===== SMOOTH ANCHOR SCROLL (nav links) =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const page = target.closest('.page');
    if (page) {
      const idx = Array.from(pages).indexOf(page);
      if (idx !== -1) goToPage(idx);
    }
  });
});

// ===== RAIN LINES (home page) =====
const rainCanvas = document.getElementById('rainCanvas');
if (rainCanvas) {
  const ctx = rainCanvas.getContext('2d');
  const drops = [];
  const NUM = 40;

  function initCanvas() {
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
  }
  initCanvas();
  window.addEventListener('resize', initCanvas);

  for (let i = 0; i < NUM; i++) {
    drops.push({
      x: Math.random() * rainCanvas.width,
      y: Math.random() * rainCanvas.height,
      len: Math.random() * 80 + 40,
      speed: Math.random() * 1.2 + 0.4,
      opacity: Math.random() * 0.18 + 0.07,
    });
  }

  function drawRain() {
    ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
    for (const d of drops) {
      const grad = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.len);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(0.5, `rgba(255,255,255,${d.opacity})`);
      grad.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x, d.y + d.len);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.stroke();
      d.y += d.speed;
      if (d.y > rainCanvas.height) {
        d.y = -d.len;
        d.x = Math.random() * rainCanvas.width;
      }
    }
    requestAnimationFrame(drawRain);
  }
  drawRain();
}
