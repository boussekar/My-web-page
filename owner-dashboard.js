/* AURUM — Owner Dashboard JS */

/* ── Theme ── */
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const savedTheme  = localStorage.getItem('aurum-theme') || 'dark-mode';
body.className = savedTheme;
if (themeIcon) themeIcon.textContent = savedTheme === 'dark-mode' ? '☀' : '☾';
themeToggle?.addEventListener('click', () => {
  const next = body.classList.contains('dark-mode') ? 'light-mode' : 'dark-mode';
  body.className = next;
  localStorage.setItem('aurum-theme', next);
  if (themeIcon) themeIcon.textContent = next === 'dark-mode' ? '☀' : '☾';
});

/* ── Auth Guard ── */
const user = JSON.parse(localStorage.getItem('aurum-user') || 'null');
if (!user || user.role !== 'owner') {
  window.location.href = 'auth.html';
}

/* ── Populate owner info ── */
if (user) {
  document.getElementById('navOwnerInitials').textContent  = user.initials || 'OW';
  document.getElementById('navOwnerName').textContent      = user.name ? user.name.split(' ')[0] : 'Owner';
  document.getElementById('sideOwnerInitials').textContent = user.initials || 'OW';
  document.getElementById('sideOwnerName').textContent     = user.name || 'Owner';
  document.getElementById('sideOwnerHotel').textContent    = user.hotelName || 'Your Property';
  document.getElementById('ownerGreetName').textContent    = user.name ? user.name.split(' ')[0] : 'Partner';
}

/* ── Sign out ── */
document.getElementById('dashSignout')?.addEventListener('click', () => {
  localStorage.removeItem('aurum-user');
  window.location.href = 'index.html';
});

/* ── Tab Navigation ── */
const navBtns = document.querySelectorAll('.snav-btn');
const tabs    = document.querySelectorAll('.dash-tab');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => switchDashTab(btn.dataset.tab));
});

window.switchDashTab = function(tabId) {
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  tabs.forEach(t   => t.classList.toggle('active', t.id === 'tab-' + tabId));
};

/* ── Mock Data ── */
const mockBookings = [
  { guest:'Madeleine L.', room:'Grand Suite 401', checkin:'2025-07-14', checkout:'2025-07-18', nights:4, revenue:3400, status:'confirmed' },
  { guest:'James H.', room:'Deluxe 202', checkin:'2025-07-15', checkout:'2025-07-17', nights:2, revenue:900, status:'confirmed' },
  { guest:'Layla M.', room:'Junior Suite 305', checkin:'2025-07-18', checkout:'2025-07-22', nights:4, revenue:2200, status:'upcoming' },
  { guest:'Thomas R.', room:'Deluxe 108', checkin:'2025-07-10', checkout:'2025-07-13', nights:3, revenue:1350, status:'confirmed' },
  { guest:'Amira K.', room:'Presidential 501', checkin:'2025-07-20', checkout:'2025-07-25', nights:5, revenue:8750, status:'upcoming' },
  { guest:'Carlos V.', room:'Suite 303', checkin:'2025-07-08', checkout:'2025-07-12', nights:4, revenue:3200, status:'confirmed' },
  { guest:'Sophie D.', room:'Deluxe 114', checkin:'2025-07-05', checkout:'2025-07-07', nights:2, revenue:900, status:'confirmed' },
  { guest:'Omar F.', room:'Grand Suite 402', checkin:'2025-07-22', checkout:'2025-07-26', nights:4, revenue:3400, status:'pending' },
];
const monthlyRevenue = [
  { month:'Feb', bookings:102, gross:61200 },
  { month:'Mar', bookings:118, gross:70800 },
  { month:'Apr', bookings:125, gross:75000 },
  { month:'May', bookings:131, gross:78600 },
  { month:'Jun', bookings:139, gross:82100 },
  { month:'Jul', bookings:148, gross:84200 },
];

/* ── Properties (localStorage-backed) ── */
function getProperties() {
  try {
    const stored = localStorage.getItem('aurum-owner-properties');
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  // Seed with default
  const defaults = [
    { name: user?.hotelName || 'Grand Hotel AURUM', city: 'Paris', country: 'France', stars: 5, rooms: 56, bookings:148, revenue:84200, occ:83, status:'live' }
  ];
  saveProperties(defaults);
  return defaults;
}

function saveProperties(props) {
  localStorage.setItem('aurum-owner-properties', JSON.stringify(props));
}

function getRooms() {
  try {
    const stored = localStorage.getItem('aurum-owner-rooms');
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return null; // will use defaults in renderRoomGrid
}

function saveRooms(rooms) {
  localStorage.setItem('aurum-owner-rooms', JSON.stringify(rooms));
}

let properties = getProperties();

/* ── Render Recent Bookings ── */
function renderRecentBookings() {
  const el = document.getElementById('recentBookingsList');
  if (!el) return;
  el.innerHTML = mockBookings.slice(0,5).map(b => `
    <div class="bl-item">
      <div class="bl-avatar">${b.guest.split(' ').map(n=>n[0]).join('')}</div>
      <div class="bl-info">
        <div class="bl-name">${b.guest}</div>
        <div class="bl-room">${b.room} · ${b.nights}n</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
        <div class="bl-price">$${b.revenue.toLocaleString()}</div>
        <div class="bl-status ${b.status}">${b.status}</div>
      </div>
    </div>
  `).join('');
}

/* ── Render Revenue Chart ── */
function renderRevChart() {
  const barsEl   = document.getElementById('revBars');
  const labelsEl = document.getElementById('revLabels');
  if (!barsEl || !labelsEl) return;
  const max = Math.max(...monthlyRevenue.map(m => m.gross));
  barsEl.innerHTML = monthlyRevenue.map(m => {
    const pct = (m.gross / max) * 100;
    const val = (m.gross/1000).toFixed(0) + 'k';
    return `<div class="rev-bar-wrap">
      <div class="rev-bar-val">$${val}</div>
      <div class="rev-bar" style="height:${pct}%;"></div>
    </div>`;
  }).join('');
  labelsEl.innerHTML = monthlyRevenue.map(m => `<div class="rev-label">${m.month}</div>`).join('');
}

/* ── Render Bookings Table ── */
function renderBookingsTable(filter = 'all') {
  const el = document.getElementById('bookingsTableBody');
  if (!el) return;
  const filtered = filter === 'all' ? mockBookings : mockBookings.filter(b => b.status === filter);
  el.innerHTML = filtered.map(b => `
    <tr>
      <td>${b.guest}</td>
      <td>${b.room}</td>
      <td>${b.checkin}</td>
      <td>${b.checkout}</td>
      <td>${b.nights}</td>
      <td style="font-family:var(--font-d);color:var(--gold);">$${b.revenue.toLocaleString()}</td>
      <td><span class="bt-status ${b.status === 'confirmed' ? 'confirmed' : b.status === 'upcoming' ? 'upcoming' : 'pending'}">${b.status}</span></td>
    </tr>
  `).join('');
}

/* ── Render Properties ── */
function renderProperties() {
  const el = document.getElementById('propertiesGrid');
  if (!el) return;
  const hotelImages = [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&w=400&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&w=400&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&w=400&fit=crop',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&w=400&fit=crop',
    'https://images.unsplash.com/photo-1578683014511-834f6e1df29e?ixlib=rb-4.0.3&w=400&fit=crop'
  ];
  el.innerHTML = properties.map((p, i) => {
    const img = hotelImages[i % hotelImages.length];
    return `
      <div class="prop-card">
        <div class="prop-card-img" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${img}'); background-size: cover; background-position: center;">
          <div class="prop-initials">${p.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
          <div class="prop-status-badge ${p.status}">${p.status === 'live' ? '● Live' : '⏳ Under Review'}</div>
        </div>
        <div class="prop-card-body">
          <div class="prop-name">${p.name}</div>
          <div class="prop-loc">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:3px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${[p.city, p.country].filter(Boolean).join(', ') || 'Location not set'}
          </div>
          <div class="prop-stars-row">
            ${Array.from({length: p.stars || 5}, () => '<span class="prop-star">★</span>').join('')}
          </div>
          <div class="prop-stats">
            <div><div class="ps-num">${p.rooms}</div><div class="ps-label">Rooms</div></div>
            <div><div class="ps-num">${p.occ || 0}%</div><div class="ps-label">Occupancy</div></div>
            <div><div class="ps-num">$${((p.revenue||0)/1000).toFixed(0)}k</div><div class="ps-label">Revenue</div></div>
          </div>
          <div class="prop-actions">
            <button class="btn-prop-edit" onclick="openEditProp(${i})">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button class="btn-prop-outline" onclick="switchDashTab('rooms')">Rooms</button>
            <button class="btn-prop-outline" onclick="switchDashTab('bookings')">Bookings</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('kpiProperties').textContent = properties.length;
}


/* ── Render Room Grid ── */
const ROOM_STATUSES = ['available', 'occupied', 'maintenance', 'reserved'];
const ROOM_TYPE_NAMES = { DX:'Deluxe', SU:'Suite', GS:'Grand S.', PR:'Presid.' };

function renderRoomGrid() {
  const el = document.getElementById('roomGrid');
  if (!el) return;

  // Load saved room data or use defaults
  let roomData = getRooms();
  if (!roomData) {
    const types = ['DX','DX','DX','SU','SU','GS','GS','PR','DX','DX','DX','SU','DX','DX','SU','GS','DX','DX','DX','SU','GS','DX','PR','DX','DX','DX','SU','SU','DX','DX','DX','DX'];
    const statuses = ['occupied','occupied','available','occupied','occupied','maintenance','occupied','occupied','occupied','available','occupied','occupied','reserved','occupied','occupied','occupied','available','occupied','occupied','occupied','occupied','maintenance','occupied','occupied','available','occupied','occupied','occupied','occupied','available','occupied','reserved'];
    roomData = types.map((t, i) => ({ type: t, status: statuses[i] }));
  }

  // Persist if new
  if (!localStorage.getItem('aurum-owner-rooms')) {
    saveRooms(roomData);
  }

  // Render
  el.innerHTML = roomData.map((r, i) => {
    const floor = Math.floor(i / 8) + 1;
    const num = (i % 8) + 1;
    const roomNum = `${floor}0${num}`;
    return `<div class="room-cell ${r.status}" data-room="${i}" title="${roomNum} — ${ROOM_TYPE_NAMES[r.type] || r.type} — ${r.status}\nClick to change status">
      <div class="room-num">${roomNum}</div>
      <div class="room-type-label">${r.type}</div>
    </div>`;
  }).join('');

  // Click to cycle status
  el.querySelectorAll('.room-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const idx = parseInt(cell.dataset.room);
      const current = roomData[idx].status;
      const nextIdx = (ROOM_STATUSES.indexOf(current) + 1) % ROOM_STATUSES.length;
      roomData[idx].status = ROOM_STATUSES[nextIdx];
      cell.className = `room-cell ${roomData[idx].status}`;
      cell.title = `${cell.querySelector('.room-num').textContent} — ${ROOM_TYPE_NAMES[roomData[idx].type]} — ${roomData[idx].status}\nClick to change status`;
      saveRooms(roomData);
      updateRoomSummary(roomData);
      showToast(`Room ${cell.querySelector('.room-num').textContent} → ${roomData[idx].status}`);
    });
  });

  updateRoomSummary(roomData);
}

function updateRoomSummary(roomData) {
  const el = document.getElementById('roomSummary');
  if (!el || !roomData) return;
  const counts = { available: 0, occupied: 0, maintenance: 0, reserved: 0 };
  roomData.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
  el.innerHTML = `
    <div class="rs-item"><span class="rs-count green">${counts.occupied}</span><span class="rs-label">Occupied</span></div>
    <div class="rs-item"><span class="rs-count teal">${counts.available}</span><span class="rs-label">Available</span></div>
    <div class="rs-item"><span class="rs-count yellow">${counts.maintenance}</span><span class="rs-label">Maintenance</span></div>
    <div class="rs-item"><span class="rs-count gray">${counts.reserved}</span><span class="rs-label">Reserved</span></div>
  `;
}

/* ── Render Revenue Breakdown ── */
function renderRevBreakdown() {
  const el = document.getElementById('revBreakdownBody');
  if (!el) return;
  el.innerHTML = monthlyRevenue.map((m, i) => {
    const commission = Math.round(m.gross * 0.12);
    const net = m.gross - commission;
    const prev = monthlyRevenue[i-1];
    const trend = prev ? (m.gross > prev.gross ? '▲' : '▼') : '—';
    const trendColor = prev ? (m.gross > prev.gross ? '#3fb891' : '#e74c3c') : 'var(--text-muted)';
    return `<tr>
      <td class="rbt-td" style="color:var(--white);font-weight:500;">${m.month} 2025</td>
      <td class="rbt-td">${m.bookings}</td>
      <td class="rbt-td" style="font-family:var(--font-d);color:var(--gold);">$${m.gross.toLocaleString()}</td>
      <td class="rbt-td" style="color:var(--text-muted);">$${commission.toLocaleString()}</td>
      <td class="rbt-td" style="color:#3fb891;">$${net.toLocaleString()}</td>
      <td class="rbt-td" style="color:${trendColor};font-size:14px;">${trend}</td>
    </tr>`;
  }).join('');
}

/* ── Booking filter ── */
document.getElementById('bookingFilter')?.addEventListener('change', function() {
  renderBookingsTable(this.value);
});

/* ── Dashboard Custom Dropdown Init ── */
function initDashSelect(containerId, hiddenSelectId, onChange) {
  const container = document.getElementById(containerId);
  const hiddenSel = document.getElementById(hiddenSelectId);
  if (!container || !hiddenSel) return;

  const trigger = container.querySelector('.dash-select-trigger');
  const valueSpan = container.querySelector('.dash-select-value');
  const options = container.querySelectorAll('.dash-select-option');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.dash-custom-select.open').forEach(el => {
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
      if (onChange) onChange(val);
    });
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) container.classList.remove('open');
  });
}

initDashSelect('bookingFilterWrap', 'bookingFilter', (val) => renderBookingsTable(val));
initDashSelect('revPeriodWrap', 'revPeriod', (val) => { /* period change handler */ });

/* ── Edit Property Modal ── */
const epmModal     = document.getElementById('editPropModal');
const epmForm      = document.getElementById('epmForm');
const epmDeleteConfirm = document.getElementById('epmDeleteConfirm');

window.openEditProp = function(index) {
  const prop = properties[index];
  if (!prop) return;

  document.getElementById('epmPropIndex').value = index;
  document.getElementById('epmTitle').textContent = 'Edit Property';
  document.getElementById('epmSubtitle').textContent = 'Update your property details';
  document.getElementById('epmName').value = prop.name || '';
  document.getElementById('epmCity').value = prop.city || '';
  document.getElementById('epmCountry').value = prop.country || '';
  document.getElementById('epmRooms').value = prop.rooms || '';

  const starVal = prop.stars || 5;
  document.getElementById('epmStarVal').value = starVal;
  document.querySelectorAll('.star-opt').forEach(s => {
    s.classList.toggle('selected', parseInt(s.dataset.val) === starVal);
  });

  // Show form, hide delete confirm
  epmForm.style.display = 'block';
  epmDeleteConfirm.classList.remove('active');

  epmModal.classList.add('open');
};

function closeEditProp() {
  epmModal.classList.remove('open');
}

document.getElementById('epmClose')?.addEventListener('click', closeEditProp);
document.getElementById('epmBackdrop')?.addEventListener('click', closeEditProp);
document.getElementById('epmCancelBtn')?.addEventListener('click', closeEditProp);

// Star rating
document.querySelectorAll('.star-opt').forEach(star => {
  star.addEventListener('click', () => {
    document.querySelectorAll('.star-opt').forEach(s => s.classList.remove('selected'));
    star.classList.add('selected');
    document.getElementById('epmStarVal').value = star.dataset.val;
  });
});

// Delete button → show confirm
document.getElementById('epmDeleteBtn')?.addEventListener('click', () => {
  epmForm.style.display = 'none';
  epmDeleteConfirm.classList.add('active');
});

// Back from confirm
document.getElementById('epmBackBtn')?.addEventListener('click', () => {
  epmDeleteConfirm.classList.remove('active');
  epmForm.style.display = 'block';
});

// Confirm delete
document.getElementById('epmConfirmDeleteBtn')?.addEventListener('click', () => {
  const idx = parseInt(document.getElementById('epmPropIndex').value);
  if (properties[idx]) {
    properties.splice(idx, 1);
    saveProperties(properties);
    renderProperties();
    closeEditProp();
    showToast('Property deleted', 'negative');
  }
});

// Form submit — save
epmForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const idx = parseInt(document.getElementById('epmPropIndex').value);
  const updated = {
    name: document.getElementById('epmName').value.trim(),
    city: document.getElementById('epmCity').value.trim(),
    country: document.getElementById('epmCountry').value.trim(),
    stars: parseInt(document.getElementById('epmStarVal').value) || 5,
    rooms: parseInt(document.getElementById('epmRooms').value) || 1,
    bookings: properties[idx]?.bookings || 0,
    revenue: properties[idx]?.revenue || 0,
    occ: properties[idx]?.occ || 0,
    status: properties[idx]?.status || 'live'
  };
  properties[idx] = updated;
  saveProperties(properties);
  renderProperties();
  closeEditProp();
  showToast('Property updated successfully');
});

/* ── Init ── */
renderRecentBookings();
renderRevChart();
renderBookingsTable();
renderProperties();
renderRoomGrid();
renderRevBreakdown();

/* ── Toast ── */
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast show' + (type ? ' '+type : '');
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.classList.remove('show'), 4000);
}

/* ── Nav Hide / Reveal ── */
const navHideBtn   = document.getElementById('navHideBtn');
const navRevealBtn = document.getElementById('navRevealBtn');

navHideBtn?.addEventListener('click', () => {
  document.body.classList.add('nav-hidden');
  navRevealBtn.classList.add('visible');
  localStorage.setItem('aurum-nav-hidden', '1');
});
navRevealBtn?.addEventListener('click', () => {
  document.body.classList.remove('nav-hidden');
  navRevealBtn.classList.remove('visible');
  localStorage.removeItem('aurum-nav-hidden');
});
if (localStorage.getItem('aurum-nav-hidden')) {
  document.body.classList.add('nav-hidden');
  navRevealBtn?.classList.add('visible');
}