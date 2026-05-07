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

// Guestbook
// Aqui van los mensajes que te van mandando las personas.
// Solo agrega un objeto nuevo al array siguiendo el mismo formato.
const STATIC_MESSAGES = [
  {
    text: 'Dicen que detrás de una gran persona, hay una gran madre... y detrás de esa madre, ¡una abuela que sabe perfectamente que la madre está exagerando! Gracias por ser mi equipo favorito, por los consejos (aunque a veces no los siga a la primera) y por quererme incluso cuando me pongo insoportable. ¡Feliz día!',
    name: 'Deby',
    date: 'Mayo 2026'
  },
];

const accentColors = [
  { bg: 'msg-purple', color: 'var(--accent-primary)' },
  { bg: 'msg-cyan', color: 'var(--accent-tertiary)' },
  { bg: 'msg-pink', color: 'var(--accent-secondary)' },
  { bg: 'msg-gold', color: 'var(--accent-gold)' },
];

function loadMessages() {
  const grid = document.getElementById('messagesGrid');
  STATIC_MESSAGES.forEach(msg => {
    grid.appendChild(createMessageCard(msg));
  });
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
