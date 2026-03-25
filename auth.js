/* ═══════════════════════════
   AURUM — auth.js
═══════════════════════════ */

/* ── Theme ── */
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

// Load saved theme
const savedTheme = localStorage.getItem('aurum-theme') || 'dark-mode';
body.className = savedTheme;
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const isDark = body.classList.contains('dark-mode');
  const next = isDark ? 'light-mode' : 'dark-mode';
  body.className = next;
  localStorage.setItem('aurum-theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(mode) {
  themeIcon.textContent = mode === 'dark-mode' ? '☀' : '☾';
}

/* ── Tabs ── */
const tabLogin    = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginWrap   = document.getElementById('loginWrap');
const registerWrap= document.getElementById('registerWrap');

function switchToLogin() {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginWrap.classList.remove('hidden');
  registerWrap.classList.add('hidden');
}
function switchToRegister() {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerWrap.classList.remove('hidden');
  loginWrap.classList.add('hidden');
}

tabLogin.addEventListener('click', switchToLogin);
tabRegister.addEventListener('click', switchToRegister);
document.getElementById('goRegisterLink').addEventListener('click', e => { e.preventDefault(); switchToRegister(); });
document.getElementById('goLoginLink').addEventListener('click', e => { e.preventDefault(); switchToLogin(); });

/* ── Password toggle ── */
window.togglePw = function(id, btn) {
  const inp = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.style.opacity = show ? '1' : '0.5';
};

/* ── Password Strength ── */
window.checkStrength = function(val) {
  const fill  = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  if (!val) { fill.style.width='0%'; label.textContent=''; return; }
  let score = 0;
  if (val.length >= 8)  score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const map = [
    { w:'20%', bg:'#e74c3c', txt:'Weak' },
    { w:'45%', bg:'#e67e22', txt:'Fair' },
    { w:'70%', bg:'#f1c40f', txt:'Good' },
    { w:'100%',bg:'#2ecc71', txt:'Strong' },
  ];
  const s = map[score - 1] || map[0];
  fill.style.width      = s.w;
  fill.style.background = s.bg;
  label.textContent     = s.txt;
  label.style.color     = s.bg;
};

/* ── Login ── */
document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  if (!email || !pass) { showMsg('Please fill in all fields.', 'error'); return; }
  if (!email.includes('@')) { showMsg('Please enter a valid email.', 'error'); return; }

  // Save user to localStorage so index.html can read it
  const name = email.split('@')[0].replace(/[._]/g, ' ');
  const initials = name.split(' ').map(n=>n[0]?.toUpperCase()).join('').slice(0,2);
  localStorage.setItem('aurum-user', JSON.stringify({ name, initials, email }));
  localStorage.setItem('aurum-theme', body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');

  showMsg('Welcome back! Redirecting…', 'success');
  setTimeout(() => {
    // If login was initiated to complete a booking, preserve that intent
    try {
      const params = new URLSearchParams(window.location.search);
      const next = params.get('nextBooking');
      if (next) return window.location.href = `index.html?openBooking=${encodeURIComponent(next)}`;
    } catch(e){}
    window.location.href = 'index.html';
  }, 1100);
});

/* ── Register ── */
document.getElementById('registerBtn').addEventListener('click', () => {
  const first  = document.getElementById('regFirst').value.trim();
  const last   = document.getElementById('regLast').value.trim();
  const email  = document.getElementById('regEmail').value.trim();
  const pass   = document.getElementById('regPass').value;
  const pass2  = document.getElementById('regPass2').value;
  const agreed = document.getElementById('agreeTerms').checked;

  if (!first || !last || !email || !pass) { showMsg('Please fill in all required fields.', 'error'); return; }
  if (!email.includes('@')) { showMsg('Please enter a valid email.', 'error'); return; }
  if (pass.length < 8) { showMsg('Password must be at least 8 characters.', 'error'); return; }
  if (pass !== pass2)  { showMsg('Passwords do not match.', 'error'); return; }
  if (!agreed) { showMsg('Please accept the Terms of Service.', 'error'); return; }

  const name = `${first} ${last}`;
  const initials = `${first[0]}${last[0]}`.toUpperCase();
  localStorage.setItem('aurum-user', JSON.stringify({ name, initials, email }));
  localStorage.setItem('aurum-theme', body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');

  showMsg(`Welcome to AURUM, ${first}! Redirecting…`, 'success');
  setTimeout(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const next = params.get('nextBooking');
      if (next) return window.location.href = `index.html?openBooking=${encodeURIComponent(next)}`;
    } catch(e){}
    window.location.href = 'index.html';
  }, 1200);
});

/* ── Social Login ── */
window.socialLogin = function(provider) {
  showMsg(`${provider} login coming soon.`, '');
};

/* ── Inline message (no toast element in auth) ── */
function showMsg(text, type) {
  let el = document.getElementById('authMsg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'authMsg';
    el.style.cssText = `
      position:fixed; bottom:32px; right:32px; z-index:9999;
      padding:14px 24px; font-size:12px; letter-spacing:0.5px;
      border:1px solid; max-width:340px; line-height:1.5;
      transition:all 0.4s; opacity:0; transform:translateY(10px);
      font-family:'Jost',sans-serif;
      background: var(--bg2);
    `;
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.borderColor  = type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : 'rgba(201,169,110,0.5)';
  el.style.color        = type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : '#c9a96e';
  el.style.opacity      = '1';
  el.style.transform    = 'translateY(0)';
  clearTimeout(window._msgT);
  window._msgT = setTimeout(() => { el.style.opacity='0'; el.style.transform='translateY(10px)'; }, 3500);
}
