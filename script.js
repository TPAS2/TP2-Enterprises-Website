'use strict';

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const book = document.getElementById('book');
book.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', book.scrollTop > 40);
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
}, { threshold: 0.5, root: book });

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
