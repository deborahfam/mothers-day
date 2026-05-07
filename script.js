// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Staggered card animations
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const cards = entry.target.querySelectorAll('.quality-card, .promise-card, .message-card, .write-card, .momento-card');
      cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 50);
      });
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card-grid, .messages-grid, .momento-cards').forEach(el => cardObserver.observe(el));

// Carousel pause on hover
const track = document.getElementById('carouselTrack');
if (track) {
  track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
  track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
}

// Guestbook — Cloudflare Pages Functions + D1 (SQLite)
// El backend vive en /functions/api/messages.js, mismo origen que el sitio
const API_BASE = '/api';

const accentColors = [
  { bg: 'msg-purple', color: 'var(--accent-primary)' },
  { bg: 'msg-cyan', color: 'var(--accent-tertiary)' },
  { bg: 'msg-pink', color: 'var(--accent-secondary)' },
  { bg: 'msg-gold', color: 'var(--accent-gold)' },
];

async function loadMessages() {
  const grid = document.getElementById('messagesGrid');
  const writeCard = document.getElementById('writeCard');
  try {
    const res = await fetch(`${API_BASE}/messages`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const messages = await res.json();
    messages.forEach(msg => {
      const card = createMessageCard(msg);
      grid.insertBefore(card, writeCard);
    });
  } catch (err) {
    console.error('Error cargando mensajes:', err);
  }
}

function createMessageCard(msg) {
  const style = accentColors[Math.floor(Math.random() * accentColors.length)];
  const card = document.createElement('div');
  card.className = `message-card ${style.bg}`;
  card.innerHTML = `
    <p class="msg-quote">"${escapeHtml(msg.text)}"</p>
    <div class="msg-divider" style="background:${style.color};"></div>
    <div class="msg-author">
      <div class="msg-avatar" style="background:${style.color};"></div>
      <div><strong>${escapeHtml(msg.name)}</strong><small>${msg.date}</small></div>
    </div>
  `;
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  requestAnimationFrame(() => {
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });
  return card;
}

async function sendMessage() {
  const msgInput = document.getElementById('msgInput');
  const nameInput = document.getElementById('nameInput');
  const sendBtn = document.getElementById('sendBtn');
  const text = msgInput.value.trim();
  const name = nameInput.value.trim() || 'Anonimo';

  if (!text) {
    msgInput.style.borderColor = 'var(--accent-secondary)';
    setTimeout(() => { msgInput.style.borderColor = ''; }, 1500);
    return;
  }

  const now = new Date();
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const date = `${months[now.getMonth()]} ${now.getFullYear()}`;

  const originalLabel = sendBtn.textContent;
  sendBtn.disabled = true;
  sendBtn.textContent = 'Enviando...';

  let saved;
  try {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, name, date })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    saved = await res.json();
  } catch (err) {
    console.error('Error enviando mensaje:', err);
    msgInput.style.borderColor = 'var(--accent-secondary)';
    setTimeout(() => { msgInput.style.borderColor = ''; }, 1500);
    sendBtn.disabled = false;
    sendBtn.textContent = originalLabel;
    return;
  }

  sendBtn.disabled = false;
  sendBtn.textContent = originalLabel;

  const grid = document.getElementById('messagesGrid');
  const writeCard = document.getElementById('writeCard');
  const card = createMessageCard(saved);
  grid.insertBefore(card, writeCard);

  msgInput.value = '';
  nameInput.value = '';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Parallax on neon streaks
window.addEventListener('scroll', () => {
  document.querySelectorAll('.neon-streak').forEach((streak, i) => {
    const speed = 0.02 + (i % 4) * 0.01;
    const section = streak.closest('section') || streak.closest('footer');
    if (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = (rect.top / window.innerHeight) * 30 * speed;
        streak.style.marginTop = `${offset}px`;
      }
    }
  });
}, { passive: true });

// Load saved messages on page load
document.addEventListener('DOMContentLoaded', loadMessages);
