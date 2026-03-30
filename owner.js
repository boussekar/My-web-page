/* ═══════════════════════════════════════════════
   AURUM — Owner Portal · owner.js
═══════════════════════════════════════════════ */

/* ══════════════════┐
   THEME & CURSOR
   └══════════════════ */
const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// Load saved theme from localStorage (synced across all pages)
const savedTheme = localStorage.getItem("aurum-theme") || "dark-mode";
body.className = savedTheme;
updateThemeIcon(savedTheme);

themeToggle?.addEventListener("click", () => {
  const isDark = body.classList.contains("dark-mode");
  const next = isDark ? "light-mode" : "dark-mode";
  body.className = next;
  localStorage.setItem("aurum-theme", next);
  updateThemeIcon(next);
  // Re-apply star rating inline styles for new theme
  const currentStars = document.getElementById('f-stars')?.value;
  if (currentStars) setStarRating(currentStars);
});

function updateThemeIcon(mode) {
  if (themeIcon) themeIcon.textContent = mode === "dark-mode" ? "☀" : "☾";
}

const cursorRing = document.getElementById("cursorRing");

// Keep default system cursor only - no custom effects.
// Cursor will show the native pointer with gold-themed interface.



/* ══════════════════
   STEP NAVIGATION
══════════════════ */
let currentStep = 1;
const totalSteps = 5;

function goStep(n) {
  if (n < 1 || n > totalSteps) return;

  // Validate before moving forward
  if (n > currentStep) {
    const err = validateStep(currentStep);
    if (err) {
      showToast(err, "error");
      return;
    }
  }

  // Hide current, show new
  document.getElementById(`step-${currentStep}`).classList.remove("active");
  document.getElementById(`step-${n}`).classList.add("active");

  // Update progress
  document.querySelectorAll(".prog-step").forEach((el) => {
    const s = parseInt(el.dataset.step);
    el.classList.remove("active", "done");
    if (s < n) el.classList.add("done");
    if (s === n) el.classList.add("active");
  });

  currentStep = n;
  window.scrollTo({
    top: document.getElementById("listingForm").offsetTop - 80,
    behavior: "smooth",
  });
  updateCompleteness();
}

function validateStep(step) {
  if (step === 1) {
    if (!document.getElementById("f-name").value.trim())
      return "Please enter your hotel name.";
    if (!document.getElementById("f-city").value.trim())
      return "Please enter the city.";
    if (!document.getElementById("f-country").value.trim())
      return "Please enter the country.";
    if (!document.getElementById("f-address").value.trim())
      return "Please enter the full address.";
    if (!document.getElementById("f-desc").value.trim())
      return "Please add a short description.";
  }
  if (step === 2) {
    const prices = [...document.querySelectorAll(".room-price-inp")].map((i) =>
      parseFloat(i.value),
    );
    if (prices.length === 0) return "Please add at least one room type.";
    if (prices.some((p) => isNaN(p) || p <= 0))
      return "Please enter valid prices for all rooms.";
  }
  if (step === 4) {
    if (!document.getElementById("f-ownername").value.trim())
      return "Please enter the owner name.";
    if (!document.getElementById("f-email").value.trim())
      return "Please enter a business email.";
    if (!document.getElementById("f-phone").value.trim())
      return "Please enter a phone number.";
  }
  return null;
}

/* ══════════════════
   ROOM TYPES
══════════════════ */
let roomIndex = 0;

function addRoomType(name = "Deluxe Room", price = "", capacity = 2, qty = 10) {
  roomIndex++;
  const idx = roomIndex;
  const div = document.createElement("div");
  div.className = "room-entry";
  div.id = `re-${idx}`;

  const types = [
    "Standard Room",
    "Superior Room",
    "Deluxe Room",
    "Junior Suite",
    "Suite",
    "Grand Suite",
    "Presidential Suite",
    "Penthouse",
  ];

  div.innerHTML = `
    <div class="room-entry-header">
      <div class="room-entry-title">Room Type ${idx}</div>
      <button class="room-remove-btn" onclick="removeRoomEntry(${idx})">Remove ✕</button>
    </div>
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Room Category</label>
        <select class="field-input room-type-sel" onchange="updatePreview()">
          ${types.map((t) => `<option ${t === name ? "selected" : ""}>${t}</option>`).join("")}
        </select>
      </div>
      <div class="field-group">
        <label class="field-label">Price per Night (USD) *</label>
        <input type="number" class="field-input room-price-inp" placeholder="350" value="${price}" min="50" onchange="updatePreview()" oninput="updatePreview()"/>
      </div>
    </div>
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Max Guests</label>
        <select class="field-input">
          ${[1, 2, 3, 4, 5, 6, 8].map((n) => `<option ${n === capacity ? "selected" : ""}>${n} guest${n > 1 ? "s" : ""}</option>`).join("")}
        </select>
      </div>
      <div class="field-group">
        <label class="field-label">Rooms Available</label>
        <input type="number" class="field-input" placeholder="10" value="${qty}" min="1"/>
      </div>
    </div>
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Bed Type</label>
        <select class="field-input">
          <option>King Bed</option>
          <option>Queen Bed</option>
          <option>Twin Beds</option>
          <option>Double Bed</option>
          <option>Bunk Beds</option>
        </select>
      </div>
      <div class="field-group">
        <label class="field-label">Room Size (m²)</label>
        <input type="number" class="field-input" placeholder="45" min="10"/>
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Room Highlights</label>
      <input type="text" class="field-input" placeholder="Canal view, private balcony, walk-in wardrobe…"/>
    </div>
  `;

  document.getElementById("roomsContainer").appendChild(div);
  updatePreview();
  updateCompleteness();
}

window.removeRoomEntry = function (idx) {
  const el = document.getElementById(`re-${idx}`);
  if (el) {
    el.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => el.remove(), 300);
  }
  setTimeout(updatePreview, 350);
};

document
  .getElementById("addRoomTypeBtn")
  .addEventListener("click", () => addRoomType());
addRoomType("Deluxe Room", 350, 2, 12);
addRoomType("Grand Suite", 850, 4, 4);

/* ══════════════════
   STAR SELECTOR  — radio version matching amenity-item style
══════════════════ */
const starValueLabel = document.getElementById("starValueLabel");

function initStars() {
  const radios = document.querySelectorAll('.star-radio');
  if (!radios.length) return;

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      const v = parseInt(radio.value);
      const hidden = document.getElementById('f-stars');
      if (hidden) hidden.value = v;
      if (starValueLabel)
        starValueLabel.textContent = v === 1 ? 'Selected rating: 1 star' : `Selected rating: ${v} stars`;
      updatePreview();
    });
  });

  // Ensure clean state on load
  radios.forEach(r => r.checked = false);
  const hidden = document.getElementById('f-stars');
  if (hidden) hidden.value = '';
  if (starValueLabel) starValueLabel.textContent = 'Select a star rating';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStars);
} else {
  initStars();
}



/* ══════════════════
   TAG INPUT (Languages)
══════════════════ */
window.removeTag = function (btn) {
  btn.parentElement.remove();
};

document.getElementById("langInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.value.trim()) {
    e.preventDefault();
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.innerHTML = `${e.target.value.trim()} <button onclick="removeTag(this)">×</button>`;
    document.getElementById("langTags").appendChild(tag);
    e.target.value = "";
  }
});

/* ══════════════════
   COMMISSION CARDS
══════════════════ */
document.querySelectorAll(".comm-card").forEach((card) => {
  card.addEventListener("click", () => {
    document
      .querySelectorAll(".comm-card")
      .forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
    document.getElementById("f-commission").value = card.dataset.val;
    document.getElementById("opbComm").textContent = card.dataset.val + "%";
  });
});

/* ══════════════════
   PHOTO UPLOAD
══════════════════ */
const uploadZone = document.getElementById("uploadZone");
const photoGrid = document.getElementById("photoGrid");
const fileInput = document.getElementById("fileInput");
const photoLabels = [
  "Exterior",
  "Lobby",
  "Room",
  "Suite",
  "Dining",
  "Pool",
  "Spa",
  "Bar",
  "Garden",
  "View",
  "Gym",
  "Event Space",
  "Terrace",
  "Bathroom",
  "Details",
  "Night View",
  "Rooftop",
  "Entrance",
  "Concierge",
  "Breakfast",
];
let photoCount = 0;

uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("drag-over");
});
uploadZone.addEventListener("dragleave", () =>
  uploadZone.classList.remove("drag-over"),
);
uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("drag-over");
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

function handleFiles(files) {
  [...files].forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    if (photoCount >= 20) {
      showToast("Maximum 20 photos allowed.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      photoCount++;
      const thumb = document.createElement("div");
      thumb.className = "photo-thumb";
      thumb.id = `pt-${photoCount}`;
      const pc = photoCount;
      thumb.innerHTML = `
        <img src="${e.target.result}" alt="Photo ${pc}"/>
        <button class="photo-thumb-remove" onclick="removePhoto(${pc})">✕</button>
        <div class="photo-thumb-label">${photoLabels[pc - 1] || "Photo " + pc}</div>
      `;
      photoGrid.appendChild(thumb);
      updateCompleteness();
      updatePreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

window.removePhoto = function (id) {
  const el = document.getElementById(`pt-${id}`);
  if (el) el.remove();
  if (photoCount > 0) photoCount--;
  updateCompleteness();
};

/* ══════════════════
   LIVE PREVIEW
══════════════════ */
const previewUpdating = document.getElementById("previewUpdating");
let previewTimer;

function flashUpdating() {
  previewUpdating.classList.add("show");
  clearTimeout(previewTimer);
  previewTimer = setTimeout(
    () => previewUpdating.classList.remove("show"),
    800,
  );
}

function updatePreview() {
  flashUpdating();

  // Name
  const name = document.getElementById("f-name").value || "Your Hotel Name";
  document.getElementById("prevName").textContent = name;
  document.getElementById("prevInitials").textContent =
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "—";

  // Location
  const city = document.getElementById("f-city").value || "City";
  const country = document.getElementById("f-country").value || "Country";
  document.getElementById("prevLocation").innerHTML = `
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
    ${city}, ${country}
  `;

  // Description
  const desc =
    document.getElementById("f-desc").value ||
    "Your hotel description will appear here as you type…";
  document.getElementById("prevDesc").textContent = desc;

  // Stars
  const stars = parseInt(document.getElementById("f-stars").value) || 0;
  document.getElementById("prevBadge").textContent = stars ? `${stars} ★` : "— ★";
  document.getElementById("prevStars").textContent =
    "★".repeat(stars) + "☆".repeat(5 - stars);

  // Type
  const type = document.getElementById("f-type").value || "Luxury Hotel";
  document.getElementById("prevType").textContent = type;

  // Price
  const prices = [...document.querySelectorAll(".room-price-inp")]
    .map((i) => parseFloat(i.value))
    .filter((v) => !isNaN(v) && v > 0);
  document.getElementById("prevPrice").textContent = prices.length
    ? "$" + Math.min(...prices)
    : "$—";

  // Amenities
  const amenityMap = {
    wifi: "Wi-Fi",
    pool: "Pool",
    spa: "Spa",
    gym: "Gym",
    restaurant: "Restaurant",
    bar: "Bar",
    rooftop: "Rooftop",
    michelin: "Michelin ✦",
    roomservice: "Room Service",
    breakfast: "Breakfast",
    concierge: "Concierge",
    transfer: "Transfer",
    valet: "Valet",
    butler: "Butler",
    laundry: "Laundry",
    business: "Business",
    events: "Events",
    childcare: "Childcare",
    pets: "Pets OK",
    accessible: "Access.",
    eco: "Eco",
    beach: "Beach",
    tennis: "Tennis",
    yoga: "Yoga",
  };
  const checked = [
    ...document.querySelectorAll('input[name="amenity"]:checked'),
  ]
    .map((i) => amenityMap[i.value] || i.value)
    .slice(0, 5);
  document.getElementById("prevAmenities").innerHTML = checked
    .map((a) => `<span class="pa-tag">${a}</span>`)
    .join("");

  // Owner
  const ownerName = document.getElementById("f-ownername").value || "—";
  const ownerEmail = document.getElementById("f-email").value || "—";
  document.getElementById("opbName").textContent = ownerName;
  document.getElementById("opbEmail").textContent = ownerEmail;

  updateCompleteness();
}

function updatePreviewImage(src) {
  const placeholder = document.getElementById("prevImgPlaceholder");
  placeholder.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;" alt="Hotel"/>`;
}

// Char counter
document.getElementById("f-desc").addEventListener("input", function () {
  document.getElementById("descCount").textContent = this.value.length;
  updatePreview();
});

// Live bind all key inputs
[
  "f-name",
  "f-city",
  "f-country",
  "f-address",
  "f-desc",
  "f-ownername",
  "f-email",
  "f-type",
].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", updatePreview);
});

document.querySelectorAll('input[name="amenity"]').forEach((el) => {
  el.addEventListener("change", updatePreview);
});

/* ══════════════════
   COMPLETENESS
══════════════════ */
function updateCompleteness() {
  const checks = [
    { id: "ci-name", done: !!document.getElementById("f-name").value.trim() },
    {
      id: "ci-location",
      done: !!(
        document.getElementById("f-city").value.trim() &&
        document.getElementById("f-country").value.trim()
      ),
    },
    {
      id: "ci-desc",
      done: document.getElementById("f-desc").value.trim().length >= 30,
    },
    {
      id: "ci-rooms",
      done: document.querySelectorAll(".room-price-inp").length > 0,
    },
    {
      id: "ci-owner",
      done: !!(
        document.getElementById("f-ownername").value.trim() &&
        document.getElementById("f-email").value.trim()
      ),
    },
    { id: "ci-photos", done: photoCount >= 3 },
  ];

  const done = checks.filter((c) => c.done).length;
  const total = checks.length;
  const pct = Math.round((done / total) * 100);

  document.getElementById("compPct").textContent = pct + "%";
  document.getElementById("compBar").style.width = pct + "%";

  checks.forEach((c) => {
    const el = document.getElementById(c.id);
    if (!el) return;
    el.classList.toggle("done", c.done);
    el.classList.toggle("pending", !c.done);
  });
}

/* ══════════════════
   HERO COUNTER
══════════════════ */
function animateCount(el) {
  const target = parseInt(el.dataset.target);
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString();
    if (current >= target) clearInterval(timer);
  }, 20);
}

// Trigger counter on intersection
const counterEls = document.querySelectorAll(".num-count");
const counterObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target);
        counterObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.5 },
);
counterEls.forEach((el) => counterObs.observe(el));

// Animate bar fill on load
setTimeout(() => {
  document.querySelectorAll(".vc-bar-fill").forEach((el) => {
    el.style.width = el.style.width; // trigger repaint
  });
}, 500);

/* ══════════════════
   SUBMIT
══════════════════ */
document.getElementById("finalSubmitBtn").addEventListener("click", () => {
  // Validate step 5
  if (!document.getElementById("agreeTerms").checked) {
    showToast("Please agree to the Partner Terms & Conditions.", "error");
    return;
  }

  const name = document.getElementById("f-name").value.trim();
  if (!name) {
    showToast("Hotel name is required.", "error");
    return;
  }

  // Generate reference
  const ref = "AUR-" + Math.random().toString(36).substr(2, 6).toUpperCase();

  document.getElementById("successHotelName").textContent = name;
  document.getElementById("successRef").textContent = ref;

  document.getElementById("successOverlay").classList.add("show");
  document.body.style.overflow = "hidden";
});

/* ══════════════════
   SCROLL ANIMATIONS
══════════════════ */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll(".step-card, .visual-card").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});

/* ══════════════════
   TOAST
══════════════════ */
function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast show" + (type ? " " + type : "");
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => t.classList.remove("show"), 4200);
}

/* ══════════════════
   INIT
══════════════════ */
updatePreview();
updateCompleteness();
