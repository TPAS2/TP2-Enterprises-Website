'use strict';

// ===== FLOATING IIS =====
const iisEl = document.getElementById('floatingIis');
if (iisEl) {
  const W = () => window.innerWidth - iisEl.offsetWidth - 10;
  const H = () => window.innerHeight - iisEl.offsetHeight - 10;
  let x = Math.random() * W();
  let y = Math.random() * H();
  let vx = (Math.random() * 1.2 + 0.4) * (Math.random() > 0.5 ? 1 : -1);
  let vy = (Math.random() * 1.2 + 0.4) * (Math.random() > 0.5 ? 1 : -1);

  iisEl.style.left = x + 'px';
  iisEl.style.top  = y + 'px';

  function driftIis() {
    x += vx;
    y += vy;
    if (x <= 0)    { x = 0;    vx = Math.abs(vx); }
    if (x >= W())  { x = W();  vx = -Math.abs(vx); }
    if (y <= 0)    { y = 0;    vy = Math.abs(vy); }
    if (y >= H())  { y = H();  vy = -Math.abs(vy); }
    iisEl.style.left = x + 'px';
    iisEl.style.top  = y + 'px';
    requestAnimationFrame(driftIis);
  }
  driftIis();
}

// ===== HERO PARTICLES =====
const particleContainer = document.getElementById('heroParticles');
if (particleContainer) {
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      animation-duration: ${Math.random() * 10 + 8}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: 0;
      background: ${Math.random() > 0.5 ? '#ff7d3b' : '#ffe03b'};
    `;
    particleContainer.appendChild(p);
  }
}

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ===== MOBILE NAV =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ===== PAGE-TURN DOTS =====
const pages = document.querySelectorAll('.page');
const indicator = document.getElementById('pageIndicator');
let currentPage = 0;

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
}

function goToPage(index) {
  pages[index].scrollIntoView({ behavior: 'smooth' });
}

// ===== PAGE TURN ANIMATION on scroll snap =====
const pageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
      const index = Array.from(pages).indexOf(entry.target);

      // animate the incoming page
      entry.target.classList.remove('turning-in');
      void entry.target.offsetWidth; // force reflow
      entry.target.classList.add('turning-in');
      entry.target.addEventListener('animationend', () => {
        entry.target.classList.remove('turning-in');
      }, { once: true });

      currentPage = index;
      updateDots(index);

      // trigger stat counters when stats page appears
      if (entry.target.id === 'page-4') triggerCounters();
    }
  });
}, { threshold: 0.5 });

pages.forEach(page => pageObserver.observe(page));

// ===== SERVICE CARD FADE-IN =====
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.service-card').forEach(card => cardObserver.observe(card));

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
    // find which page contains this id
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const page = target.closest('.page');
    if (page) {
      page.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
