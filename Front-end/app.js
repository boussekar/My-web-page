/* ═══════════════════════════════════════════════
   AURUM — app.js (integrated with backend API)
═══════════════════════════════════════════════ */

// ================== API CONFIG ==================
const API_BASE = '/backend/api';  // ← غيّر هذا المسار حسب إعداد السيرفر

// ================== AI CONFIG ==================
// تم نقل مفتاح Claude API إلى الخادم (backend/api/ai-concierge.php)

/* ══════════ THEME ══════════ */
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

const savedTheme = localStorage.getItem('aurum-theme') || 'dark-mode';
body.className = savedTheme;
setThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const isDark = body.classList.contains('dark-mode');
  const next = isDark ? 'light-mode' : 'dark-mode';
  body.className = next;
  localStorage.setItem('aurum-theme', next);
  setThemeIcon(next);
});

function setThemeIcon(mode) {
  themeIcon.textContent = mode === 'dark-mode' ? '☀' : '☾';
}

/* ══════════ CURSOR ══════════ */
// Custom cursor disabled - using default system cursor

/* ══════════ SESSION ══════════ */
const navUser       = document.getElementById('navUser');
const navUserLogged = document.getElementById('navUserLogged');
const navAvatar     = document.getElementById('navAvatar');
const navUsername   = document.getElementById('navUsername');

const savedUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
if (savedUser) {
  navUser.style.display = 'none';
  navUserLogged.classList.remove('hidden');
  navAvatar.textContent   = savedUser.initials || '??';
  navUsername.textContent = savedUser.name.split(' ')[0];
}

document.getElementById("navSignout")?.addEventListener("click", () => {
  localStorage.removeItem('aurum-user');
  localStorage.removeItem('aurum-token');
  navUserLogged.classList.add('hidden');
  navUser.style.display = '';
  showToast('You have been signed out.');
});

/* ══════════ NAV ══════════ */
const navbar   = document.getElementById('navbar');
const pages    = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40));

function showPage(id) {
  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (target) {
    target.classList.add('active');
    const offset = (navbar && navbar.offsetHeight) ? navbar.offsetHeight + 8 : 0;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
  navLinks.forEach(l => { if (l.dataset.page === id) l.classList.add('active'); });
  document.querySelector('.nav-links')?.classList.remove('mobile-open');
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    if (link.dataset.page) { e.preventDefault(); showPage(link.dataset.page); return; }
    if (link.getAttribute('href') === 'owner.html') {
      e.preventDefault();
      const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
      if (!curUser || curUser.role !== 'owner') {
        showSideSigninTip(link, null, 'You need to sign in as an owner to list your property');
      } else {
        window.location.href = 'owner.html';
      }
    }
  });
});

/* ══════════ HOTEL DATABASE (loaded from API) ══════════ */
let hotelDatabase = [];

async function loadHotelsFromAPI() {
    try {
        const res = await fetch(`${API_BASE}/hotels`);
        const data = await res.json();
        if (data.success) {
            hotelDatabase = data.data;
            renderResults(filterHotels('Paris', 1, 0, 'any'), 'Paris', 1, 0, 'any');
        } else {
            console.warn('API hotels failed, using local fallback');
            useLocalHotelDatabase();
        }
    } catch(e) {
        console.error('Error loading hotels from API', e);
        useLocalHotelDatabase();
    }
}

function useLocalHotelDatabase() {
    hotelDatabase = [
        { id:1, name:'Le Grand Hôtel', city:'Paris', country:'France', stars:5, price:450, rating:4.9, reviews:1284, desc:'Belle Époque grandeur at the heart of Paris...', amenities:['Wi-Fi','Spa','Restaurant','Concierge','Bar'], initial:'LG', color:'#1a1208', maxChildren:4, rooms:3, photos: makePhotos('LG','#1a1208','#2a1f0a','#180e04') },
        { id:2, name:'Hôtel de Crillon', city:'Paris', country:'France', stars:5, price:980, rating:4.95, reviews:876, desc:'A palatial 18th-century landmark...', amenities:['Wi-Fi','Pool','Spa','Restaurant','Concierge'], initial:'HC', color:'#14100a', maxChildren:2, rooms:5, photos: makePhotos('HC','#14100a','#201808','#0e0c06') },
        { id:3, name:'Burj Al Arab', city:'Dubai', country:'UAE', stars:5, price:1800, rating:4.85, reviews:2341, desc:'The world\'s most iconic hotel...', amenities:['Pool','Spa','Restaurant','Bar','Transfer','Concierge'], initial:'BA', color:'#0a1218', maxChildren:3, rooms:2, photos: makePhotos('BA','#0a1218','#0d1e2e','#06101a') },
    ];
    renderResults(filterHotels('Paris', 1, 0, 'any'), 'Paris', 1, 0, 'any');
}

function makePhotos(initial, c1, c2, c3) {
  return {
    hotel: [
      { gradient:`linear-gradient(135deg,${c1},${c2})`, label:'Exterior', initial },
      { gradient:`linear-gradient(160deg,${c2},${c3})`, label:'Lobby',    initial },
      { gradient:`linear-gradient(120deg,${c1},${c3})`, label:'Terrace',  initial },
      { gradient:`linear-gradient(180deg,${c3},${c2})`, label:'Garden / Courtyard', initial },
    ],
    rooms: [
      { gradient:`linear-gradient(140deg,${c1},${c3})`, label:'Deluxe Room',     initial },
      { gradient:`linear-gradient(160deg,${c2},${c1})`, label:'Suite',           initial },
      { gradient:`linear-gradient(120deg,${c3},${c2})`, label:'Grand Suite',     initial },
      { gradient:`linear-gradient(180deg,${c1},${c2})`, label:'Presidential Suite', initial },
    ],
    amenities: [
      { gradient:`linear-gradient(135deg,${c2},${c3})`, label:'Swimming Pool',   initial },
      { gradient:`linear-gradient(150deg,${c1},${c2})`, label:'Spa & Wellness',  initial },
      { gradient:`linear-gradient(125deg,${c3},${c1})`, label:'Restaurant',      initial },
      { gradient:`linear-gradient(165deg,${c2},${c1})`, label:'Bar & Lounge',    initial },
    ],
  };
}

/* ══════════ CUSTOM SEARCH DROPDOWNS ══════════ */
function initCustomSelect(id, hiddenSelectId) {
  const container = document.getElementById(id);
  const hiddenSel = document.getElementById(hiddenSelectId);
  if (!container || !hiddenSel) return;

  const trigger = container.querySelector('.custom-select-trigger');
  const dropdown = container.querySelector('.custom-select-dropdown');
  const valueSpan = container.querySelector('.custom-select-value');
  const options = container.querySelectorAll('.custom-select-option');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.custom-select.open').forEach(el => {
      if (el !== container) el.classList.remove('open');
    });
    container.classList.toggle('open');
  });

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const val = opt.dataset.value;
      const text = opt.textContent;
      hiddenSel.value = val;
      valueSpan.textContent = text;
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      container.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('open');
    }
  });

  hiddenSel.addEventListener('change', () => syncCustomSelect(container, hiddenSel, options, valueSpan));
}

function syncCustomSelect(container, hiddenSel, options, valueSpan) {
  const val = hiddenSel.value;
  options.forEach(opt => {
    if (opt.dataset.value === val) {
      opt.classList.add('selected');
      valueSpan.textContent = opt.textContent;
    } else {
      opt.classList.remove('selected');
    }
  });
}

initCustomSelect('roomsSelect', 's-rooms');
initCustomSelect('childrenSelect', 's-children');
initCustomSelect('budgetSelect', 's-price');

/* ══════════ SEARCH ══════════ */
document.getElementById('searchBtn').addEventListener('click', () => {
  const location = document.getElementById('s-location').value.trim();
  const rooms    = parseInt(document.getElementById('s-rooms').value);
  const children = parseInt(document.getElementById('s-children').value);
  const price    = document.getElementById('s-price').value;
  if (!location) { showToast('Please enter a destination.', 'error'); return; }
  renderResults(filterHotels(location, rooms, children, price), location, rooms, children, price);
  showPage('results');
});

function filterHotels(loc, rooms, children, price) {
  return hotelDatabase.filter(h => {
    const lm = !loc || h.city.toLowerCase().includes(loc.toLowerCase()) || h.country.toLowerCase().includes(loc.toLowerCase());
    const rm = h.rooms >= rooms;
    const cm = h.maxChildren >= children;
    let pm = true;
    if (price !== 'any') {
      const max = parseInt(price);
      pm = price === '1001' ? h.price > 1000 : h.price <= max;
    }
    return lm && rm && cm && pm;
  });
}

function renderResults(hotels, loc, rooms, children, price) {
  const grid  = document.getElementById('resultsGrid');
  const title = document.getElementById('resultsTitle');
  const meta  = document.getElementById('resultsMeta');
  const pl    = price === 'any' ? 'Any budget' : price === '1001' ? 'Over $1,000/night' : `Up to $${price}/night`;

  title.innerHTML = `Hotels in <em>${loc || 'All Destinations'}</em>`;
  meta.textContent = `Showing ${hotels.length} propert${hotels.length===1?'y':'ies'} · ${rooms} room${rooms>1?'s':''} · ${children} child${children!==1?'ren':''} · ${pl}`;
  grid.innerHTML = '';

  if (!hotels.length) {
    grid.innerHTML = `<div class="no-results">No properties found.<br/><small style="font-size:16px;color:var(--text-m)">Try adjusting your filters.</small></div>`;
    return;
  }

  hotels.forEach((h, i) => grid.appendChild(createHotelCard(h, i)));

  document.getElementById('sortFilter').onchange = function() {
    const s = [...hotels];
    if (this.value === 'price-asc')  s.sort((a,b)=>a.price-b.price);
    if (this.value === 'price-desc') s.sort((a,b)=>b.price-a.price);
    if (this.value === 'rating')     s.sort((a,b)=>b.rating-a.rating);
    grid.innerHTML = '';
    s.forEach((h,i) => grid.appendChild(createHotelCard(h,i)));
  };
}

function createHotelCard(hotel, delay=0) {
  const card = document.createElement('div');
  card.className = 'hotel-card';
  card.style.cssText = `animation:fadeUp 0.5s ease ${delay*0.07}s both`;
  const stars = '★'.repeat(hotel.stars)+'☆'.repeat(5-hotel.stars);
  card.innerHTML = `
    <div class="hotel-card-img" style="background:linear-gradient(135deg,${hotel.color},#1a1a10)">
      <div class="hotel-card-img-inner">${hotel.initial}</div>
      <div class="hotel-badge">${hotel.stars} ★</div>
      <button class="hotel-view-photos">📷 View Photos</button>
    </div>
    <div class="hotel-card-body">
      <div class="hotel-card-name">${hotel.name}</div>
      <div class="hotel-card-location">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${hotel.city}, ${hotel.country}
      </div>
      <div class="hotel-card-desc">${hotel.desc}</div>
      <div class="hotel-card-amenities">${hotel.amenities.slice(0,4).map(a=>`<span class="amenity-tag">${a}</span>`).join('')}</div>
      <div class="hotel-card-footer">
        <div>
          <span class="price-from">from</span>
          <span class="price-num">$${hotel.price}</span>
          <span class="price-per">/night</span>
        </div>
        <div style="text-align:right">
          <span class="stars">${stars}</span>
          <span class="rating-count">${hotel.rating} (${hotel.reviews.toLocaleString()})</span>
        </div>
      </div>
      <button class="hotel-book-btn">Reserve Now</button>
    </div>`;

  card.querySelector('.hotel-view-photos').addEventListener('click', e => { e.stopPropagation(); openGallery(hotel); });
  card.querySelector('.hotel-card-img-inner').addEventListener('click', () => openGallery(hotel));
  const bookBtn = card.querySelector('.hotel-book-btn');
  bookBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
    if (curUser) {
      openBookingModal(hotel);
    } else {
      showSideSigninTip(bookBtn, hotel);
    }
  });
  return card;
}

/* Featured clicks */
document.querySelectorAll('.featured-card').forEach(card => {
  card.addEventListener('click', () => {
    const dest = card.dataset.dest;
    document.getElementById('s-location').value = dest;
    renderResults(filterHotels(dest,1,0,'any'), dest, 1, 0, 'any');
    showPage('results');
  });
});

/* ══════════ GALLERY MODAL ══════════ */
let galHotel   = null;
let galTab     = 'hotel';
let galIndex   = 0;

const galleryModal   = document.getElementById('galleryModal');
const galleryBackdrop= document.getElementById('galleryBackdrop');
const galleryClose   = document.getElementById('galleryClose');
const galImgInner    = document.getElementById('galImgInner');
const galImgLabel    = document.getElementById('galImgLabel');
const galleryThumbs  = document.getElementById('galleryThumbs');
const galPrev        = document.getElementById('galPrev');
const galNext        = document.getElementById('galNext');

function openGallery(hotel) {
  galHotel = hotel;
  galTab   = 'hotel';
  galIndex = 0;
  document.getElementById('galleryHotelName').textContent = hotel.name;
  document.getElementById('galleryHotelLoc').textContent  = `${hotel.city}, ${hotel.country}`;
  document.getElementById('galPrice').textContent = `$${hotel.price}`;

  document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
  document.querySelector('.gtab[data-tab="hotel"]').classList.add('active');

  renderGallery();
  galleryModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('galBookBtn').onclick = () => {
    const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
    if (curUser) {
      closeGallery();
      setTimeout(() => openBookingModal(hotel), 200);
    } else {
      const galBtn = document.getElementById('galBookBtn');
      showSideSigninTip(galBtn, hotel);
    }
  };
}

function renderGallery() {
  const photos = galHotel.photos[galTab];
  renderMainPhoto(photos[galIndex]);
  renderThumbs(photos);
}

function renderMainPhoto(photo) {
  galImgInner.style.background = photo.gradient;
  galImgInner.style.backgroundSize = 'cover';
  galImgInner.textContent = photo.initial || galHotel.initial;
  galImgInner.style.color = 'rgba(201,169,110,0.18)';
  galImgInner.style.fontSize = '72px';
  galImgInner.style.fontFamily = "'Cormorant Garamond',serif";
  galImgInner.style.letterSpacing = '6px';
  galImgLabel.textContent = photo.label;
  galImgInner.style.opacity = '0';
  requestAnimationFrame(() => { galImgInner.style.transition='opacity 0.3s'; galImgInner.style.opacity='1'; });
}

function renderThumbs(photos) {
  galleryThumbs.innerHTML = '';
  photos.forEach((p, i) => {
    const t = document.createElement('div');
    t.className = 'gallery-thumb' + (i === galIndex ? ' active' : '');
    t.style.background = p.gradient;
    t.title = p.label;
    t.textContent = p.label.slice(0,2);
    t.style.cssText += `;background:${p.gradient};font-size:10px;color:rgba(201,169,110,0.4);letter-spacing:1px;text-transform:uppercase;`;
    t.addEventListener('click', () => { galIndex = i; renderGallery(); });
    galleryThumbs.appendChild(t);
  });
}

galPrev.addEventListener('click', () => {
  const photos = galHotel.photos[galTab];
  galIndex = (galIndex - 1 + photos.length) % photos.length;
  renderGallery();
});
galNext.addEventListener('click', () => {
  const photos = galHotel.photos[galTab];
  galIndex = (galIndex + 1) % photos.length;
  renderGallery();
});

document.addEventListener('keydown', e => {
  if (!galleryModal.classList.contains('open')) return;
  if (e.key === 'ArrowRight') galNext.click();
  if (e.key === 'ArrowLeft')  galPrev.click();
  if (e.key === 'Escape')     closeGallery();
});

document.querySelectorAll('.gtab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    galTab  = btn.dataset.tab;
    galIndex= 0;
    renderGallery();
  });
});

galleryClose.addEventListener('click', closeGallery);
galleryBackdrop.addEventListener('click', closeGallery);

function closeGallery() {
  galleryModal.classList.remove('open');
  document.body.style.overflow = '';
  const existing = document.getElementById('signinTip');
  if (existing) { existing.classList.remove('show'); setTimeout(() => { try { existing.remove(); } catch(e){} }, 220); }
}

/* ══════════ BOOKING MODAL ══════════ */
const bookingModal   = document.getElementById('bookingModal');
const bookingBackdrop= document.getElementById('bookingBackdrop');

function openBookingModal(hotel) {
  const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
  if (!curUser) {
    showSideSigninTip(document.querySelector('.gallery-window .btn-gold') || document.body, hotel);
    return;
  }
  document.getElementById('modalHotelName').textContent = hotel.name;
  document.getElementById('modalHotelLoc').textContent  = `${hotel.city}, ${hotel.country}`;
  document.getElementById('summaryRate').textContent    = `$${hotel.price}/night`;

  const today    = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate()+7);
  const toISO = d => d.toISOString().split('T')[0];
  document.getElementById('bookingCheckin').value  = toISO(tomorrow);
  document.getElementById('bookingCheckout').value = toISO(nextWeek);

  updateSummary(hotel.price);
  const paySection = document.getElementById('paymentSection'); if (paySection) paySection.classList.add('hidden');
  bookingModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showSideSigninTip(button, hotel, msg) {
  const existing = document.getElementById('signinTip');
  if (existing) existing.remove();

  const message = msg || 'Please sign in to continue your reservation';

  const tip = document.createElement('div');
  tip.id = 'signinTip';
  tip.className = 'signin-tip signin-tip--alert';
  tip.innerHTML = `<div class="signin-tip-body"><div class="signin-tip-msg">${message}</div></div>`;
  document.body.appendChild(tip);

  const rect = button.getBoundingClientRect();
  const preferOffset = 20;
  tip.style.position = 'absolute';
  tip.style.zIndex = 9999;
  const tipRect = tip.getBoundingClientRect();
  const spaceRight = window.innerWidth - rect.right;
  let left;
  if (spaceRight > tipRect.width + preferOffset) {
    left = window.scrollX + rect.right + preferOffset;
  } else {
    left = Math.max(12, window.scrollX + rect.left - tipRect.width - preferOffset);
  }
  const rawTop = window.scrollY + rect.top + (rect.height - tipRect.height) / 2;
  const minTop = window.scrollY + 12;
  const maxTop = window.scrollY + window.innerHeight - tipRect.height - 12;
  const top = Math.min(maxTop, Math.max(minTop, rawTop));
  tip.style.left = `${Math.round(left)}px`;
  tip.style.top = `${Math.round(top)}px`;

  requestAnimationFrame(() => { tip.classList.add('show'); });

  tip.style.cursor = 'pointer';
  const onClickTip = () => { window.location.href = 'auth.html'; };
  tip.addEventListener('click', onClickTip);

  let dismissTimer = setTimeout(() => cleanupTip(), 1500);
  function onScroll() { cleanupTip(); }
  function onResize() { repositionTip(); }

  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onResize);

  function cleanupTip() {
    if (!tip || !tip.parentNode) return;
    tip.classList.remove('show');
    setTimeout(() => { try { tip.remove(); } catch(e){} }, 220);
    clearTimeout(dismissTimer);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    tip.removeEventListener('click', onClickTip);
  }

  function repositionTip() {
    if (!tip || !tip.parentNode) return;
    const rect = button.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const preferOffset = 20;
    const spaceRight = window.innerWidth - rect.right;
    let left;
    if (spaceRight > tipRect.width + preferOffset) {
      left = window.scrollX + rect.right + preferOffset;
    } else {
      left = Math.max(12, window.scrollX + rect.left - tipRect.width - preferOffset);
    }
    const rawTop = window.scrollY + rect.top + (rect.height - tipRect.height) / 2;
    const minTop = window.scrollY + 12;
    const maxTop = window.scrollY + window.innerHeight - tipRect.height - 12;
    const top = Math.min(maxTop, Math.max(minTop, rawTop));
    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(top)}px`;
  }
}

function openInlineSignin(onSuccess) {
  if (document.getElementById('inlineSignin')) return;
  const overlay = document.createElement('div');
  overlay.id = 'inlineSignin';
  overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.display = 'flex';
  overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; overlay.style.zIndex = 10000;
  overlay.style.background = 'rgba(0,0,0,0.45)';

  overlay.innerHTML = `
    <div style="width:360px;max-width:92%;padding:20px;background:var(--bg2);border:1px solid var(--border);box-shadow:var(--shadow);">
      <h3 style="margin:0 0 8px;color:var(--white);font-family:'Cormorant Garamond',serif;">Sign In</h3>
      <p style="margin:0 0 12px;color:var(--text-m);font-size:13px;">Enter your name to sign in and continue.</p>
      <input id="inlineName" placeholder="Full name" style="width:100%;padding:10px;margin-bottom:8px;border:1px solid var(--border-s);background:var(--bg3);color:var(--text);outline:none;" />
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button id="inlineCancel" class="btn-outline">Cancel</button>
        <button id="inlineSubmit" class="btn-gold">Sign In</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('inlineCancel').addEventListener('click', () => overlay.remove());
  document.getElementById('inlineSubmit').addEventListener('click', () => {
    const name = document.getElementById('inlineName').value.trim();
    if (!name) { showToast('Please enter your name to sign in.', 'error'); return; }
    const initials = name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || 'AU';
    const user = { name, initials };
    localStorage.setItem('aurum-user', JSON.stringify(user));
    try { navUser.style.display = 'none'; navUserLogged.classList.remove('hidden'); navAvatar.textContent = initials; navUsername.textContent = name.split(' ')[0]; } catch(e){}
    overlay.remove();
    showToast('Signed in — continuing reservation.');
    if (typeof onSuccess === 'function') onSuccess();
  });
}

function updateSummary(rate) {
  const cin   = new Date(document.getElementById('bookingCheckin').value);
  const cout  = new Date(document.getElementById('bookingCheckout').value);
  const rooms = parseInt(document.getElementById('bookingRooms').value) || 1;
  if (cin && cout && cout > cin) {
    const nights = Math.round((cout-cin)/(1000*60*60*24));
    document.getElementById('summaryNights').textContent = nights;
    document.getElementById('summaryTotal').textContent  = '$' + (nights*rate*rooms).toLocaleString();
  }
}

document.getElementById('bookingClose').addEventListener('click', closeBooking);
bookingBackdrop.addEventListener('click', closeBooking);
function closeBooking() { bookingModal.classList.remove('open'); document.body.style.overflow=''; }

['bookingCheckin','bookingCheckout','bookingRooms'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    const r = parseFloat(document.getElementById('summaryRate').textContent.replace(/[^0-9.]/g,''));
    updateSummary(r);
  });
});

document.getElementById('confirmBooking').addEventListener('click', () => {
  const cin  = document.getElementById('bookingCheckin').value;
  const cout = document.getElementById('bookingCheckout').value;
  if (!cin || !cout) { showToast('Please select dates.','error'); return; }
  const paySection = document.getElementById('paymentSection');
  if (paySection && paySection.classList.contains('hidden')) {
    paySection.classList.remove('hidden');
    setTimeout(() => { document.getElementById('payName').focus(); }, 120);
    return;
  }
  closeBooking();
  showToast('✦ Reservation confirmed! Check your email for details.','success');
});

const payConfirm = document.getElementById('payConfirmBtn');
if (payConfirm) {
  payConfirm.addEventListener('click', () => {
    const name = document.getElementById('payName').value.trim();
    const number = document.getElementById('payNumber').value.replace(/\s+/g,'');
    const exp = document.getElementById('payExp').value.trim();
    const cvc = document.getElementById('payCvc').value.trim();
    if (!name || !number || !exp || !cvc) { showToast('Please complete payment details.','error'); return; }
    payConfirm.disabled = true; payConfirm.textContent = 'Processing…';
    setTimeout(() => {
      payConfirm.disabled = false; payConfirm.textContent = 'Pay & Confirm';
      closeBooking();
      showToast('✔ Payment accepted — Reservation confirmed!','success');
    }, 1200);
  });
}

/* ══════════ AI CONCIERGE (modified) ══════════ */
const aiModal    = document.getElementById('aiModal');
const aiMessages = document.getElementById('aiMessages');
const aiInput    = document.getElementById('aiInput');

document.getElementById('openAiChat').addEventListener('click', () => {
  aiModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  aiInput.focus();
});
document.getElementById('aiBackdrop').addEventListener('click', () => { aiModal.classList.remove('open'); document.body.style.overflow=''; });
document.getElementById('aiClose').addEventListener('click', () => { aiModal.classList.remove('open'); document.body.style.overflow=''; });

document.getElementById('aiSend').addEventListener('click', sendAI);
aiInput.addEventListener('keydown', e => { if(e.key==='Enter') sendAI(); });

function appendMsg(text, role) {
  const div = document.createElement('div');
  div.className = `ai-msg ai-msg--${role}`;
  div.innerHTML = `<div class="ai-msg-bubble">${text}</div>`;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  return div;
}

async function sendAI() {
  const text = aiInput.value.trim();
  if (!text) return;
  appendMsg(text, 'user');
  aiInput.value = '';
  const typing = appendMsg('', 'bot');
  typing.classList.add('ai-typing');

  try {
    const response = await fetch(`${API_BASE}/ai/concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await response.json();
    typing.classList.remove('ai-typing');
    if (data.success) {
      typing.querySelector('.ai-msg-bubble').innerHTML = data.data.response;
      if (data.data.suggestions && data.data.suggestions.length) {
        const btnContainer = document.createElement('div');
        btnContainer.style.marginTop = '12px';
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '8px';
        btnContainer.style.flexWrap = 'wrap';
        data.data.suggestions.slice(0, 3).forEach(hotel => {
          const btn = document.createElement('button');
          btn.className = 'btn-outline';
          btn.style.fontSize = '9px';
          btn.style.padding = '6px 12px';
          btn.textContent = `🏨 ${hotel.name} ($${hotel.price})`;
          btn.onclick = () => {
            document.getElementById('s-location').value = hotel.city;
            document.getElementById('s-rooms').value = 1;
            document.getElementById('s-children').value = 0;
            document.getElementById('s-price').value = 'any';
            renderResults(filterHotels(hotel.city, 1, 0, 'any'), hotel.city, 1, 0, 'any');
            aiModal.classList.remove('open');
            showPage('results');
          };
          btnContainer.appendChild(btn);
        });
        typing.querySelector('.ai-msg-bubble').appendChild(btnContainer);
      }
    } else {
      typing.querySelector('.ai-msg-bubble').innerHTML = 'AI service unavailable. Please try again later.';
    }
  } catch(err) {
    typing.classList.remove('ai-typing');
    typing.querySelector('.ai-msg-bubble').innerHTML = 'Connection error. Unable to reach AI concierge.';
    console.error(err);
  }
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function parseUserFilters(text) {
  const t = text.toLowerCase();
  let rooms    = 1;
  let children = 0;
  let maxPrice = null;
  const roomMatch = t.match(/(\d+)\s*(?:room|bedroom|suite)/);
  if (roomMatch) rooms = parseInt(roomMatch[1]);
  const childMatch = t.match(/(\d+)\s*(?:child|kid|children)/);
  if (childMatch) children = parseInt(childMatch[1]);
  if (/\b(under|below|less than|max|up to|around|about)\s*\$?(\d+)/.test(t)) {
    const m = t.match(/\b(under|below|less than|max|up to|around|about)\s*\$?(\d+)/);
    if (m) maxPrice = parseInt(m[2]);
  } else if (/\$(\d+)/.test(t)) {
    const m = t.match(/\$(\d+)/);
    if (m) maxPrice = parseInt(m[1]);
  } else if (/\b(budget|cheap|affordable|inexpensive|low cost|low-price)/.test(t)) {
    maxPrice = 300;
  }
  const cities = ['paris','dubai','tokyo','new york','london','barcelona','algiers','oran','istanbul','marrakech'];
  let city = null;
  for (const c of cities) { if (t.includes(c)) { city = c; break; } }
  return { city, rooms, children, maxPrice };
}

function parseReplyFilters(reply) {
  const r = reply.toLowerCase();
  let price   = null;
  let rooms   = null;
  let children= null;
  let city    = null;
  const priceMatches = [...r.matchAll(/\$(\d+)/g)].map(m => parseInt(m[1]));
  if (priceMatches.length) price = Math.max(...priceMatches);
  const roomMatch = r.match(/(\d+)\s*(?:room|bedroom)/);
  if (roomMatch) rooms = parseInt(roomMatch[1]);
  const childMatch = r.match(/(\d+)\s*(?:child|kid|children)/);
  if (childMatch) children = parseInt(childMatch[1]);
  const cities = ['paris','dubai','tokyo','new york','london','barcelona','algiers','oran','istanbul','marrakech'];
  for (const c of cities) { if (r.includes(c)) { city = c; break; } }
  return { city, price, rooms, children };
}

/* ══════════ TOAST ══════════ */
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' '+type : '');
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.classList.remove('show'), 4000);
}

/* ══════════ SCROLL ANIM ══════════ */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animation='fadeUp 0.6s ease forwards';
      obs.unobserve(e.target);
    }
  });
}, { threshold:0.1 });
document.querySelectorAll('.featured-card, .why-feat').forEach(el => { el.style.opacity='0'; obs.observe(el); });

/* ══════════ INIT ══════════ */
window.addEventListener('DOMContentLoaded', () => {
  loadHotelsFromAPI();
  try {
    const params = new URLSearchParams(window.location.search);
    const openBooking = params.get('openBooking');
    if (openBooking) {
      const hid = parseInt(openBooking,10);
      const h = hotelDatabase.find(x=>x.id===hid);
      if (h) openBookingModal(h);
      history.replaceState(null,'', window.location.pathname);
    }
  } catch(e){}
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const links = document.querySelector('.nav-links');
      if (links) links.classList.toggle('mobile-open');
    });
  }
});

/* ══════════ OWNER ROLE NAV ══════════ */
(function() {
  const u = JSON.parse(localStorage.getItem('aurum-user') || 'null');
  if (u && u.role === 'owner') {
    const loggedDiv = document.getElementById('navUserLogged');
    if (loggedDiv) {
      const dashLink = document.createElement('a');
      dashLink.href = 'owner-dashboard.html';
      dashLink.className = 'nav-btn nav-btn-dash';
      dashLink.style.cssText = 'margin-right:8px;';
      dashLink.textContent = 'Dashboard';
      loggedDiv.insertBefore(dashLink, loggedDiv.firstChild);
    }
  }
})();