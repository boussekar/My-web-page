/* AURUM — auth.js */

/* ── Theme ── */
const body = document.body;
const savedTheme = localStorage.getItem('aurum-theme') || 'dark-mode';
body.className = savedTheme;

// Update theme icon on load
const themeIcon = document.getElementById('themeIcon');
if (themeIcon) {
  themeIcon.textContent = savedTheme === 'dark-mode' ? '☀' : '☾';
}

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light-mode' : 'dark-mode';
    body.className = newTheme;
    localStorage.setItem('aurum-theme', newTheme);
    themeIcon.textContent = isDark ? '☾' : '☀';
    
    // Add click animation
    themeToggle.style.animation = 'none';
    setTimeout(() => {
      themeToggle.style.animation = '';
    }, 10);
  });
}

/* ── Role Switcher ── */
const roleGuest = document.getElementById('roleGuest');
const roleOwner = document.getElementById('roleOwner');
const guestSection = document.getElementById('guestSection');
const ownerSection = document.getElementById('ownerSection');

function switchRole(role) {
  if (role === 'guest') {
    roleGuest.classList.add('active');
    roleOwner.classList.remove('active');
    guestSection.classList.remove('hidden');
    ownerSection.classList.add('hidden');
  } else {
    roleOwner.classList.add('active');
    roleGuest.classList.remove('active');
    ownerSection.classList.remove('hidden');
    guestSection.classList.add('hidden');
  }
}

roleGuest.addEventListener('click', () => switchRole('guest'));
roleOwner.addEventListener('click', () => switchRole('owner'));

/* ── Auto-switch role from URL param (must run after switchRole is defined) ── */
(function() {
  const p = new URLSearchParams(window.location.search);
  if (p.get('role') === 'owner') {
    switchRole('owner');
  }
})();

/* ── Guest Tabs ── */
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginWrap = document.getElementById('loginWrap');
const registerWrap = document.getElementById('registerWrap');

tabLogin.addEventListener('click', () => switchGuestTab('login'));
tabRegister.addEventListener('click', () => switchGuestTab('register'));
document.getElementById('goRegisterLink').addEventListener('click', e => { e.preventDefault(); switchGuestTab('register'); });
document.getElementById('goLoginLink').addEventListener('click', e => { e.preventDefault(); switchGuestTab('login'); });

function switchGuestTab(tab) {
  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginWrap.classList.remove('hidden');
    registerWrap.classList.add('hidden');
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerWrap.classList.remove('hidden');
    loginWrap.classList.add('hidden');
  }
}

/* ── Owner Tabs ── */
const ownerTabLogin = document.getElementById('ownerTabLogin');
const ownerTabRegister = document.getElementById('ownerTabRegister');
const ownerLoginWrap = document.getElementById('ownerLoginWrap');
const ownerRegWrap = document.getElementById('ownerRegisterWrap');

ownerTabLogin.addEventListener('click', () => switchOwnerTab('login'));
ownerTabRegister.addEventListener('click', () => switchOwnerTab('register'));
document.getElementById('goOwnerRegisterLink').addEventListener('click', e => { e.preventDefault(); switchOwnerTab('register'); });
document.getElementById('goOwnerLoginLink').addEventListener('click', e => { e.preventDefault(); switchOwnerTab('login'); });

function switchOwnerTab(tab) {
  if (tab === 'login') {
    ownerTabLogin.classList.add('active');
    ownerTabRegister.classList.remove('active');
    ownerLoginWrap.classList.remove('hidden');
    ownerRegWrap.classList.add('hidden');
  } else {
    ownerTabRegister.classList.add('active');
    ownerTabLogin.classList.remove('active');
    ownerRegWrap.classList.remove('hidden');
    ownerLoginWrap.classList.add('hidden');
  }
}

/* ── Helpers ── */
function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    if (msg) {
      setTimeout(() => el.textContent = '', 3000);
    }
  }
}
function clearError(id) { setError(id, ''); }
function highlightInvalid(inputId) {
  const el = document.getElementById(inputId);
  if (el) {
    el.style.borderColor = '#e74c3c';
    setTimeout(() => el.style.borderColor = '', 2000);
  }
}

window.togglePw = function(id, btn) {
  const inp = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.style.opacity = show ? '1' : '0.5';
};

window.checkStrength = function(val) {
  applyStrength(val, 'strengthFill', 'strengthLabel');
};
window.checkOwnerStrength = function(val) {
  applyStrength(val, 'ownerStrFill', 'ownerStrLabel');
};
function applyStrength(val, fillId, labelId) {
  const fill = document.getElementById(fillId);
  const label = document.getElementById(labelId);
  if (!fill || !label) return;
  if (!val) { fill.style.width = '0%'; label.textContent = ''; return; }
  let score = 0;
  if (val.length >= 8) score++;
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
  fill.style.width = s.w; fill.style.background = s.bg;
  label.textContent = s.txt; label.style.color = s.bg;
}

/* ── Toast message ── */
function showMsg(text, type) {
  let el = document.getElementById('authMsg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'authMsg';
    el.style.cssText = 'position:fixed;bottom:32px;right:32px;z-index:9999;padding:14px 24px;font-size:12px;letter-spacing:0.5px;border:1px solid;max-width:340px;line-height:1.5;transition:all 0.4s;opacity:0;transform:translateY(10px);font-family:Jost,sans-serif;background:var(--bg2);';
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.borderColor = type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : 'rgba(201,169,110,0.5)';
  el.style.color = type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : '#c9a96e';
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  clearTimeout(window._msgT);
  window._msgT = setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(10px)'; }, 3500);
}

/* ── Success Overlay ── */
function showSuccessOverlay(title, subtitle) {
  let overlay = document.getElementById('successOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'successOverlay';
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
      <div class="success-content">
        <div class="success-checkmark">
          <svg viewBox="0 0 50 50" width="50" height="50">
            <circle cx="25" cy="25" r="23" fill="none" stroke="currentColor" stroke-width="2" class="checkmark-circle"/>
            <path d="M14 27l7 7 15-15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="checkmark-check"/>
          </svg>
        </div>
        <div class="success-text" id="successText"></div>
        <div class="success-subtext" id="successSubtext"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const successTextEl = document.getElementById('successText');
  const successSubtextEl = document.getElementById('successSubtext');
  if (successTextEl) successTextEl.textContent = title || 'Welcome!';
  if (successSubtextEl) successSubtextEl.textContent = subtitle || 'Redirecting...';

  requestAnimationFrame(() => {
    overlay.classList.add('show');
  });
}

/* ── Guest Login ── */
document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  let ok = true;
  clearError('loginEmailErr'); clearError('loginPassErr');
  if (!email || !email.includes('@')) { setError('loginEmailErr', 'Please enter a valid email.'); highlightInvalid('loginEmail'); ok = false; }
  if (!pass) { setError('loginPassErr', 'Password is required.'); highlightInvalid('loginPass'); ok = false; }
  if (!ok) return;

  const name = email.split('@')[0].replace(/[._]/g, ' ');
  const initials = name.split(' ').map(n => n[0]?.toUpperCase()).join('').slice(0,2);
  localStorage.setItem('aurum-user', JSON.stringify({ name, initials, email, role: 'guest' }));
  localStorage.setItem('aurum-theme', body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
  showSuccessOverlay('Welcome back!', 'Redirecting to your account...');
  setTimeout(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const next = p.get('nextBooking');
      if (next) { window.location.href = `index.html?openBooking=${encodeURIComponent(next)}`; return; }
    } catch(e){}
    window.location.href = 'index.html';
  }, 1500);
});

/* ── Guest Register ── */
document.getElementById('registerBtn').addEventListener('click', () => {
  const first = document.getElementById('regFirst').value.trim();
  const last = document.getElementById('regLast').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const agreed = document.getElementById('agreeTerms').checked;
  let ok = true;
  ['regFirstErr','regLastErr','regEmailErr','regPassErr','regPass2Err','agreeErr'].forEach(id => clearError(id));
  if (!first) { setError('regFirstErr', 'Required.'); ok = false; }
  if (!last) { setError('regLastErr', 'Required.'); ok = false; }
  if (!email || !email.includes('@')) { setError('regEmailErr', 'Please enter a valid email.'); ok = false; }
  if (pass.length < 8) { setError('regPassErr', 'Password must be at least 8 characters.'); ok = false; }
  if (pass !== pass2) { setError('regPass2Err', 'Passwords do not match.'); ok = false; }
  if (!agreed) { setError('agreeErr', 'Please accept the Terms of Service.'); ok = false; }
  if (!ok) return;

  const name = `${first} ${last}`;
  const initials = `${first[0]}${last[0]}`.toUpperCase();
  localStorage.setItem('aurum-user', JSON.stringify({ name, initials, email, role: 'guest' }));
  localStorage.setItem('aurum-theme', body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
  showSuccessOverlay(`Welcome to AURUM, ${first}!`, 'Setting up your account...');
  setTimeout(() => window.location.href = 'index.html', 1500);
});

/* ── Owner Login ── */
document.getElementById('ownerLoginBtn').addEventListener('click', () => {
  const email = document.getElementById('ownerLoginEmail').value.trim();
  const pass = document.getElementById('ownerLoginPass').value;
  let ok = true;
  clearError('ownerLoginEmailErr'); clearError('ownerLoginPassErr');
  if (!email || !email.includes('@')) { setError('ownerLoginEmailErr', 'Please enter a valid email.'); ok = false; }
  if (!pass) { setError('ownerLoginPassErr', 'Password is required.'); ok = false; }
  if (!ok) return;

  const name = email.split('@')[0].replace(/[._]/g, ' ');
  const initials = name.split(' ').map(n => n[0]?.toUpperCase()).join('').slice(0,2);
  const existingOwner = JSON.parse(localStorage.getItem('aurum-owner') || 'null');
  localStorage.setItem('aurum-user', JSON.stringify({ name, initials, email, role: 'owner', hotelName: existingOwner?.hotelName || '' }));
  localStorage.setItem('aurum-theme', body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
  showSuccessOverlay('Welcome back!', 'Accessing your dashboard...');
  setTimeout(() => window.location.href = 'owner-dashboard.html', 1500);
});

/* ── Owner Register ── */
document.getElementById('ownerRegisterBtn').addEventListener('click', () => {
  const first = document.getElementById('ownerFirst').value.trim();
  const last = document.getElementById('ownerLast').value.trim();
  const email = document.getElementById('ownerEmail').value.trim();
  const hotel = document.getElementById('ownerHotel').value.trim();
  const pass = document.getElementById('ownerPass').value;
  const agreed = document.getElementById('ownerAgreeTerms').checked;
  let ok = true;
  ['ownerFirstErr','ownerLastErr','ownerEmailErr','ownerHotelErr','ownerPassErr','ownerAgreeErr'].forEach(id => clearError(id));
  if (!first) { setError('ownerFirstErr', 'Required.'); ok = false; }
  if (!last) { setError('ownerLastErr', 'Required.'); ok = false; }
  if (!email || !email.includes('@')) { setError('ownerEmailErr', 'Please enter a valid email.'); ok = false; }
  if (!hotel) { setError('ownerHotelErr', 'Hotel name is required.'); ok = false; }
  if (pass.length < 8) { setError('ownerPassErr', 'Password must be at least 8 characters.'); ok = false; }
  if (!agreed) { setError('ownerAgreeErr', 'Please accept the Partner Terms.'); ok = false; }
  if (!ok) return;

  const name = `${first} ${last}`;
  const initials = `${first[0]}${last[0]}`.toUpperCase();
  localStorage.setItem('aurum-user', JSON.stringify({ name, initials, email, role: 'owner', hotelName: hotel }));
  localStorage.setItem('aurum-owner', JSON.stringify({ name, initials, email, hotelName: hotel, registered: new Date().toISOString() }));
  localStorage.setItem('aurum-theme', body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
  showSuccessOverlay(`Welcome to AURUM, ${first}!`, 'Setting up your dashboard...');
  setTimeout(() => window.location.href = 'owner-dashboard.html', 1500);
});

/* ── Social Login ── */
window.socialLogin = function(provider) {
  showSuccessOverlay(`Signing in with ${provider}...`, 'Please wait');
  setTimeout(() => {
    const name = provider + ' User';
    const initials = provider[0] + 'U';
    localStorage.setItem('aurum-user', JSON.stringify({ name, initials, email: provider.toLowerCase() + '@user.com', role: 'guest' }));
    localStorage.setItem('aurum-theme', body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
    showSuccessOverlay(`Welcome, ${name}!`, 'Redirecting...');
    setTimeout(() => window.location.href = 'index.html', 1000);
  }, 1500);
};
