// ===== Year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Navbar scroll state =====
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 20);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('.section__head, .card, .join__inner, .footer__inner');
revealEls.forEach((el) => el.classList.add('reveal'));
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => io.observe(el));

// Stagger cards within a group
document.querySelectorAll('.cards').forEach((group) => {
  group.querySelectorAll('.card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 90}ms`;
  });
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Interactive halftone handshake =====
(function halftone() {
  const canvas = document.getElementById('halftone');
  const data = window.HALFTONE;
  if (!canvas || !data) return;
  const ctx = canvas.getContext('2d');

  const WHITEN = 0.45;   // blend dots toward white (matches reference look)
  const RADIUS = 0.62;   // max dot radius as fraction of a cell
  let w, h, dpr, cell, maxR, dots = [];
  const mouse = { x: -9999, y: -9999, active: false };

  // Pre-blend each dot color toward white once.
  const palette = data.dots.map(([, , , r, g, b]) => {
    const R = Math.round(r + (255 - r) * WHITEN);
    const G = Math.round(g + (255 - g) * WHITEN);
    const B = Math.round(b + (255 - b) * WHITEN);
    return `${R},${G},${B}`;
  });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = w / data.cols;
    maxR = cell * RADIUS;
    dots = data.dots.map(([nx, ny, rf], i) => ({
      x: nx * w, y: ny * h,
      baseR: rf * maxR,
      color: palette[i],
      // gentle per-dot phase for idle shimmer
      ph: (nx * 7.3 + ny * 11.1) % (Math.PI * 2),
    }));
  }

  let t = 0;
  function render() {
    t += 0.016;
    ctx.clearRect(0, 0, w, h);
    const R2 = 120 * 120; // interaction radius squared
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      let x = d.x, y = d.y, r = d.baseR;

      // idle shimmer
      if (!reduceMotion) r *= 0.88 + 0.12 * Math.sin(t * 1.6 + d.ph);

      // mouse repulsion + glow
      if (mouse.active) {
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < R2) {
          const f = 1 - dist2 / R2;
          const dist = Math.sqrt(dist2) || 1;
          x += (dx / dist) * f * 16;
          y += (dy / dist) * f * 16;
          r *= 1 + f * 0.9;
        }
      }

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${d.color})`;
      ctx.fill();
    }
    requestAnimationFrame(render);
  }

  function setMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    mouse.x = p.clientX - rect.left;
    mouse.y = p.clientY - rect.top;
    mouse.active = true;
  }
  canvas.addEventListener('mousemove', setMouse);
  canvas.addEventListener('touchmove', setMouse, { passive: true });
  canvas.addEventListener('mouseleave', () => { mouse.active = false; });
  canvas.addEventListener('touchend', () => { mouse.active = false; });

  resize();
  window.addEventListener('resize', resize);
  render();
})();

// ===== Contact form (Web3Forms) =====
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.className = 'form__status';

  const data = new FormData(form);
  const name = (data.get('name') || '').toString().trim();
  const email = (data.get('email') || '').toString().trim();
  const subject = (data.get('subject') || '').toString().trim();
  const message = (data.get('message') || '').toString().trim();

  if (!name || !email || !subject || !message) {
    status.textContent = 'Please fill in all fields.';
    status.classList.add('is-err');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    status.textContent = 'Please enter a valid email address.';
    status.classList.add('is-err');
    return;
  }

  const accessKey = (data.get('access_key') || '').toString();
  if (accessKey === 'YOUR_WEB3FORMS_KEY') {
    status.textContent = 'Form not configured — paste your Web3Forms access key into contact.html.';
    status.classList.add('is-err');
    return;
  }

  const original = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  status.textContent = '';

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data,
    });
    const out = await res.json().catch(() => ({}));
    if (res.ok && out.success) {
      status.textContent = "Thanks! We've received your message and will be in touch soon.";
      status.classList.add('is-ok');
      form.reset();
    } else {
      status.textContent = out.message || 'Something went wrong. Please try again.';
      status.classList.add('is-err');
    }
  } catch (err) {
    status.textContent = 'Network error. Please try again or email us directly.';
    status.classList.add('is-err');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = original;
  }
});
