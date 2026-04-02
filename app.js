/* ═══════════════════════════════════════════════
   AURUM — app.js  (updated)
═══════════════════════════════════════════════ */

/* ══════════ AI CONFIG ══════════ */
const CLAUDE_API_KEY = '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';

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
// with gold-themed UI accents throughout the site

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

// See app.js for navSignout handler
document.getElementById("navSignout")?.addEventListener("click", () => {
  localStorage.removeItem('aurum-user');
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
    // scroll so content isn't hidden beneath the fixed navbar
    const offset = (navbar && navbar.offsetHeight) ? navbar.offsetHeight + 8 : 0;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
  navLinks.forEach(l => { if (l.dataset.page === id) l.classList.add('active'); });
  // close mobile side-nav if open
  document.querySelector('.nav-links')?.classList.remove('mobile-open');
}


navLinks.forEach(link => {
  link.addEventListener('click', e => {
    if (link.dataset.page) { e.preventDefault(); showPage(link.dataset.page); return; }
    // Intercept "List Property" link for guest users
    if (link.getAttribute('href') === 'owner.html') {
      e.preventDefault();
      const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
      if (!curUser || curUser.role !== 'owner') {
        // Guest or logged in as guest — show tip asking them to sign in as owner
        showSideSigninTip(link, null, 'You need to sign in as an owner to list your property');
      } else {
        window.location.href = 'owner.html';
      }
    }
  });
});

/* ══════════ HOTEL DATABASE ══════════ */
/* Each hotel now has a `photos` object with tab arrays of { bg, label, gradient } */
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

const hotelDatabase = [
  {
    id:1, name:'Le Grand Hôtel', city:'Paris', country:'France', stars:5, price:450,
    rating:4.9, reviews:1284, desc:'Belle Époque grandeur at the heart of Paris, steps from the Opéra Garnier. Timeless luxury with sweeping city views.',
    amenities:['Wi-Fi','Spa','Restaurant','Concierge','Bar'], initial:'LG', color:'#1a1208', maxChildren:4, rooms:3,
    photos: makePhotos('LG','#1a1208','#2a1f0a','#180e04'),
  },
  {
    id:2, name:'Hôtel de Crillon', city:'Paris', country:'France', stars:5, price:980,
    rating:4.95, reviews:876, desc:'A palatial 18th-century landmark on Place de la Concorde. Unrivalled Parisian elegance.',
    amenities:['Wi-Fi','Pool','Spa','Restaurant','Concierge'], initial:'HC', color:'#14100a', maxChildren:2, rooms:5,
    photos: makePhotos('HC','#14100a','#201808','#0e0c06'),
  },
  {
    id:3, name:'Burj Al Arab', city:'Dubai', country:'UAE', stars:5, price:1800,
    rating:4.85, reviews:2341, desc:'The world\'s most iconic hotel — a sail-shaped silhouette on its own private island.',
    amenities:['Pool','Spa','Restaurant','Bar','Transfer','Concierge'], initial:'BA', color:'#0a1218', maxChildren:3, rooms:2,
    photos: makePhotos('BA','#0a1218','#0d1e2e','#06101a'),
  },
  {
    id:4, name:'Atlantis The Palm', city:'Dubai', country:'UAE', stars:5, price:620,
    rating:4.7, reviews:5612, desc:'Spectacular suites, waterparks, and 17 award-winning restaurants on Palm Jumeirah.',
    amenities:['Pool','Wi-Fi','Restaurant','Bar','Gym','Beach'], initial:'AT', color:'#0a1015', maxChildren:6, rooms:5,
    photos: makePhotos('AT','#0a1015','#0e1a22','#081218'),
  },
  {
    id:5, name:'The Peninsula', city:'Tokyo', country:'Japan', stars:5, price:720,
    rating:4.9, reviews:998, desc:'Eastern refinement meets impeccable service in the heart of Marunouchi.',
    amenities:['Spa','Pool','Restaurant','Concierge','Wi-Fi','Gym'], initial:'TP', color:'#120a10', maxChildren:2, rooms:4,
    photos: makePhotos('TP','#120a10','#1e1018','#0e0810'),
  },
  {
    id:6, name:'Mandarin Oriental', city:'Tokyo', country:'Japan', stars:5, price:890,
    rating:4.92, reviews:743, desc:'Perched on the 37th floor of Nihonbashi Mitsui Tower with legendary spa experience.',
    amenities:['Spa','Restaurant','Bar','Concierge','Wi-Fi'], initial:'MO', color:'#0f0a12', maxChildren:2, rooms:3,
    photos: makePhotos('MO','#0f0a12','#1a1020','#0c0810'),
  },
  {
    id:7, name:'The Plaza Hotel', city:'New York', country:'USA', stars:5, price:1100,
    rating:4.8, reviews:3218, desc:'A National Historic Landmark at Fifth Avenue and Central Park South.',
    amenities:['Spa','Restaurant','Bar','Concierge','Wi-Fi','Gym'], initial:'PH', color:'#0a0a14', maxChildren:4, rooms:5,
    photos: makePhotos('PH','#0a0a14','#12121e','#080810'),
  },
  {
    id:8, name:'Four Seasons Downtown', city:'New York', country:'USA', stars:5, price:850,
    rating:4.88, reviews:1876, desc:'A soaring tower in Tribeca offering breathtaking views and a rooftop pool.',
    amenities:['Pool','Spa','Restaurant','Concierge','Wi-Fi','Gym'], initial:'FS', color:'#080810', maxChildren:4, rooms:5,
    photos: makePhotos('FS','#080810','#101020','#060810'),
  },
  {
    id:9, name:'Rosewood London', city:'London', country:'UK', stars:5, price:790,
    rating:4.87, reviews:1102, desc:'A former Edwardian legal building transformed into one of London\'s finest hotels.',
    amenities:['Spa','Restaurant','Bar','Concierge','Wi-Fi','Gym'], initial:'RL', color:'#0e0a08', maxChildren:3, rooms:4,
    photos: makePhotos('RL','#0e0a08','#1a120a','#0a0804'),
  },
  {
    id:10, name:"Claridge's", city:'London', country:'UK', stars:5, price:920,
    rating:4.93, reviews:2015, desc:'The jewel of Mayfair since 1812. Art Deco glamour and impeccable British service.',
    amenities:['Restaurant','Bar','Spa','Concierge','Wi-Fi'], initial:'CL', color:'#100e08', maxChildren:2, rooms:3,
    photos: makePhotos('CL','#100e08','#1c1a0c','#0e0c06'),
  },
  /* ── Algeria ── */
  {
    id:11, name:'Sofitel Algiers Hamma Garden', city:'Algiers', country:'Algeria', stars:5, price:220,
    rating:4.72, reviews:642, desc:'An oasis of French elegance overlooking the famous Hamma botanical gardens and the Mediterranean Bay of Algiers.',
    amenities:['Pool','Spa','Restaurant','Bar','Wi-Fi','Gym'], initial:'SA', color:'#0a1a0e', maxChildren:3, rooms:4,
    photos: makePhotos('SA','#0a1a0e','#102414','#06100a'),
  },
  {
    id:12, name:'El Djazair Hotel', city:'Algiers', country:'Algeria', stars:5, price:180,
    rating:4.65, reviews:430, desc:'A colonial-era landmark from 1889 set in lush Moorish gardens. History and refinement fused in the heart of Algiers.',
    amenities:['Pool','Restaurant','Bar','Concierge','Wi-Fi'], initial:'EJ', color:'#0e1a0a', maxChildren:4, rooms:3,
    photos: makePhotos('EJ','#0e1a0a','#152210','#0a1808'),
  },
  /* ── Istanbul ── */
  {
    id:13, name:'Four Seasons Bosphorus', city:'Istanbul', country:'Turkey', stars:5, price:680,
    rating:4.91, reviews:1124, desc:'A restored 19th-century Ottoman palace on the European shore of the Bosphorus strait. Unparalleled waterfront grandeur.',
    amenities:['Pool','Spa','Restaurant','Bar','Concierge','Wi-Fi'], initial:'FB', color:'#1a0a08', maxChildren:3, rooms:4,
    photos: makePhotos('FB','#1a0a08','#2a1210','#120608'),
  },
  {
    id:14, name:'Çırağan Palace Kempinski', city:'Istanbul', country:'Turkey', stars:5, price:890,
    rating:4.88, reviews:870, desc:'The last Ottoman palace on the Bosphorus. An extraordinary blend of imperial splendour and modern luxury.',
    amenities:['Pool','Spa','Restaurant','Bar','Wi-Fi','Gym'], initial:'CP', color:'#200a06', maxChildren:2, rooms:3,
    photos: makePhotos('CP','#200a06','#301410','#180806'),
  },
  /* ── Barcelona ── */
  {
    id:15, name:'Hotel Arts Barcelona', city:'Barcelona', country:'Spain', stars:5, price:480,
    rating:4.75, reviews:1543, desc:'A Frank Gehry masterpiece rising above the Mediterranean. Exceptional beachfront location with Michelin-starred dining.',
    amenities:['Pool','Spa','Restaurant','Bar','Beach','Wi-Fi'], initial:'AB', color:'#0a0e14', maxChildren:3, rooms:5,
    photos: makePhotos('AB','#0a0e14','#10141e','#080c12'),
  },
  /* ── Marrakech ── */
  {
    id:16, name:'La Mamounia', city:'Marrakech', country:'Morocco', stars:5, price:750,
    rating:4.94, reviews:2210, desc:'The most legendary hotel in Africa. A palace of Moorish splendour dating to 1923, set in 17 acres of gardens.',
    amenities:['Pool','Spa','Restaurant','Bar','Concierge','Wi-Fi'], initial:'LM', color:'#1a0808', maxChildren:2, rooms:3,
    photos: makePhotos('LM','#1a0808','#2a1010','#120606'),
  },
  {
    id:17, name:'Royal Mansour Marrakech', city:'Marrakech', country:'Morocco', stars:5, price:1400,
    rating:4.97, reviews:988, desc:'A medina within a medina — each of 53 private riads, built by royal craftsmen. The pinnacle of Moroccan hospitality.',
    amenities:['Pool','Spa','Restaurant','Bar','Butler','Concierge'], initial:'RM', color:'#1e0c04', maxChildren:2, rooms:2,
    photos: makePhotos('RM','#1e0c04','#2c1408','#160a02'),
  },
  /* ── Oran (Algeria) ── */
  {
    id:18, name:'Méridien Oran Hotel & Convention Centre', city:'Oran', country:'Algeria', stars:5, price:160,
    rating:4.58, reviews:315, desc:'A gleaming landmark on the seafront of Oran, offering Mediterranean views and world-class conference facilities.',
    amenities:['Pool','Restaurant','Bar','Gym','Wi-Fi','Business'], initial:'MO', color:'#080e18', maxChildren:4, rooms:5,
    photos: makePhotos('MO','#080e18','#0c1420','#060c18'),
  },
];

/* ══════════ CUSTOM SEARCH DROPDOWNS ══════════ */
function initCustomSelect(id, hiddenSelectId) {
  const container = document.getElementById(id);
  const hiddenSel = document.getElementById(hiddenSelectId);
  if (!container || !hiddenSel) return;

  const trigger = container.querySelector('.custom-select-trigger');
  const dropdown = container.querySelector('.custom-select-dropdown');
  const valueSpan = container.querySelector('.custom-select-value');
  const options = container.querySelectorAll('.custom-select-option');

  // Toggle on trigger click
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close others
    document.querySelectorAll('.custom-select.open').forEach(el => {
      if (el !== container) el.classList.remove('open');
    });
    container.classList.toggle('open');
  });

  // Option click
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

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('open');
    }
  });

  // Sync display when hidden select is changed programmatically
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

/* ══════════ GALLERY ══════════ */
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

  // Reset tabs
  document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
  document.querySelector('.gtab[data-tab="hotel"]').classList.add('active');

  renderGallery();
  galleryModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('galBookBtn').onclick = () => {
    const curUser = JSON.parse(localStorage.getItem('aurum-user') || 'null');
    if (curUser) {
      // Signed in — close gallery then open booking
      closeGallery();
      setTimeout(() => openBookingModal(hotel), 200);
    } else {
      // Not signed in — show the same tip popup used by card Reserve buttons
      // Keep the gallery open so the tip appears on top of it
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

  // Fade animation
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

// Keyboard nav in gallery
document.addEventListener('keydown', e => {
  if (!galleryModal.classList.contains('open')) return;
  if (e.key === 'ArrowRight') galNext.click();
  if (e.key === 'ArrowLeft')  galPrev.click();
  if (e.key === 'Escape')     closeGallery();
});

// Gallery tabs
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
  // Close signin tip if open so it doesn't orphan on top of other content
  const existing = document.getElementById('signinTip');
  if (existing) { existing.classList.remove('show'); setTimeout(() => { try { existing.remove(); } catch(e){} }, 220); }
}

/* ══════════ BOOKING MODAL ══════════ */
const bookingModal   = document.getElementById('bookingModal');
const bookingBackdrop= document.getElementById('bookingBackdrop');

function openBookingModal(hotel) {
  // Auth guard: if not signed in, show the same sign-in tip used by the card buttons
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
  // hide payment initially
  const paySection = document.getElementById('paymentSection'); if (paySection) paySection.classList.add('hidden');
  bookingModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // If not signed in, don't auto-show a sign-in overlay here. Booking is started only after sign-in.
}

// Show a small side-tip near the Reserve button prompting the user to sign in.
function showSideSigninTip(button, hotel, msg) {
  // remove any existing tip
  const existing = document.getElementById('signinTip');
  if (existing) existing.remove();

  const message = msg || 'Please sign in to continue your reservation';

  const tip = document.createElement('div');
  tip.id = 'signinTip';
  tip.className = 'signin-tip signin-tip--alert';
  tip.innerHTML = `
    <div class="signin-tip-body">
      <div class="signin-tip-msg">${message}</div>
    </div>
  `;

  document.body.appendChild(tip);

  // position the tip to the right of the button
  const rect = button.getBoundingClientRect();
  const preferOffset = 20; // px from the button edge
  tip.style.position = 'absolute';
  tip.style.zIndex = 9999;
  // force a layout so getBoundingClientRect gives correct dimensions
  document.body.appendChild(tip);
  const tipRect = tip.getBoundingClientRect();
  // always try to place to the right first, then left if not enough space
  const spaceRight = window.innerWidth - rect.right;
  let left;
  if (spaceRight > tipRect.width + preferOffset) {
    left = window.scrollX + rect.right + preferOffset;
  } else {
    left = Math.max(12, window.scrollX + rect.left - tipRect.width - preferOffset);
  }
  // vertical center near button but clamp inside viewport
  const rawTop = window.scrollY + rect.top + (rect.height - tipRect.height) / 2;
  const minTop = window.scrollY + 12;
  const maxTop = window.scrollY + window.innerHeight - tipRect.height - 12;
  const top = Math.min(maxTop, Math.max(minTop, rawTop));
  tip.style.left = `${Math.round(left)}px`;
  tip.style.top = `${Math.round(top)}px`;

  // animate in
  requestAnimationFrame(() => { tip.classList.add('show'); });

  // make the whole tip clickable to go to the sign-in page (no explicit button)
  tip.style.cursor = 'pointer';
  const onClickTip = () => { window.location.href = 'auth.html'; };
  tip.addEventListener('click', onClickTip);

  // Auto-dismiss behavior: remove after timeout, or when user scrolls (dismiss)
  // On resize we reposition the tip so it stays visible and doesn't overlap.
  let dismissTimer = setTimeout(() => cleanupTip(), 1500);
  function onScroll() { cleanupTip(); }
  function onResize() { repositionTip(); }

  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onResize);

  function cleanupTip() {
    if (!tip || !tip.parentNode) return;
    tip.classList.remove('show');
    // small delay so hide animation is visible
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

// Inline sign-in modal appended to body. Calls callback after successful sign-in.
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
  // Reveal payment section first
  const paySection = document.getElementById('paymentSection');
  if (paySection && paySection.classList.contains('hidden')) {
    paySection.classList.remove('hidden');
    setTimeout(() => { document.getElementById('payName').focus(); }, 120);
    return;
  }
  // fallback
  closeBooking();
  showToast('✦ Reservation confirmed! Check your email for details.','success');
});

// Handle payment confirmation (simulated)
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

/* ══════════ AI CONCIERGE ══════════ */
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

  // Parse filters from the user's message
  const parsed = parseUserFilters(text);
  const { city, rooms, children, maxPrice } = parsed;

  const system = `You are a sophisticated AI concierge for AURUM, a luxury hotel booking platform.
Help guests find their perfect hotel. Available cities: Paris (France), Dubai (UAE), Tokyo (Japan), New York (USA), London (UK), Barcelona (Spain), Algiers (Algeria), Oran (Algeria), Istanbul (Turkey), Marrakech (Morocco).

Hotels:
- Paris: Le Grand Hôtel ($450/night), Hôtel de Crillon ($980/night)
- Dubai: Burj Al Arab ($1800/night), Atlantis The Palm ($620/night)
- Tokyo: The Peninsula ($720/night), Mandarin Oriental ($890/night)
- New York: The Plaza ($1100/night), Four Seasons Downtown ($850/night)
- London: Rosewood London ($790/night), Claridge's ($920/night)
- Barcelona: Hotel Arts ($480/night)
- Algiers: Sofitel Algiers Hamma Garden ($220/night), El Djazair Hotel ($180/night)
- Oran: Méridien Oran ($160/night)
- Istanbul: Four Seasons Bosphorus ($680/night), Çırağan Palace Kempinski ($890/night)
- Marrakech: La Mamounia ($750/night), Royal Mansour ($1400/night)

When recommending hotels, always include each hotel's exact price in your response (e.g. "from $450/night"). If the guest mentioned a budget or price limit, only recommend hotels within that limit and state clearly which price ceiling you are applying. If they mentioned room or child requirements, acknowledge those too. Respond in 3-5 refined sentences. Recommend 1-2 specific hotels. Be warm, cultured, and concise. Do not invent hotels outside this list.`;

  try {
    const res = await fetch('https://aurum-ia.boussekarabderrahmane.workers.dev/anthropic', {
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        model:'claude-sonnet-4-6', max_tokens:450,
        system, messages:[{role:'user',content:text}]
      })
    });
    const data = await res.json();
    typing.classList.remove('ai-typing');

    console.log('AI raw response:', JSON.stringify(data));

    if (!res.ok) {
      const errorMsg = data?.error?.message || 'API request failed. Check your API key.';
      typing.querySelector('.ai-msg-bubble').innerHTML = 'Our AI concierge is momentarily unavailable.<br><small style="opacity:0.5">'+errorMsg+'</small>';
      return;
    }

    const reply = data.content?.[0]?.text || 'I encountered a brief issue. Please try again.';
    typing.querySelector('.ai-msg-bubble').innerHTML = reply;

    // Extract price and city from the AI's reply to use as filters
    const replyFilters = parseReplyFilters(reply);
    const finalCity    = replyFilters.city    || city;
    const finalPrice   = replyFilters.price   || maxPrice;
    const finalRooms   = replyFilters.rooms   || rooms;
    const finalChildren= replyFilters.children || children;

    // Build label with all applied filters
    const filterParts = [];
    if (finalCity)    filterParts.push(finalCity.charAt(0).toUpperCase() + finalCity.slice(1));
    if (finalPrice)   filterParts.push(`up to $${finalPrice}`);
    if (finalRooms > 1) filterParts.push(`${finalRooms} rooms`);
    if (finalChildren > 0) filterParts.push(`${finalChildren} child${finalChildren !== 1 ? 'ren' : ''}`);

    // Auto suggest city button — now carries ALL parsed filters
    const cities = ['paris','dubai','tokyo','new york','london','barcelona','algiers','oran','istanbul','marrakech'];
    const found  = cities.find(c => reply.toLowerCase().includes(c) || text.toLowerCase().includes(c));
    if (found) {
      setTimeout(() => {
        const label = filterParts.length
          ? `→ Show <strong>${filterParts.join(' · ')}</strong>?`
          : `→ Shall I show you hotels in <strong>${found.charAt(0).toUpperCase()+found.slice(1)}</strong>?`;
        const hint = appendMsg(label, 'bot');
        const btn  = document.createElement('button');
        btn.className = 'btn-gold';
        btn.style.cssText = 'margin-top:10px;font-size:10px;padding:9px 20px;';
        btn.textContent = filterParts.length ? `View Hotels` : `View ${found.charAt(0).toUpperCase()+found.slice(1)} Hotels`;
        btn.addEventListener('click', () => {
          document.getElementById('s-location').value = found;
          document.getElementById('s-rooms').value    = finalRooms;
          document.getElementById('s-children').value  = finalChildren;
          document.getElementById('s-price').value     = finalPrice || 'any';
          renderResults(filterHotels(found, finalRooms, finalChildren, finalPrice || 'any'), found, finalRooms, finalChildren, finalPrice || 'any');
          aiModal.classList.remove('open');
          document.body.style.overflow = '';
          showPage('results');
        });
        hint.querySelector('.ai-msg-bubble').appendChild(btn);
      }, 500);
    }
  } catch(err) {
    typing.classList.remove('ai-typing');
    typing.querySelector('.ai-msg-bubble').innerHTML = 'Our AI concierge is momentarily unavailable.<br><small style="opacity:0.5">'+String(err)+'</small>';
  }
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

// Parse budget, rooms, children from user message
function parseUserFilters(text) {
  const t = text.toLowerCase();
  let rooms    = 1;
  let children = 0;
  let maxPrice = null;

  // Detect rooms: "2 rooms", "3 room", "1 bedroom"
  const roomMatch = t.match(/(\d+)\s*(?:room|bedroom|suite)/);
  if (roomMatch) rooms = parseInt(roomMatch[1]);

  // Detect children: "1 child", "2 kids", "3 children"
  const childMatch = t.match(/(\d+)\s*(?:child|kid|children)/);
  if (childMatch) children = parseInt(childMatch[1]);

  // Detect budget: "under $300", "under 300", "budget", "cheap", "affordable", "less than $500", "max $200", "$100-", etc.
  if (/\b(under|below|less than|max|up to|around|about)\s*\$?(\d+)/.test(t)) {
    const m = t.match(/\b(under|below|less than|max|up to|around|about)\s*\$?(\d+)/);
    if (m) maxPrice = parseInt(m[2]);
  } else if (/\$(\d+)/.test(t)) {
    const m = t.match(/\$(\d+)/);
    if (m) maxPrice = parseInt(m[1]);
  } else if (/\b(budget|cheap|affordable|inexpensive|low cost|low-price)/.test(t)) {
    maxPrice = 300; // default "budget" threshold
  }

  // Detect city
  const cities = ['paris','dubai','tokyo','new york','london','barcelona','algiers','oran','istanbul','marrakech'];
  let city = null;
  for (const c of cities) { if (t.includes(c)) { city = c; break; } }

  return { city, rooms, children, maxPrice };
}

// Extract city, price, rooms, children from AI reply text
function parseReplyFilters(reply) {
  const r = reply.toLowerCase();
  let price   = null;
  let rooms   = null;
  let children= null;
  let city    = null;

  // Extract highest price mentioned in reply (e.g. "$450/night", "$980 per night")
  const priceMatches = [...r.matchAll(/\$(\d+)/g)].map(m => parseInt(m[1]));
  if (priceMatches.length) price = Math.max(...priceMatches);

  // Extract rooms
  const roomMatch = r.match(/(\d+)\s*(?:room|bedroom)/);
  if (roomMatch) rooms = parseInt(roomMatch[1]);

  // Extract children
  const childMatch = r.match(/(\d+)\s*(?:child|kid|children)/);
  if (childMatch) children = parseInt(childMatch[1]);

  // Extract city
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
  renderResults(filterHotels('Paris',1,0,'any'), 'Paris', 1, 0, 'any');
  // open booking if redirected after auth
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
  // mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const links = document.querySelector('.nav-links');
      if (links) links.classList.toggle('mobile-open');
    });
  }
});

/* ══════════ OWNER ROLE NAV ══════════ */
// If user is an owner, update the nav actions area to show dashboard link
(function() {
  const u = JSON.parse(localStorage.getItem('aurum-user') || 'null');
  if (u && u.role === 'owner') {
    const loggedDiv = document.getElementById('navUserLogged');
    if (loggedDiv) {
      // Add dashboard link
      const dashLink = document.createElement('a');
      dashLink.href = 'owner-dashboard.html';
      dashLink.className = 'nav-btn nav-btn-dash';
      dashLink.style.cssText = 'margin-right:8px;';
      dashLink.textContent = 'Dashboard';
      loggedDiv.insertBefore(dashLink, loggedDiv.firstChild);
    }
  }
})();
