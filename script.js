/* ══════════════════════════════════════════
   NADRA WEDDING — script.js
════════════════════════════════════════════ */

// ── 1. COUNTDOWN TIMER ──────────────────────────────
const targetDate = new Date('2026-11-17T06:00:00');

function updateCountdown() {
  const now  = new Date();
  let diff   = Math.max(0, targetDate - now);

  const days  = Math.floor(diff / 86400000); diff %= 86400000;
  const hours = Math.floor(diff / 3600000);  diff %= 3600000;
  const mins  = Math.floor(diff / 60000);    diff %= 60000;
  const secs  = Math.floor(diff / 1000);

  const pad = n => String(n).padStart(2, '0');

  document.getElementById('days').textContent  = pad(days);
  document.getElementById('jam').textContent   = pad(hours);
  document.getElementById('menit').textContent = pad(mins);
  document.getElementById('detik').textContent = pad(secs);

  // Animate detik on change
  const detikEl = document.getElementById('detik');
  detikEl.style.transform = 'scale(1.15)';
  setTimeout(() => detikEl.style.transform = 'scale(1)', 200);
}

updateCountdown();
setInterval(updateCountdown, 1000);


// ── 2. SCROLL REVEAL ────────────────────────────────
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger children in a group
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));


// ── 3. NAVBAR: Active link on scroll ────────────────
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 80) {
      current = sec.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });

  // Navbar shadow on scroll
  const nav = document.querySelector('.mynavbar');
  if (window.scrollY > 50) {
    nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.1)';
  } else {
    nav.style.boxShadow = 'none';
  }
});


// ── 4. RSVP — Kirim Ucapan (tersimpan di localStorage) ──
const STORAGE_KEY = 'nadra_wedding_ucapan';

const sampleMessages = [
  {
    nama: 'Keluarga Besar Santoso',
    hadir: '✅ Hadir',
    ucapan: 'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fii khair. Semoga menjadi keluarga yang sakinah, mawaddah, wa rahmah. Aamiin 🤲'
  },
  {
    nama: 'Ibu Sri Wahyuni',
    hadir: '✅ Hadir',
    ucapan: 'Selamat menempuh hidup baru ya Indra & Nadia! Semoga langgeng dan selalu bahagia bersama 💐'
  }
];

// Escape HTML untuk keamanan
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Ambil semua ucapan dari localStorage
function loadMessages() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Simpan semua ucapan ke localStorage
function saveMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    console.warn('localStorage tidak tersedia.');
  }
}

// Render satu bubble ke wall (prepend = terbaru di atas)
function renderBubble({ nama, hadir, ucapan }, prepend = true) {
  const wall = document.getElementById('messages-wall');
  const el   = document.createElement('div');
  el.className = 'message-bubble';
  el.innerHTML = `
    <div class="message-sender">💌 ${escapeHtml(nama)}</div>
    ${hadir ? `<span class="message-hadir">${hadir}</span>` : ''}
    <p class="message-text">${escapeHtml(ucapan)}</p>
  `;
  if (prepend) wall.prepend(el);
  else wall.appendChild(el);
}

// Load & tampilkan semua pesan saat halaman dibuka
function initMessages() {
  const saved = loadMessages();

  if (saved && saved.length > 0) {
    // Ada data tersimpan — tampilkan dari localStorage
    // Tampilkan dari urutan lama ke baru (prepend membalik urutan)
    [...saved].reverse().forEach(m => renderBubble(m, true));
  } else {
    // Belum ada data — pakai sample default & simpan
    saveMessages(sampleMessages);
    [...sampleMessages].reverse().forEach(m => renderBubble(m, true));
  }
}

initMessages();

// Handle tombol kirim
document.getElementById('btn-kirim').addEventListener('click', () => {
  const nama   = document.getElementById('inp-nama').value.trim();
  const hadir  = document.getElementById('inp-hadir').value;
  const ucapan = document.getElementById('inp-ucapan').value.trim();

  if (!nama || !ucapan) {
    shakeInput(!nama ? 'inp-nama' : 'inp-ucapan');
    return;
  }

  const newMsg = { nama, hadir, ucapan };

  // Tambah ke localStorage
  const existing = loadMessages() || [];
  existing.push(newMsg);
  saveMessages(existing);

  // Tampilkan di wall
  renderBubble(newMsg, true);

  // Reset form
  document.getElementById('inp-nama').value   = '';
  document.getElementById('inp-hadir').value  = '';
  document.getElementById('inp-ucapan').value = '';

  // Scroll ke messages
  document.getElementById('messages-wall').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Shake animation for empty required field
function shakeInput(id) {
  const el = document.getElementById(id);
  el.style.borderColor = '#e74c3c';
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => {
    el.style.animation = '';
    el.style.borderColor = '';
  }, 500);
}

// Add shake keyframe dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);


// ── 5. COPY REKENING ────────────────────────────────
function copyRek(id) {
  const text = document.getElementById(id).textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    showToast('Nomor rekening disalin! ✅');
  }).catch(() => {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast('Nomor rekening disalin! ✅');
  });
}

function showToast(msg) {
  const existing = document.querySelector('.toast-notif');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notif';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 32px; left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #1a1209;
    color: #e8d48b;
    padding: 12px 28px;
    border-radius: 50px;
    font-size: 13px;
    letter-spacing: 1px;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    border: 1px solid rgba(201,168,76,0.3);
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}


// ── 6. GALLERY LIGHTBOX ─────────────────────────────
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
const lbClose  = document.getElementById('lb-close');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const bg = item.style.backgroundImage;
    const url = bg.replace(/url\(["']?/, '').replace(/["']?\)/, '');
    if (url && url !== 'none') {
      lbImg.src = url;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });
});

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}


// ── 7. MUSIC PLAYER + FIX AUTOPLAY HP ───────────────
const audio      = document.getElementById('bg-audio');
const musicBtn   = document.getElementById('music-btn');
const musicIcon  = document.getElementById('music-icon');
const eqBars     = document.getElementById('eq-bars');
let   isPlaying  = false;

function setPlaying(state) {
  isPlaying = state;
  // Ganti icon
  musicIcon.className = state ? 'bi bi-pause-fill' : 'bi bi-music-note-beamed';
  // Animasi EQ bars
  eqBars.className = state ? 'playing' : '';
}

function tryPlay() {
  audio.play()
    .then(() => setPlaying(true))
    .catch(() => {
      // Autoplay diblokir browser — tunggu interaksi user
      setPlaying(false);
    });
}

// Tombol play/pause
musicBtn.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();
    setPlaying(false);
  } else {
    tryPlay();
  }
});

// ── FIX AUTOPLAY HP ──
// Browser mobile blokir autoplay sampai ada interaksi pertama.
// Kita "tangkap" interaksi pertama user (tap/klik/scroll) lalu play otomatis.
let autoplayUnlocked = false;

function unlockAutoplay() {
  if (autoplayUnlocked) return;
  autoplayUnlocked = true;

  // Coba play setelah interaksi pertama
  tryPlay();

  // Hapus listener setelah berhasil unlock
  ['touchstart', 'touchend', 'click', 'scroll'].forEach(evt => {
    document.removeEventListener(evt, unlockAutoplay);
  });
}

['touchstart', 'touchend', 'click', 'scroll'].forEach(evt => {
  document.addEventListener(evt, unlockAutoplay, { once: true, passive: true });
});

// ── 8. SMOOTH SCROLL for nav links ──────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close offcanvas navbar if open
      const offcanvas = document.getElementById('offcanvasNavbar');
      if (offcanvas && offcanvas.classList.contains('show')) {
        bootstrap.Offcanvas.getInstance(offcanvas)?.hide();
      }
    }
  });
});
