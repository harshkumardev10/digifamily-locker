// ==========================================================================
// APP GLOBAL STATE & SEED DATA
// ==========================================================================

// Multi-family storage keys
const FAMILIES_STORAGE_KEY = "docusaver_families";
const CURRENT_FAMILY_KEY   = "docusaver_current_family_id";
const CURRENT_MEMBER_KEY   = "docusaver_current_member_id";

// ── Pre-configured cloud credentials ─────────────────────────────────────────
const DEFAULT_FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBEjVvv7xg_QNy9XY7QNr4azZME1ECWzWw",
  authDomain:        "digifamily-29d1d.firebaseapp.com",
  projectId:         "digifamily-29d1d",
  storageBucket:     "digifamily-29d1d.firebasestorage.app",
  messagingSenderId: "364366297332",
  appId:             "1:364366297332:web:ec4b3a6a2f4b172fab46a1"
};
const DEFAULT_IMGBB_KEY = "62ad1ef7d9415dbfd02fb76b91f9ade8";
// ─────────────────────────────────────────────────────────────────────────────

const AVATARS = {
  avatar1: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nI0UzRjJGRCcvPjxjaXJjbGUgY3g9JzUwJyBjeT0nNDAnIHI9JzIwJyBmaWxsPScjMUU4OEU1Jy8+PHBhdGggZD0nTTIwIDg1IEMyMCA2NSwgODAgNjUsIDgwIDg1JyBmaWxsPScjMUU4OEU1Jy8+PC9zdmc+`,
  avatar2: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nI0ZGRjNFMCcvPjxjaXJjbGUgY3g9JzUwJyBjeT0nNDAnIHI9JzIwJyBmaWxsPScjRkI4QzAwJy8+PHBhdGggZD0nTTIwIDg1IEMyMCA2NSwgODAgNjUsIDgwIDg1JyBmaWxsPScjRkI4QzAwJy8+PC9zdmc+`,
  avatar3: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nI0U4RjVFOScvPjxjaXJjbGUgY3g9JzUwJyBjeT0nNDAnIHI9JzIwJyBmaWxsPScjNENBRjUwJy8+PHBhdGggZD0nTTIwIDg1IEMyMCA2NSwgODAgNjUsIDgwIDg1JyBmaWxsPScjNENBRjUwJy8+PC9zdmc+`,
  avatar4: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nI0YzRTVGNScvPjxjaXJjbGUgY3g9JzUwJyBjeT0nNDAnIHI9JzIwJyBmaWxsPScjOEUyNEFBJy8+PHBhdGggZD0nTTIwIDg1IEMyMCA2NSwgODAgNjUsIDgwIDg1JyBmaWxsPScjOEUyNEFBJy8+PC9zdmc+`,
  avatar5: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nI0ZDRTRFQycvPjxjaXJjbGUgY3g9JzUwJyBjeT0nNDAnIHI9JzIwJyBmaWxsPScjRDgxQjYwJy8+PHBhdGggZD0nTTIwIDg1IEMyMCA2NSwgODAgNjUsIDgwIDg1JyBmaWxsPScjRDgxQjYwJy8+PC9zdmc+`
};

const SEED_MEMBERS = [];

const SEED_DOCUMENTS = [];

// App Local Database State (scoped to current family)
let db = {
  members: [],
  documents: []
};

// All families stored in localStorage
let families = [];

// Current Session Info
let currentFamily = null;   // the logged-in family object
let currentMember = null;   // the member who opened their vault
let currentFilterCategory = "all";
let currentSearchQuery = "";
let uploadedDocImageBase64 = null;
let uploadedCustomAvatarBase64 = null;
let uploadedEditProfileAvatarBase64 = null;

// Premium buffering loader overlay controller
function showLoader(title, status, durationMs, callback) {
  const loader = document.getElementById("app-loader");
  if (!loader) return;

  document.getElementById("loader-title").textContent = title;
  document.getElementById("loader-status").textContent = status;
  
  loader.classList.remove("hidden");
  
  setTimeout(() => {
    loader.classList.add("hidden");
    if (callback) callback();
  }, durationMs);
}

// ==========================================================================
// DATABASE PERSISTENCE HOOKS (Multi-Family)
// ==========================================================================

// Load all families from localStorage
function loadFamilies() {
  const stored = localStorage.getItem(FAMILIES_STORAGE_KEY);
  if (stored) {
    try {
      families = JSON.parse(stored);
    } catch (e) {
      families = [];
    }
  } else {
    families = [];
  }
}

// Save all families to localStorage
function saveFamilies() {
  localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify(families));
}

// Initialize db from currentFamily's data
function initDatabase() {
  if (!currentFamily) {
    db = { members: [], documents: [] };
    return;
  }
  db = {
    members: currentFamily.members || [],
    documents: currentFamily.documents || []
  };
}

// Save db back into currentFamily and persist
async function saveDatabase() {
  if (!currentFamily) return;

  // Sync db into the family object
  const idx = families.findIndex(f => f.id === currentFamily.id);
  if (idx !== -1) {
    families[idx].members = db.members;
    families[idx].documents = db.documents;
    currentFamily = families[idx];
  }

  try {
    saveFamilies();
  } catch (e) {
    console.error("Failed to save:", e);
    alert("Warning: Browser storage quota exceeded! Please upload smaller files.");
  }

  // Debounced cloud sync (unchanged logic)
  const syncId = localStorage.getItem("docusaver_sync_id");
  const passphrase = localStorage.getItem("docusaver_sync_passphrase");
  if (syncId && passphrase) {
    clearTimeout(_cloudSyncTimer);
    _cloudSyncTimer = setTimeout(async () => {
      try {
        await pushCloudDatabase(syncId, passphrase);
      } catch (err) {
        console.error("Cloud sync failed:", err);
      }
    }, 3000);
  }

  // Firebase Firestore push (debounced)
  if (typeof _firestore !== "undefined" && _firestore && currentFamily) {
    clearTimeout(_firestoreSyncTimer);
    _firestoreSyncTimer = setTimeout(async () => {
      try {
        await pushDbToFirestore();
        console.log("[Firestore] Data synced.");
      } catch (err) {
        console.error("[Firestore] Push failed:", err.message);
      }
    }, 2000);
  }
}

let _cloudSyncTimer = null;
let _firestoreSyncTimer = null;

function getMemberAvatarUrl(member) {
  if (!member) return AVATARS.avatar1;
  return AVATARS[member.avatar] || member.avatar || AVATARS.avatar1;
}

// ==========================================================================
// NAVIGATION DRAWER (SLIDE-OUT MENU) CONTROLLER
// ==========================================================================

function openDrawer() {
  updateDrawerUI();
  const overlay = document.getElementById("drawer-overlay");
  if (overlay) overlay.classList.remove("hidden");
}

function closeDrawer() {
  const overlay = document.getElementById("drawer-overlay");
  if (overlay) overlay.classList.add("hidden");
}

function updateDrawerUI() {
  const familyTitle = document.getElementById("drawer-family-name");
  const userInfo = document.getElementById("drawer-user-info");
  const userAvatar = document.getElementById("drawer-user-avatar");
  const userName = document.getElementById("drawer-user-name");

  const btnHome = document.getElementById("drawer-btn-home");
  const btnAddDoc = document.getElementById("drawer-btn-add-doc");
  const btnAddMember = document.getElementById("drawer-btn-add-member");
  const btnSettings = document.getElementById("drawer-btn-settings");
  const btnExitVault = document.getElementById("drawer-btn-exit-vault");
  const btnSwitchFam = document.getElementById("drawer-btn-switch-family");
  const btnInstall = document.getElementById("drawer-btn-install");

  if (currentFamily) {
    if (familyTitle) familyTitle.textContent = currentFamily.familyName;
    if (btnSwitchFam) btnSwitchFam.classList.remove("hidden");
    if (btnAddMember) btnAddMember.classList.remove("hidden");
    if (btnHome) btnHome.classList.remove("hidden");
  } else {
    if (familyTitle) familyTitle.textContent = "Family Locker Vault";
    if (btnSwitchFam) btnSwitchFam.classList.add("hidden");
    if (btnAddMember) btnAddMember.classList.add("hidden");
    if (btnHome) btnHome.classList.add("hidden");
  }

  if (currentMember) {
    if (userInfo) userInfo.classList.remove("hidden");
    if (userAvatar) userAvatar.src = getMemberAvatarUrl(currentMember);
    if (userName) userName.textContent = currentMember.name;

    if (btnAddDoc) btnAddDoc.classList.remove("hidden");
    if (btnSettings) btnSettings.classList.remove("hidden");
    if (btnExitVault) btnExitVault.classList.remove("hidden");
  } else {
    if (userInfo) userInfo.classList.add("hidden");
    if (btnAddDoc) btnAddDoc.classList.add("hidden");
    if (btnSettings) btnSettings.classList.add("hidden");
    if (btnExitVault) btnExitVault.classList.add("hidden");
  }

  // Inline PWA installed check (works outside the PWA IIFE scope)
  const pwaInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true ||
                       document.referrer.includes('android-app://');
  if (pwaInstalled) {
    if (btnInstall) btnInstall.classList.add("hidden");
  } else {
    if (btnInstall) btnInstall.classList.remove("hidden");
  }
}

// ==========================================================================
// FAMILY AUTH — SIGNUP / LOGIN / LOGOUT
// ==========================================================================

// Show the landing page (family login/signup screen)
function showLanding() {
  document.getElementById("landing-view").classList.remove("hidden");
  document.getElementById("home-view").classList.add("hidden");
  document.getElementById("dashboard-view").classList.add("hidden");
  const famEl = document.getElementById("header-family");
  if (famEl) famEl.classList.add("hidden");
  document.getElementById("header-user").classList.add("hidden");
  currentFamily = null;
  currentMember = null;
  db = { members: [], documents: [] };
}

// Show the family home (member selection) after family login
function showFamilyHome() {
  document.getElementById("landing-view").classList.add("hidden");
  document.getElementById("home-view").classList.remove("hidden");
  document.getElementById("dashboard-view").classList.add("hidden");
  const famEl = document.getElementById("header-family");
  if (famEl) famEl.classList.remove("hidden");
  document.getElementById("header-user").classList.add("hidden");
  renderMembers();
  updateDrawerUI();
}

// Process family signup (create account)
function processFamilySignup(event) {
  event.preventDefault();
  const familyName = document.getElementById("fs-family-name").value.trim();
  const username   = document.getElementById("fs-username").value.trim().toLowerCase();
  const password   = document.getElementById("fs-password").value;
  const confirm    = document.getElementById("fs-confirm").value;
  const errEl      = document.getElementById("fs-error");

  errEl.classList.add("hidden");

  if (password.length < 6) {
    errEl.textContent = "Password must be at least 6 characters.";
    errEl.classList.remove("hidden");
    return;
  }
  if (password !== confirm) {
    errEl.textContent = "Passwords do not match.";
    errEl.classList.remove("hidden");
    return;
  }
  const taken = families.some(f => f.username.toLowerCase() === username);
  if (taken) {
    errEl.textContent = "Username already taken. Please choose another.";
    errEl.classList.remove("hidden");
    return;
  }

  // Create new clean family account with 0 prebuilt cards or members
  const newFamily = {
    id: "f-" + Date.now(),
    familyName,
    username,
    password,
    createdAt: new Date().toISOString(),
    members: [],
    documents: []
  };

  families.push(newFamily);
  saveFamilies();

  // Auto-login after signup into their separate clean portal
  currentFamily = newFamily;
  initDatabase();
  localStorage.setItem(CURRENT_FAMILY_KEY, currentFamily.id);
  
  showLoader("Creating Vault", "Setting up your family locker...", 600, () => {
    currentMember = null;
    showFamilyHome();
  });
}

// Process family login
function processFamilyLogin(event) {
  event.preventDefault();
  const username = document.getElementById("fl-username").value.trim().toLowerCase();
  const password = document.getElementById("fl-password").value;
  const errEl    = document.getElementById("fl-error");

  errEl.classList.add("hidden");

  const family = families.find(f => 
    f.username.toLowerCase() === username && f.password === password
  );
  if (!family) {
    errEl.textContent = "Incorrect username or password. Please try again.";
    errEl.classList.remove("hidden");
    return;
  }

  currentFamily = family;
  initDatabase();
  localStorage.setItem(CURRENT_FAMILY_KEY, currentFamily.id);

  showLoader("Opening Vault", "Connecting to vault...", 600, () => {
    // 1. Instantly switch view to dashboard if 1 member or primary member exists, else family home
    if (db.members && db.members.length === 1) {
      currentMember = db.members[0];
      enterDashboard();
    } else {
      showFamilyHome();
    }

    // 2. Non-blocking cloud sync in background
    if (_firestore) {
      pullDbFromFirestore().then(pulled => {
        if (pulled) {
          console.log("[Firestore] Vault loaded from cloud.");
          renderMembers();
          if (currentMember) renderDocuments();
        }
      }).catch(err => console.warn("[Firestore] Could not pull on login:", err.message));
    }
  });
}

// Process family logout (go back to landing)
function processFamilyLogout() {
  localStorage.removeItem(CURRENT_FAMILY_KEY);
  localStorage.removeItem(CURRENT_MEMBER_KEY);
  showLoader("Locking Vault", "Closing all secure connections...", 800, () => {
    showLanding();
  });
}


// ==========================================================================
// RENDERING FUNCTIONS
// ==========================================================================

// Render Family Members on Home view
function renderMembers() {
  const grid = document.getElementById("members-grid");
  grid.innerHTML = "";

  if (!db.members || db.members.length === 0) {
    grid.innerHTML = `
      <div class="empty-members-card" style="grid-column: 1 / -1; text-align: center; background: var(--bg-card); padding: 32px 20px; border-radius: var(--border-radius-md); border: 2px dashed var(--border-color);">
        <div style="font-size: 2.5rem; margin-bottom: 8px;">👨‍👩‍👧‍👦</div>
        <h3 style="margin: 0 0 6px 0; color: var(--primary-dark);">No Family Members Yet</h3>
        <p style="margin: 0 0 16px 0; color: var(--text-muted); font-size: 0.88rem;">Add your first family member profile to start saving documents.</p>
        <button id="empty-add-member-btn" class="btn btn-primary btn-sm">➕ Add Member</button>
      </div>
    `;
    const btn = document.getElementById("empty-add-member-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        document.getElementById("register-form").reset();
        document.getElementById("reg-error-msg").classList.add("hidden");
        uploadedCustomAvatarBase64 = null;
        showModal("register-modal");
      });
    }
    return;
  }

  db.members.forEach(member => {
    // Count user documents
    const docCount = db.documents.filter(d => d.memberId === member.id).length;
    const avatarUrl = getMemberAvatarUrl(member);

    const card = document.createElement("div");
    card.className = "member-card";
    card.dataset.id = member.id;
    card.innerHTML = `
      <div class="member-avatar-container">
        <img src="${avatarUrl}" alt="${member.name}" class="member-avatar">
      </div>
      <h4>${member.name}</h4>
      <div class="member-age">${member.age} Years</div>
      <div class="member-doc-badge">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span>${docCount} Documents</span>
      </div>
    `;

    // Click handler to login/switch
    card.addEventListener("click", () => {
      openLoginModal(member.id);
    });

    grid.appendChild(card);
  });
}

// Render Document Wallet Grid in Member Dashboard
function renderDocuments() {
  const grid = document.getElementById("docs-grid");
  const emptyState = document.getElementById("docs-empty");
  grid.innerHTML = "";

  if (!currentMember) return;

  // Filter docs belonging to active member
  let userDocs = db.documents.filter(doc => doc.memberId === currentMember.id);

  // Apply search query filter
  if (currentSearchQuery.trim() !== "") {
    const q = currentSearchQuery.toLowerCase();
    userDocs = userDocs.filter(doc => 
      doc.title.toLowerCase().includes(q) || 
      doc.type.toLowerCase().includes(q) || 
      doc.number.toLowerCase().includes(q) ||
      doc.nameOnDoc.toLowerCase().includes(q)
    );
  }

  // Apply category filter
  if (currentFilterCategory !== "all") {
    userDocs = userDocs.filter(doc => doc.category === currentFilterCategory);
  }

  if (userDocs.length === 0) {
    grid.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }

  grid.classList.remove("hidden");
  emptyState.classList.add("hidden");

  userDocs.forEach(doc => {
    const card = document.createElement("div");
    card.className = "doc-card";
    card.dataset.id = doc.id;

    // Get color badge class & preview icon based on category
    let badgeClass = "badge-other";
    if (doc.category === "identity") badgeClass = "badge-identity";
    else if (doc.category === "education") badgeClass = "badge-education";
    else if (doc.category === "vehicle") badgeClass = "badge-vehicle";

    const hasAttachment = doc.image ? true : false;

    // Custom SVG Icon based on type
    let svgIcon = `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    `;

    if (["Aadhaar Card", "PAN Card", "Voter ID", "Passport"].includes(doc.type)) {
      svgIcon = `
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
          <line x1="7" y1="8" x2="17" y2="8"></line>
          <line x1="7" y1="12" x2="17" y2="12"></line>
        </svg>
      `;
    } else if (["Driving License", "Registration Certificate (RC)"].includes(doc.type)) {
      svgIcon = `
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="18" r="3"></circle>
          <circle cx="6" cy="6" r="3"></circle>
          <circle cx="18" cy="6" r="3"></circle>
        </svg>
      `;
    }

    card.innerHTML = `
      <div class="doc-card-header">
        <span class="doc-badge ${badgeClass}">${doc.type}</span>
        <div class="doc-card-icon">${svgIcon}</div>
      </div>

      <div class="doc-card-body">
        <h4>${doc.title}</h4>
        <div class="doc-num">${doc.number}</div>
        <div class="doc-owner">Name: ${doc.nameOnDoc}</div>
        ${hasAttachment ? `
          <img src="${doc.image}" alt="${doc.title} Scan Preview" class="doc-card-scan-preview">
        ` : `
          <div class="doc-not-uploaded" style="margin-top: 10px; margin-bottom: 6px;">
            <span class="doc-not-uploaded-icon">📷</span>
            <span class="doc-not-uploaded-text">No Scan Uploaded Yet</span>
          </div>
        `}
      </div>

      <div class="doc-card-footer">
        <div class="doc-card-actions" style="width: 100%; justify-content: space-between;">
          <button class="btn-card-action btn-action-view" title="View Document">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            View
          </button>
          <button class="btn-card-action btn-action-edit" title="Edit Details & Upload Image">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Edit / Scan
          </button>
          <button class="btn-card-action btn-action-delete" title="Delete Document">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;

    // Action button listeners
    const viewBtn = card.querySelector(".btn-action-view");
    if (viewBtn) {
      viewBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openViewDocModal(doc.id);
      });
    }

    const editBtn = card.querySelector(".btn-action-edit");
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditDocModal(doc.id);
      });
    }

    const deleteBtn = card.querySelector(".btn-action-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete ${doc.title}? This cannot be undone.`)) {
          db.documents = db.documents.filter(d => d.id !== doc.id);
          saveDatabase();
          renderDocuments();
        }
      });
    }

    // Clicking card itself opens view modal
    card.addEventListener("click", () => {
      openViewDocModal(doc.id);
    });

    grid.appendChild(card);
  });
}

// Render document info card showing ONLY user-entered data
function renderMockCard(doc) {
  const displayContainer = document.getElementById("digi-card-display");
  displayContainer.className = "digi-card clean-card";
  displayContainer.innerHTML = "";

  // Category badge color
  let badgeColor = "#6a1b9a"; let badgeBg = "#f3e5f5";
  if (doc.category === "identity")  { badgeColor = "#1565c0"; badgeBg = "#e3f2fd"; }
  if (doc.category === "education") { badgeColor = "#2e7d32"; badgeBg = "#e8f5e9"; }
  if (doc.category === "vehicle")   { badgeColor = "#ef6c00"; badgeBg = "#fff3e0"; }

  displayContainer.innerHTML = `
    <div class="clean-card-inner">
      <div class="clean-card-header">
        <span class="clean-badge" style="background:${badgeBg}; color:${badgeColor};">${doc.type}</span>
        <div class="clean-lock">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span style="font-size:0.7rem;font-weight:700;color:var(--green);">Saved</span>
        </div>
      </div>

      <h3 class="clean-card-title">${doc.title}</h3>

      <div class="clean-divider"></div>

      <div class="clean-fields">
        <div class="clean-field">
          <div class="clean-field-label">Name on Document</div>
          <div class="clean-field-value">${doc.nameOnDoc}</div>
        </div>
        <div class="clean-field">
          <div class="clean-field-label">Document / ID Number</div>
          <div class="clean-field-value mono">${doc.number}</div>
        </div>
        <div class="clean-field">
          <div class="clean-field-label">Document Type</div>
          <div class="clean-field-value">${doc.type}</div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// SESSION CONTROLLER (LOGIN / LOGOUT)
// ==========================================================================

function openLoginModal(memberId) {
  const member = db.members.find(m => m.id === memberId);
  if (!member) return;

  // Clear previous errors
  document.getElementById("login-error-msg").classList.add("hidden");
  document.getElementById("login-form").reset();

  // Load member info in Modal
  document.getElementById("login-member-id").value = member.id;
  document.getElementById("login-member-name").textContent = member.name;
  document.getElementById("login-member-username-display").textContent = `@${member.username}`;
  document.getElementById("login-member-avatar").src = getMemberAvatarUrl(member);

  showModal("login-modal");
}

function processLogin(event) {
  event.preventDefault();

  const id = document.getElementById("login-member-id").value;
  const passwordInput = document.getElementById("login-password").value;

  const member = db.members.find(m => m.id === id);

  // Member password or family passphrase
  if (member && currentFamily && (passwordInput === currentFamily.password || (member.password && passwordInput === member.password))) {
    // Correct login
    hideModal("login-modal");
    showLoader("Verifying Identity", "Authorizing secure locker access...", 1200, () => {
      currentMember = member;
      enterDashboard();
    });
  } else {
    // Failed login
    const errorMsg = document.getElementById("login-error-msg");
    errorMsg.textContent = "Wrong family password. Please try again.";
    errorMsg.classList.remove("hidden");
  }
}

function enterDashboard() {
  if (!currentMember) return;

  // Save session to survive refreshes
  localStorage.setItem("docusaver_current_member_id", currentMember.id);

  // Update navbar/header state
  document.getElementById("header-avatar").src = getMemberAvatarUrl(currentMember);
  document.getElementById("header-username").textContent = currentMember.name;
  document.getElementById("header-user").classList.remove("hidden");

  // Load Dashboard Data
  document.getElementById("dash-avatar").src = getMemberAvatarUrl(currentMember);
  document.getElementById("dash-welcome").textContent = `Welcome back, ${currentMember.name.split(' ')[0]}`;
  document.getElementById("dash-age").textContent = currentMember.age;
  document.getElementById("dash-username").textContent = currentMember.username;

  // Display Switch
  document.getElementById("landing-view").classList.add("hidden");
  document.getElementById("home-view").classList.add("hidden");
  document.getElementById("dashboard-view").classList.remove("hidden");

  // Reset filter settings
  currentFilterCategory = "all";
  currentSearchQuery = "";
  document.getElementById("doc-search").value = "";
  
  // Highlight "All" filter tab
  document.querySelectorAll(".filter-tab").forEach(tab => {
    if (tab.dataset.category === "all") tab.classList.add("active");
    else tab.classList.remove("active");
  });

  renderDocuments();
  updateDrawerUI();
}

function processLogout() {
  showLoader("Locking Vault", "Closing secure connections...", 800, () => {
    currentMember = null;
    // Clear active member session
    localStorage.removeItem("docusaver_current_member_id");
    
    // Update header/nav state
    document.getElementById("header-user").classList.add("hidden");
    
    // Display Switch
    document.getElementById("dashboard-view").classList.add("hidden");
    document.getElementById("home-view").classList.remove("hidden");

    renderMembers(); // Re-render to update any counts
    updateDrawerUI();
  });
}

// ==========================================================================
// REGISTRATION FLOW (NEW FAMILY MEMBER)
// ==========================================================================

function processRegistration(event) {
  event.preventDefault();

  const name = document.getElementById("reg-name").value.trim();
  const age = parseInt(document.getElementById("reg-age").value);
  const username = document.getElementById("reg-username").value.trim().toLowerCase();
  const password = document.getElementById("reg-password").value;

  const errorMsg = document.getElementById("reg-error-msg");
  errorMsg.classList.add("hidden");

  // Check username uniqueness
  const exists = db.members.some(m => m.username.toLowerCase() === username);
  if (exists) {
    errorMsg.textContent = "Username already taken! Please choose another.";
    errorMsg.classList.remove("hidden");
    return;
  }

  // Handle avatar (either cartoon selection or cropped custom photo)
  const finalAvatar = uploadedCustomAvatarBase64 || TOON_AVATARS[0];

  // Create member object
  const newMemberId = "m-" + Date.now();
  const newMember = {
    id: newMemberId,
    name,
    age,
    username,
    password,
    avatar: finalAvatar
  };

  db.members.push(newMember);
  saveDatabase();

  // Reset custom avatar details
  uploadedCustomAvatarBase64 = null;
  document.getElementById("reg-avatar-file").value = "";
  document.getElementById("reg-avatar-preview").src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nI0UzRjJGRCcvPjxjaXJjbGUgY3g9JzUwJyBjeT0nNDAnIHI9JzIwJyBmaWxsPScjMUU4OEU1Jy8+PHBhdGggZD0nTTIwIDg1IEMyMCA2NSwgODAgNjUsIDgwIDg1JyBmaWxsPScjMUU4OEU1Jy8+PC9zdmc+";

  hideModal("register-modal");
  renderMembers();
}

// ==========================================================================
// DOCUMENT ADD / EDIT FLOW
// ==========================================================================

function openAddDocModal() {
  document.getElementById("doc-modal-title").textContent = "Add New Document";
  document.getElementById("doc-form").reset();
  document.getElementById("edit-doc-id").value = "";
  
  // Reset image preview state
  uploadedDocImageBase64 = null;
  document.getElementById("image-preview-container").classList.add("hidden");
  document.getElementById("upload-zone").classList.remove("hidden");

  showModal("doc-modal");
}

function populateAddDocTitle() {
  const typeSelect = document.getElementById("doc-type");
  const titleInput = document.getElementById("doc-title");
  
  if (typeSelect.value) {
    titleInput.value = typeSelect.value;
  }
}

function processDocSubmit(event) {
  event.preventDefault();

  const editId = document.getElementById("edit-doc-id").value;
  const type = document.getElementById("doc-type").value;
  const title = document.getElementById("doc-title").value.trim();
  const number = document.getElementById("doc-number").value.trim();
  const nameOnDoc = document.getElementById("doc-name").value.trim();

  // Deduce category based on selection
  let category = "other";
  if (["Aadhaar Card", "PAN Card", "Passport", "Voter ID"].includes(type)) {
    category = "identity";
  } else if (["Driving License", "Registration Certificate (RC)"].includes(type)) {
    category = "vehicle";
  } else if (["Class X Marksheet", "Class XII Marksheet", "Degree Certificate"].includes(type)) {
    category = "education";
  }

  if (editId) {
    // EDIT MODE
    const docIndex = db.documents.findIndex(d => d.id === editId);
    if (docIndex !== -1) {
      db.documents[docIndex].type = type;
      db.documents[docIndex].title = title;
      db.documents[docIndex].number = number;
      db.documents[docIndex].nameOnDoc = nameOnDoc;
      db.documents[docIndex].category = category;
      // Update image if a new one was uploaded
      if (uploadedDocImageBase64) {
        db.documents[docIndex].image = uploadedDocImageBase64;
      }
    }
  } else {
    // CREATE MODE
    const newDoc = {
      id: "d-" + Date.now(),
      memberId: currentMember.id,
      type,
      title,
      number,
      nameOnDoc,
      category,
      image: uploadedDocImageBase64
    };
    db.documents.push(newDoc);
  }
  saveDatabase();
  hideModal("doc-modal");
  showLoader("Saving Document", "Encrypting document locally...", 1000, () => {
    renderDocuments();
  });
}

function openViewDocModal(docId) {
  const doc = db.documents.find(d => d.id === docId);
  if (!doc) return;

  document.getElementById("view-doc-title-header").textContent = doc.title;

  const comingSoon   = document.getElementById("doc-coming-soon");
  const detailBlock  = document.getElementById("doc-detail-block");
  const scanDisplay  = document.getElementById("doc-attachment-display");

  if (doc.image) {
    // Show clean info card + uploaded image scan
    comingSoon.classList.add("hidden");
    detailBlock.classList.remove("hidden");
    renderMockCard(doc);
    scanDisplay.innerHTML = `<img src="${doc.image}" alt="${doc.title} Scan Image">`;
  } else {
    // No image — show ONLY Coming Soon, nothing else
    comingSoon.classList.remove("hidden");
    detailBlock.classList.add("hidden");
  }

  // Setup actions inside details modal
  const deleteBtn = document.getElementById("delete-doc-btn");
  deleteBtn.onclick = () => {
    if (confirm(`Are you sure you want to delete ${doc.title}? This cannot be undone.`)) {
      db.documents = db.documents.filter(d => d.id !== doc.id);
      saveDatabase();
      hideModal("view-doc-modal");
      renderDocuments();
    }
  };

  const editBtn = document.getElementById("edit-doc-btn");
  editBtn.onclick = () => {
    hideModal("view-doc-modal");
    openEditDocModal(doc.id);
  };

  showModal("view-doc-modal");
}

function openEditDocModal(docId) {
  const doc = db.documents.find(d => d.id === docId);
  if (!doc) return;

  document.getElementById("doc-modal-title").textContent = `Edit Details: ${doc.title}`;
  document.getElementById("edit-doc-id").value = doc.id;
  document.getElementById("doc-type").value = doc.type;
  document.getElementById("doc-title").value = doc.title;
  document.getElementById("doc-number").value = doc.number;
  document.getElementById("doc-name").value = doc.nameOnDoc;

  // Restore image preview if available
  const imgPreviewContainer = document.getElementById("image-preview-container");
  const imgPreview = document.getElementById("image-preview");
  const uploadZone = document.getElementById("upload-zone");

  if (doc.image) {
    uploadedDocImageBase64 = doc.image;
    imgPreview.src = doc.image;
    imgPreviewContainer.classList.remove("hidden");
    uploadZone.classList.add("hidden");
  } else {
    uploadedDocImageBase64 = null;
    imgPreviewContainer.classList.add("hidden");
    uploadZone.classList.remove("hidden");
  }

  showModal("doc-modal");
}

// Handle Drag & Drop / File Select for base64 image upload
function handleFileSelect(file) {
  if (!file || !file.type.match('image.*')) {
    alert("Please select a valid image file (PNG, JPG, WEBP).");
    return;
  }

  // Cap size check - browser localStorage fits approx 5MB, so base64 size should be limited
  if (file.size > 1.5 * 1024 * 1024) {
    alert("Image is too large! Please upload files under 1.5MB to save securely in the local database.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    uploadedDocImageBase64 = event.target.result;
    
    // Update preview UI
    const imgPreview = document.getElementById("image-preview");
    const imgPreviewContainer = document.getElementById("image-preview-container");
    const uploadZone = document.getElementById("upload-zone");

    imgPreview.src = uploadedDocImageBase64;
    imgPreviewContainer.classList.remove("hidden");
    uploadZone.classList.add("hidden");
  };
  reader.readAsDataURL(file);
}

function removeDocImage() {
  uploadedDocImageBase64 = null;
  document.getElementById("image-preview-container").classList.add("hidden");
  document.getElementById("upload-zone").classList.remove("hidden");
  document.getElementById("doc-image-input").value = "";
}

// ==========================================================================
// SECURITY & PROFILE EDITOR SETTINGS
// ==========================================================================

function switchSettingsTab(tabName) {
  const profileTabBtn = document.getElementById("tab-profile-btn");
  const passwordTabBtn = document.getElementById("tab-password-btn");

  const profileForm = document.getElementById("profile-settings-form");
  const passwordForm = document.getElementById("settings-form");

  // Deactivate all tabs and hide all panels
  [profileTabBtn, passwordTabBtn].forEach(btn => {
    if (btn) {
      btn.classList.remove("active");
      btn.style.borderBottomColor = "transparent";
      btn.style.color = "var(--text-muted)";
    }
  });

  [profileForm, passwordForm].forEach(panel => {
    if (panel) panel.classList.add("hidden");
  });

  // Activate selected tab and show its panel
  if (tabName === "profile") {
    if (profileForm) profileForm.classList.remove("hidden");
    if (profileTabBtn) {
      profileTabBtn.classList.add("active");
      profileTabBtn.style.borderBottomColor = "var(--primary-light)";
      profileTabBtn.style.color = "var(--primary-light)";
    }
  } else if (tabName === "password") {
    if (passwordForm) passwordForm.classList.remove("hidden");
    if (passwordTabBtn) {
      passwordTabBtn.classList.add("active");
      passwordTabBtn.style.borderBottomColor = "var(--primary-light)";
      passwordTabBtn.style.color = "var(--primary-light)";
    }
  }
}

function openSettingsModal() {
  if (!currentMember) return;

  // Reset tab views to Edit Profile
  switchSettingsTab("profile");

  // Reset forms & clear messages
  const profileForm = document.getElementById("profile-settings-form");
  const passwordForm = document.getElementById("settings-form");
  if (profileForm) profileForm.reset();
  if (passwordForm) passwordForm.reset();
  
  const profileErr = document.getElementById("profile-settings-error-msg");
  const profileSucc = document.getElementById("profile-settings-success-msg");
  const passErr = document.getElementById("settings-error-msg");
  const passSucc = document.getElementById("settings-success-msg");

  if (profileErr) profileErr.classList.add("hidden");
  if (profileSucc) profileSucc.classList.add("hidden");
  if (passErr) passErr.classList.add("hidden");
  if (passSucc) passSucc.classList.add("hidden");

  // Initialize Profile form values
  const nameInput = document.getElementById("profile-edit-name");
  const ageInput = document.getElementById("profile-edit-age");
  const usernameInput = document.getElementById("profile-edit-username");
  const avatarPreview = document.getElementById("profile-edit-avatar-preview");

  if (nameInput) nameInput.value = currentMember.name || "";
  if (ageInput) ageInput.value = currentMember.age || "";
  if (usernameInput) usernameInput.value = currentMember.username || "";

  // Set avatar preview
  uploadedEditProfileAvatarBase64 = null;
  if (avatarPreview) avatarPreview.src = getMemberAvatarUrl(currentMember);

  renderToonAvatarGrid();

  showModal("settings-modal");
}

function handleProfileAvatarChange(event) {
  if (event.target.files && event.target.files[0]) {
    const file = event.target.files[0];
    if (file.size > 3 * 1024 * 1024) {
      alert("Photo is too large! Please upload files under 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      // Open the photo editor instead of directly applying
      openPhotoEditor(e.target.result, function(croppedBase64) {
        uploadedEditProfileAvatarBase64 = croppedBase64;
        document.getElementById("profile-edit-avatar-preview").src = croppedBase64;
        
        // Clear selection highlight in toon avatar grid
        const grid = document.getElementById("toon-avatar-grid");
        if (grid) {
          grid.querySelectorAll(".toon-avatar-item").forEach(function (el) {
            el.classList.remove("selected");
          });
        }
      });
    };
    reader.readAsDataURL(file);
  }
}

function processProfileUpdate(event) {
  event.preventDefault();

  const name = document.getElementById("profile-edit-name").value.trim();
  const age = parseInt(document.getElementById("profile-edit-age").value);
  const username = document.getElementById("profile-edit-username").value.trim().toLowerCase();

  const errorMsg = document.getElementById("profile-settings-error-msg");
  const successMsg = document.getElementById("profile-settings-success-msg");

  errorMsg.classList.add("hidden");
  successMsg.classList.add("hidden");

  // Check username uniqueness (excluding current user)
  const usernameExists = db.members.some(m => m.id !== currentMember.id && m.username.toLowerCase() === username);
  if (usernameExists) {
    errorMsg.textContent = "Username already taken by another family member!";
    errorMsg.classList.remove("hidden");
    return;
  }

  // Update in DB
  const index = db.members.findIndex(m => m.id === currentMember.id);
  if (index !== -1) {
    db.members[index].name = name;
    db.members[index].age = age;
    db.members[index].username = username;

    if (uploadedEditProfileAvatarBase64) {
      db.members[index].avatar = uploadedEditProfileAvatarBase64;
    }

    // Update active session
    currentMember = db.members[index];
    
    saveDatabase();
    hideModal("settings-modal");
    showLoader("Updating Profile", "Saving details and processing avatar...", 1100, () => {
      enterDashboard();
    });
  }
}

function processPasswordUpdate(event) {
  event.preventDefault();

  const oldPass = document.getElementById("old-password").value;
  const newPass = document.getElementById("new-password").value;
  const confPass = document.getElementById("confirm-password").value;

  const errorMsg = document.getElementById("settings-error-msg");
  const successMsg = document.getElementById("settings-success-msg");

  errorMsg.classList.add("hidden");
  successMsg.classList.add("hidden");

  if (!currentFamily) return;

  // Validate old password against current family password
  if (currentFamily.password !== oldPass) {
    errorMsg.textContent = "Old family password doesn't match! Authentication failed.";
    errorMsg.classList.remove("hidden");
    return;
  }

  // Validate new password strength or length
  if (newPass.length < 4) {
    errorMsg.textContent = "New password must be at least 4 characters long.";
    errorMsg.classList.remove("hidden");
    return;
  }

  // Verify matching inputs
  if (newPass !== confPass) {
    errorMsg.textContent = "Confirm password does not match new password.";
    errorMsg.classList.remove("hidden");
    return;
  }

  // Update family password
  currentFamily.password = newPass;
  saveDatabase();
  
  successMsg.classList.remove("hidden");
  document.getElementById("settings-form").reset();
  
  // Auto close settings modal after short delay
  setTimeout(() => {
    hideModal("settings-modal");
  }, 1500);
}

// ==========================================================================
// BACKUP & CODE SYNC OPERATIONS
// ==========================================================================

function generateSeedCodeSnippet() {
  const membersClean = db.members.map(m => ({
    id: m.id,
    name: m.name,
    age: m.age,
    username: m.username,
    password: m.password,
    avatar: m.avatar
  }));
  
  const documentsClean = db.documents.map(d => ({
    id: d.id,
    memberId: d.memberId,
    type: d.type,
    title: d.title,
    number: d.number,
    nameOnDoc: d.nameOnDoc,
    category: d.category,
    image: d.image
  }));

  return `const SEED_MEMBERS = ${JSON.stringify(membersClean, null, 2)};\n\nconst SEED_DOCUMENTS = ${JSON.stringify(documentsClean, null, 2)};`;
}

async function downloadUpdatedAppJs() {
  try {
    const response = await fetch("app.js");
    if (!response.ok) throw new Error("Failed to fetch app.js");
    let content = await response.text();

    const membersClean = db.members.map(m => ({
      id: m.id,
      name: m.name,
      age: m.age,
      username: m.username,
      password: m.password,
      avatar: m.avatar
    }));
    
    const documentsClean = db.documents.map(d => ({
      id: d.id,
      memberId: d.memberId,
      type: d.type,
      title: d.title,
      number: d.number,
      nameOnDoc: d.nameOnDoc,
      category: d.category,
      image: d.image
    }));

    const membersStr = `const SEED_MEMBERS = ${JSON.stringify(membersClean, null, 2)};`;
    const documentsStr = `const SEED_DOCUMENTS = ${JSON.stringify(documentsClean, null, 2)};`;

    // Replace in file content
    content = content.replace(/const\s+SEED_MEMBERS\s*=\s*\[[\s\S]*?\];/, membersStr);
    content = content.replace(/const\s+SEED_DOCUMENTS\s*=\s*\[[\s\S]*?\];/, documentsStr);

    const blob = new Blob([content], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "app.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error updating app.js:", error);
    alert("Could not generate updated app.js. Please copy the Seed Code Snippet manually instead.");
  }
}

function handleCopySeedCode() {
  const code = generateSeedCodeSnippet();
  navigator.clipboard.writeText(code).then(() => {
    const successMsg = document.getElementById("copy-success-msg");
    if (successMsg) {
      successMsg.classList.remove("hidden");
      setTimeout(() => {
        successMsg.classList.add("hidden");
      }, 2000);
    }
  }).catch(err => {
    console.error("Failed to copy code: ", err);
    alert("Failed to copy code automatically. Please manually select and copy the code snippet.");
  });
}

function handleExportDatabase() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
  const a = document.createElement('a');
  a.setAttribute("href", dataStr);
  a.setAttribute("download", "docusaver_backup.json");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function handleImportDatabase(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusMsg = document.getElementById("import-status-msg");
  if (statusMsg) {
    statusMsg.style.color = "var(--text-color)";
    statusMsg.textContent = "Processing backup file...";
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedDb = JSON.parse(e.target.result);
      
      if (!importedDb.members || !importedDb.documents || !Array.isArray(importedDb.members) || !Array.isArray(importedDb.documents)) {
        throw new Error("Invalid database backup format. Missing 'members' or 'documents' arrays.");
      }

      if (confirm("Importing this backup will overwrite all current members and documents in this browser. Are you sure you want to proceed?")) {
        db = importedDb;
        saveDatabase();
        
        if (statusMsg) {
          statusMsg.style.color = "var(--success-color)";
          statusMsg.textContent = "Backup imported successfully! Reloading vault...";
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        if (statusMsg) statusMsg.textContent = "";
      }
    } catch (err) {
      console.error("Backup import failed:", err);
      if (statusMsg) {
        statusMsg.style.color = "#f44336";
        statusMsg.textContent = "Failed to import backup: " + err.message;
      }
    }
  };
  reader.readAsText(file);
}

// ==========================================================================
// SECURE CLOUD SYNC OPERATIONS (AES-GCM 256-bit + kvdb.io)
// ==========================================================================

const KVDB_BASE = "https://kvdb.io";

// Crypto helpers using standard browser SubtleCrypto (PBKDF2 + AES-GCM 256)
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptData(plaintext, password) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    enc.encode(plaintext)
  );

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode.apply(null, combined));
}

async function decryptData(ciphertextBase64, password) {
  const dec = new TextDecoder();
  const combined = new Uint8Array(
    atob(ciphertextBase64)
      .split("")
      .map(char => char.charCodeAt(0))
  );

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);

  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );
  return dec.decode(decrypted);
}

// Strip base64 image data from db before syncing to keep payload under 16KB
function getStrippedDbForSync(database) {
  const stripped = JSON.parse(JSON.stringify(database));
  // Remove large base64 avatar images and document images to stay within kvdb 16KB limit
  if (stripped.members) {
    stripped.members.forEach(m => {
      if (m.avatar && m.avatar.startsWith("data:")) {
        m.avatar = ""; // remove custom photo avatar (keep toon avatar keys like "toon_0")
      }
    });
  }
  if (stripped.documents) {
    stripped.documents.forEach(doc => {
      if (doc.fileData && doc.fileData.length > 500) {
        doc.fileData = ""; // strip large file data
        doc.fileName = doc.fileName ? `[synced] ${doc.fileName}` : "[synced]";
      }
    });
  }
  return stripped;
}

// Fetch encrypted database from cloud and decrypt
async function fetchCloudDatabase(bucketId, passphrase) {
  const response = await fetch(`${KVDB_BASE}/${bucketId}/vault`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("No sync data found for this Sync ID. Verify the ID or create a new sync.");
    }
    throw new Error("Server error (status " + response.status + ")");
  }
  const ciphertext = await response.text();
  if (!ciphertext || ciphertext.trim() === "") {
    throw new Error("Empty vault — no data synced yet.");
  }
  const plaintext = await decryptData(ciphertext.trim(), passphrase);
  return JSON.parse(plaintext);
}

// Encrypt and push current database to cloud (stripped to fit 16KB limit)
async function pushCloudDatabase(bucketId, passphrase) {
  const strippedDb = getStrippedDbForSync(db);
  const plaintext = JSON.stringify(strippedDb);
  const ciphertext = await encryptData(plaintext, passphrase);
  
  // kvdb.io values must be <= 16KB. Check before pushing.
  if (ciphertext.length > 16000) {
    console.warn("Cloud sync payload is", ciphertext.length, "bytes — may exceed kvdb limit. Metadata-only sync.");
  }
  
  const response = await fetch(`${KVDB_BASE}/${bucketId}/vault`, {
    method: "POST",
    body: ciphertext
  });
  if (!response.ok) {
    throw new Error("Cloud push failed (status " + response.status + ")");
  }
}

// Create a new kvdb.io bucket dynamically
async function createKvdbBucket() {
  const response = await fetch(KVDB_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "email=docusaver-sync@example.com"
  });
  if (!response.ok) {
    throw new Error("Failed to create cloud bucket (status " + response.status + ")");
  }
  const bucketId = await response.text();
  return bucketId.trim();
}

// Render the Cloud Sync panel view inside Settings depending on state
function renderCloudSyncUI() {
  const syncId = localStorage.getItem("docusaver_sync_id");
  const setupSection = document.getElementById("sync-setup-section");
  const activeSection = document.getElementById("sync-active-section");
  const setupModal = document.getElementById("sync-setup-modal-inner");
  const errorEl = document.getElementById("sync-setup-error");

  if (errorEl) errorEl.classList.add("hidden");
  if (setupModal) setupModal.classList.add("hidden");

  if (syncId) {
    if (setupSection) setupSection.classList.add("hidden");
    if (activeSection) activeSection.classList.remove("hidden");
    const displayId = document.getElementById("sync-display-id");
    if (displayId) displayId.textContent = syncId;
  } else {
    if (setupSection) setupSection.classList.remove("hidden");
    if (activeSection) activeSection.classList.add("hidden");
  }
}

// Setup a brand new cloud sync vault
async function handleCreateNewSync() {
  const errorEl = document.getElementById("sync-setup-error");
  const passphraseInput = document.getElementById("sync-setup-passphrase");
  const passphrase = passphraseInput.value;
  if (!passphrase || passphrase.length < 6) {
    errorEl.textContent = "Passphrase must be at least 6 characters long.";
    errorEl.classList.remove("hidden");
    return;
  }

  showLoader("Enabling Cloud Sync", "Creating encrypted cloud vault...", 2000, async () => {
    try {
      // Create a new kvdb.io bucket
      const bucketId = await createKvdbBucket();
      
      // Push current db state to cloud
      await pushCloudDatabase(bucketId, passphrase);
      
      // Save details locally
      localStorage.setItem("docusaver_sync_id", bucketId);
      localStorage.setItem("docusaver_sync_passphrase", passphrase);
      
      // Reset inputs & render
      passphraseInput.value = "";
      renderCloudSyncUI();
      alert(`Success! Cloud sync enabled.\n\nSync ID: ${bucketId}\n\nWrite this ID and your passphrase down. You need them to sync other devices.\n\nNote: Large images/files are stored locally only — text data and member info sync across devices.`);
    } catch (err) {
      console.error(err);
      errorEl.textContent = "Failed to enable sync: " + err.message;
      errorEl.classList.remove("hidden");
    }
  });
}

// Join an existing cloud sync vault
async function handleJoinExistingSync() {
  const errorEl = document.getElementById("sync-setup-error");
  const syncIdInput = document.getElementById("sync-setup-id");
  const passphraseInput = document.getElementById("sync-setup-passphrase");
  
  const syncId = syncIdInput.value.trim();
  const passphrase = passphraseInput.value;

  if (!syncId || !passphrase) {
    errorEl.textContent = "Please fill in both Sync ID and Passphrase.";
    errorEl.classList.remove("hidden");
    return;
  }

  showLoader("Connecting Sync", "Fetching and decrypting cloud vault...", 2000, async () => {
    try {
      // Try to fetch and decrypt
      const cloudDb = await fetchCloudDatabase(syncId, passphrase);
      
      // Save credentials and database locally
      localStorage.setItem("docusaver_sync_id", syncId);
      localStorage.setItem("docusaver_sync_passphrase", passphrase);
      db = cloudDb;
      saveDatabase(); // saves local copy

      // Clear inputs
      syncIdInput.value = "";
      passphraseInput.value = "";
      
      // Success: reload to apply the new db state
      alert("Successfully connected to cloud sync! Reloading vault...");
      window.location.reload();
    } catch (err) {
      console.error(err);
      errorEl.textContent = "Failed to connect: " + (err.message.includes("decrypt") ? "Incorrect passphrase." : err.message);
      errorEl.classList.remove("hidden");
    }
  });
}

// Disable cloud sync locally
function handleDisableSync() {
  if (confirm("Are you sure you want to disable Cloud Sync? Your data will remain on this browser, but it will no longer sync with other devices.")) {
    localStorage.removeItem("docusaver_sync_id");
    localStorage.removeItem("docusaver_sync_passphrase");
    renderCloudSyncUI();
    alert("Cloud Sync disabled.");
  }
}

// ==========================================================================
// WINDOW EVENT LISTENERS & MODAL BINDINGS
// ==========================================================================

// Global helper functions to display modal overlay
function showModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  // 0. Bootstrap Firebase (seed defaults if needed, then connect)
  if (!getFirebaseConfig()) {
    saveFirebaseConfig(DEFAULT_FIREBASE_CONFIG);
  }
  if (!getImgbbKey()) {
    localStorage.setItem(IMGBB_KEY_STORAGE, DEFAULT_IMGBB_KEY);
  }
  initFirebase();

  // 1. Load Families
  loadFamilies();

  // 2. Restore Family & Member Session if active
  const savedFamilyId = localStorage.getItem(CURRENT_FAMILY_KEY);
  if (savedFamilyId) {
    const fam = families.find(f => f.id === savedFamilyId);
    if (fam) {
      currentFamily = fam;
      initDatabase();
      showFamilyHome();

      // Pull latest data from Firestore (non-blocking — re-render if data arrives)
      if (_firestore) {
        pullDbFromFirestore().then(pulled => {
          if (pulled) {
            console.log("[Firestore] Session restored from cloud.");
            renderMembers();
            renderDocuments();
          }
        }).catch(err => console.warn("[Firestore] Session pull failed:", err.message));
      }

      const savedMemberId = localStorage.getItem(CURRENT_MEMBER_KEY);
      if (savedMemberId) {
        const member = db.members.find(m => m.id === savedMemberId);
        if (member) {
          currentMember = member;
          enterDashboard();
        }
      }
    } else {
      showLanding();
    }
  } else {
    showLanding();
  }

  // 2b. Landing Page Event Listeners
  document.getElementById("family-login-form").addEventListener("submit", processFamilyLogin);
  document.getElementById("family-signup-form").addEventListener("submit", processFamilySignup);
  const famLogoutBtn = document.getElementById("family-logout-btn");
  if (famLogoutBtn) famLogoutBtn.addEventListener("click", processFamilyLogout);

  // Drawer menu toggle bindings
  const hamburgerBtn = document.getElementById("hamburger-btn");
  if (hamburgerBtn) hamburgerBtn.addEventListener("click", openDrawer);

  const closeDrawerBtn = document.getElementById("close-drawer-btn");
  if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);

  const drawerOverlay = document.getElementById("drawer-overlay");
  if (drawerOverlay) {
    drawerOverlay.addEventListener("click", (e) => {
      if (e.target === drawerOverlay) closeDrawer();
    });
  }

  // Drawer menu items listeners
  const menuHomeBtn = document.getElementById("drawer-btn-home");
  if (menuHomeBtn) {
    menuHomeBtn.addEventListener("click", () => {
      closeDrawer();
      if (currentMember) processLogout();
      else showFamilyHome();
    });
  }

  const menuAddDocBtn = document.getElementById("drawer-btn-add-doc");
  if (menuAddDocBtn) {
    menuAddDocBtn.addEventListener("click", () => {
      closeDrawer();
      openAddDocModal();
    });
  }

  const menuAddMemberBtn = document.getElementById("drawer-btn-add-member");
  if (menuAddMemberBtn) {
    menuAddMemberBtn.addEventListener("click", () => {
      closeDrawer();
      document.getElementById("register-form").reset();
      document.getElementById("reg-error-msg").classList.add("hidden");
      uploadedCustomAvatarBase64 = null;
      const preview = document.getElementById("reg-avatar-preview");
      if (preview) preview.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nI0UzRjJGRCcvPjxjaXJjbGUgY3g9JzUwJyBjeT0nNDAnIHI9JzIwJyBmaWxsPScjMUU4OEU1Jy8+PHBhdGggZD0nTTIwIDg1IEMyMCA2NSwgODAgNjUsIDgwIDg1JyBmaWxsPScjMUU4OEU1Jy8+PC9zdmc+";
      setTimeout(renderRegToonAvatarGrid, 50);
      showModal("register-modal");
    });
  }

  const menuSettingsBtn = document.getElementById("drawer-btn-settings");
  if (menuSettingsBtn) {
    menuSettingsBtn.addEventListener("click", () => {
      closeDrawer();
      openSettingsModal();
    });
  }

  const menuExitVaultBtn = document.getElementById("drawer-btn-exit-vault");
  if (menuExitVaultBtn) {
    menuExitVaultBtn.addEventListener("click", () => {
      closeDrawer();
      processLogout();
    });
  }

  const menuSwitchFamBtn = document.getElementById("drawer-btn-switch-family");
  if (menuSwitchFamBtn) {
    menuSwitchFamBtn.addEventListener("click", () => {
      closeDrawer();
      processFamilyLogout();
    });
  }

  const menuInstallBtn = document.getElementById("drawer-btn-install");
  if (menuInstallBtn) {
    menuInstallBtn.addEventListener("click", () => {
      closeDrawer();
      triggerInstallPrompt();
    });
  }

  // Logo click → reload page
  const logoBtn = document.getElementById("logo-reload-btn");
  if (logoBtn) {
    logoBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }

  document.getElementById("show-signup-btn").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("landing-login-panel").classList.add("hidden");
    document.getElementById("landing-signup-panel").classList.remove("hidden");
    document.getElementById("fs-error").classList.add("hidden");
  });

  document.getElementById("show-login-btn").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("landing-signup-panel").classList.add("hidden");
    document.getElementById("landing-login-panel").classList.remove("hidden");
    document.getElementById("fl-error").classList.add("hidden");
  });

  // 2c. Fetch cloud database if sync is active
  const syncId = localStorage.getItem("docusaver_sync_id");
  const passphrase = localStorage.getItem("docusaver_sync_passphrase");
  if (syncId && passphrase && currentFamily) {
    showLoader("Syncing Vault", "Fetching and decrypting cloud database...", 1200, async () => {
      try {
        const cloudDb = await fetchCloudDatabase(syncId, passphrase);
        db = cloudDb;
        saveDatabase();
        renderMembers();
      } catch (err) {
        console.warn("Could not sync with cloud, running in offline mode:", err);
      }
    });
  }

  // 3. Register button bindings
  document.getElementById("open-register-btn").addEventListener("click", () => {
    document.getElementById("register-form").reset();
    document.getElementById("reg-error-msg").classList.add("hidden");
    uploadedCustomAvatarBase64 = null;
    document.getElementById("reg-avatar-preview").src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nI0UzRjJGRCcvPjxjaXJjbGUgY3g9JzUwJyBjeT0nNDAnIHI9JzIwJyBmaWxsPScjMUU4OEU1Jy8+PHBhdGggZD0nTTIwIDg1IEMyMCA2NSwgODAgNjUsIDgwIDg1JyBmaWxsPScjMUU4OEU1Jy8+PC9zdmc+";
    setTimeout(renderRegToonAvatarGrid, 50);
    showModal("register-modal");
  });

  // 4. Modal closing bindings (X icon & Cancel buttons)
  document.querySelectorAll(".close-modal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-modal");
      hideModal(modalId);
    });
  });

  // Close modal when clicking outside content area
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        hideModal(overlay.id);
      }
    });
  });

  // 5. Setup Form Submit Event Handlers
  document.getElementById("login-form").addEventListener("submit", processLogin);
  document.getElementById("register-form").addEventListener("submit", processRegistration);
  document.getElementById("doc-form").addEventListener("submit", processDocSubmit);
  document.getElementById("settings-form").addEventListener("submit", processPasswordUpdate);
  document.getElementById("profile-settings-form").addEventListener("submit", processProfileUpdate);

  document.getElementById("tab-profile-btn").addEventListener("click", () => switchSettingsTab("profile"));
  document.getElementById("tab-password-btn").addEventListener("click", () => switchSettingsTab("password"));
  document.getElementById("profile-edit-avatar-file").addEventListener("change", handleProfileAvatarChange);

  // Backup & Code Sync event bindings (if elements present)
  const downloadBtn = document.getElementById("download-app-js-btn");
  if (downloadBtn) downloadBtn.addEventListener("click", downloadUpdatedAppJs);
  const copySeedBtn = document.getElementById("copy-seed-code-btn");
  if (copySeedBtn) copySeedBtn.addEventListener("click", handleCopySeedCode);
  const exportBtn = document.getElementById("export-db-json-btn");
  if (exportBtn) exportBtn.addEventListener("click", handleExportDatabase);
  
  const triggerImportBtn = document.getElementById("trigger-import-db-btn");
  const importFileInput = document.getElementById("import-db-file");
  if (triggerImportBtn && importFileInput) {
    triggerImportBtn.addEventListener("click", () => importFileInput.click());
    importFileInput.addEventListener("change", handleImportDatabase);
  }

  // Cloud Sync event bindings
  const startNewSyncBtn = document.getElementById("start-new-sync-btn");
  if (startNewSyncBtn) {
    startNewSyncBtn.addEventListener("click", () => {
      document.getElementById("sync-setup-title").textContent = "Setup Cloud Sync";
      document.getElementById("sync-id-input-group").style.display = "none";
      document.getElementById("sync-setup-modal-inner").classList.remove("hidden");
      document.getElementById("confirm-sync-btn").dataset.syncMode = "create";
    });
  }

  const joinSyncBtn = document.getElementById("join-sync-btn");
  if (joinSyncBtn) {
    joinSyncBtn.addEventListener("click", () => {
      document.getElementById("sync-setup-title").textContent = "Connect Existing Sync";
      document.getElementById("sync-id-input-group").style.display = "block";
      document.getElementById("sync-setup-modal-inner").classList.remove("hidden");
      document.getElementById("confirm-sync-btn").dataset.syncMode = "join";
    });
  }

  const cancelSyncSetupBtn = document.getElementById("cancel-sync-setup-btn");
  if (cancelSyncSetupBtn) {
    cancelSyncSetupBtn.addEventListener("click", () => {
      document.getElementById("sync-setup-modal-inner").classList.add("hidden");
      document.getElementById("sync-setup-error").classList.add("hidden");
    });
  }

  const confirmSyncBtn = document.getElementById("confirm-sync-btn");
  if (confirmSyncBtn) {
    confirmSyncBtn.addEventListener("click", (e) => {
      const mode = e.target.dataset.syncMode;
      if (mode === "create") {
        handleCreateNewSync();
      } else {
        handleJoinExistingSync();
      }
    });
  }

  const disableSyncBtn = document.getElementById("disable-sync-btn");
  if (disableSyncBtn) {
    disableSyncBtn.addEventListener("click", handleDisableSync);
  }

  const copySyncCredsBtn = document.getElementById("copy-sync-creds-btn");
  if (copySyncCredsBtn) {
    copySyncCredsBtn.addEventListener("click", () => {
      const syncId = localStorage.getItem("docusaver_sync_id");
      const passphrase = localStorage.getItem("docusaver_sync_passphrase");
      navigator.clipboard.writeText(`Sync ID: ${syncId}\nPassphrase: ${passphrase}`).then(() => {
        alert("Sync credentials copied to clipboard! Share this with other devices.");
      }).catch(() => {
        alert(`Sync ID: ${syncId}\nPassphrase: ${passphrase}`);
      });
    });
  }

  // Firebase settings form submit
  const firebaseSettingsForm = document.getElementById("firebase-settings-panel");
  if (firebaseSettingsForm) {
    firebaseSettingsForm.addEventListener("submit", handleFirebaseSettingsSave);
  }

  const disconnectFirebaseBtn = document.getElementById("disconnect-firebase-btn");
  if (disconnectFirebaseBtn) {
    disconnectFirebaseBtn.addEventListener("click", handleFirebaseDisconnect);
  }

  // 6. Dashboard specific controls
  document.getElementById("logout-btn").addEventListener("click", processLogout);
  document.getElementById("dash-back-btn").addEventListener("click", processLogout);
  document.getElementById("open-add-doc-btn").addEventListener("click", openAddDocModal);
  document.getElementById("open-settings-btn").addEventListener("click", openSettingsModal);

  // 7. Auto populate title when document type changes
  document.getElementById("doc-type").addEventListener("change", populateAddDocTitle);

  // 8. File Upload Zone bindings
  const uploadZone = document.getElementById("upload-zone");
  const fileInput = document.getElementById("doc-image-input");

  uploadZone.addEventListener("click", () => fileInput.click());
  
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  });

  // Drag and drop events
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = "var(--primary-light)";
      uploadZone.style.backgroundColor = "rgba(30, 98, 166, 0.05)";
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = "var(--border-color)";
      uploadZone.style.backgroundColor = "#f7fafc";
    }, false);
  });

  uploadZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  });

  document.getElementById("remove-img-btn").addEventListener("click", removeDocImage);

  // Password visibility toggle buttons (Eye / Eye-Off icons)
  document.querySelectorAll(".toggle-password-btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      const wrap = this.closest(".password-wrap");
      if (!wrap) return;
      const input = wrap.querySelector("input");
      if (!input) return;

      const eyeIcon = this.querySelector(".eye-icon");
      const eyeOffIcon = this.querySelector(".eye-off-icon");

      if (input.type === "password") {
        input.type = "text";
        if (eyeIcon) eyeIcon.classList.add("hidden");
        if (eyeOffIcon) eyeOffIcon.classList.remove("hidden");
      } else {
        input.type = "password";
        if (eyeIcon) eyeIcon.classList.remove("hidden");
        if (eyeOffIcon) eyeOffIcon.classList.add("hidden");
      }
    });
  });

  // 9. Document Search & Filter tabs binding
  const searchInput = document.getElementById("doc-search");
  searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value;
    renderDocuments();
  });

  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      // Toggle active states
      document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      currentFilterCategory = tab.getAttribute("data-category");
      renderDocuments();
    });
  });

  // 10. Custom Avatar Selection and Upload bindings
  const regAvatarFile = document.getElementById("reg-avatar-file");
  if (regAvatarFile) {
    regAvatarFile.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 3 * 1024 * 1024) {
          alert("Photo is too large! Please upload files under 3MB.");
          regAvatarFile.value = "";
          return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
          openPhotoEditor(event.target.result, function(croppedBase64) {
            uploadedCustomAvatarBase64 = croppedBase64;
            document.getElementById("reg-avatar-preview").src = croppedBase64;
            
            // Clear selection highlight in registration toon avatar grid
            const grid = document.getElementById("reg-toon-avatar-grid");
            if (grid) {
              grid.querySelectorAll(".toon-avatar-item").forEach(function (el) {
                el.classList.remove("selected");
              });
            }
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 11. PWA Service Worker & Enhanced Install Prompt System
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.warn('Service worker registration failed:', err);
      });
    });
  }

  let deferredPrompt = null;
  const pwaBanner = document.getElementById('pwa-install-banner');
  const pwaBtnInstall = document.getElementById('pwa-btn-install');
  const pwaBtnClose = document.getElementById('pwa-btn-close');
  const headerInstallBtn = document.getElementById('header-install-btn');
  const pwaModalDirectBtn = document.getElementById('pwa-modal-direct-btn');

  // Check if running as installed standalone PWA
  function isPWAInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  }

  // Update UI based on PWA install status
  function initPWAUI() {
    if (isPWAInstalled()) {
      // App is running as installed PWA — hide everything install-related
      if (pwaBanner) pwaBanner.classList.add('hidden');
      if (headerInstallBtn) {
        headerInstallBtn.classList.add('hidden');
        headerInstallBtn.style.display = 'none';
      }
      return;
    }

    // Not installed — show install button
    if (headerInstallBtn) {
      headerInstallBtn.classList.remove('hidden');
      headerInstallBtn.style.display = '';
    }

    // Show floating banner after 800ms if not dismissed this session
    if (pwaBanner && !sessionStorage.getItem('pwa_banner_dismissed')) {
      setTimeout(() => {
        if (!isPWAInstalled()) {
          pwaBanner.classList.remove('hidden');
        }
      }, 800);
    }
  }

  // Run on page load to set initial state
  initPWAUI();

  // Listen for native beforeinstallprompt (fires when browser decides app is installable)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('DigiFamily Locker: beforeinstallprompt ready');
    // Ensure button is visible now that we have the prompt
    if (headerInstallBtn) {
      headerInstallBtn.classList.remove('hidden');
      headerInstallBtn.style.display = '';
    }
  });

  // Handle app installed event — hide button immediately
  window.addEventListener('appinstalled', () => {
    console.log('DigiFamily Locker: App installed successfully');
    deferredPrompt = null;
    if (pwaBanner) pwaBanner.classList.add('hidden');
    if (headerInstallBtn) {
      headerInstallBtn.classList.add('hidden');
      headerInstallBtn.style.display = 'none';
    }
    initPWAUI();
  });

  // Populate & open guide modal
  function showPWAGuideModal() {
    const guideContent = document.getElementById('pwa-guide-content');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (pwaModalDirectBtn) {
      if (deferredPrompt) {
        pwaModalDirectBtn.classList.remove('hidden');
      } else {
        pwaModalDirectBtn.classList.add('hidden');
      }
    }

    if (guideContent) {
      if (isIOS) {
        guideContent.innerHTML = `
          <div class="pwa-platform-tag">📱 iOS (Safari) Instructions</div>
          <div class="pwa-steps-container">
            <div class="pwa-step-item">
              <div class="pwa-step-number">1</div>
              <div class="pwa-step-text">
                Tap the <strong>Share button</strong>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin: 0 4px;"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                in the Safari bottom toolbar.
              </div>
            </div>
            <div class="pwa-step-item">
              <div class="pwa-step-number">2</div>
              <div class="pwa-step-text">
                Scroll down the share menu and select <strong>"Add to Home Screen"</strong>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin: 0 4px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>.
              </div>
            </div>
            <div class="pwa-step-item">
              <div class="pwa-step-number">3</div>
              <div class="pwa-step-text">
                Tap <strong>Add</strong> in the top right. <strong>DigiFamily Locker</strong> will be installed on your Home Screen!
              </div>
            </div>
          </div>
        `;
      } else {
        guideContent.innerHTML = `
          <div class="pwa-platform-tag">💻 / 📱 Android &amp; Desktop Instructions</div>
          <div class="pwa-steps-container">
            <div class="pwa-step-item">
              <div class="pwa-step-number">1</div>
              <div class="pwa-step-text">
                Click your browser menu <strong>( ⋮ or ⋯ )</strong> or look for the <strong>Install Icon 📥</strong> in the address bar.
              </div>
            </div>
            <div class="pwa-step-item">
              <div class="pwa-step-number">2</div>
              <div class="pwa-step-text">
                Select <strong>"Install DigiFamily Locker"</strong> or <strong>"Add to Home screen"</strong>.
              </div>
            </div>
            <div class="pwa-step-item">
              <div class="pwa-step-number">3</div>
              <div class="pwa-step-text">
                Confirm installation to launch DigiFamily Locker as a fast, secure, standalone application!
              </div>
            </div>
          </div>
        `;
      }
    }

    showModal('pwa-install-modal');
  }

  // Trigger Install Action
  async function triggerInstallPrompt() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA Prompt Outcome: ${outcome}`);
      if (outcome === 'accepted') {
        deferredPrompt = null;
        if (pwaBanner) pwaBanner.classList.add('hidden');
        hideModal('pwa-install-modal');
        initPWAUI();
      }
    } else {
      showPWAGuideModal();
    }
  }

  // Bind install buttons
  if (pwaBtnInstall) {
    pwaBtnInstall.addEventListener('click', () => {
      triggerInstallPrompt();
    });
  }

  if (headerInstallBtn) {
    headerInstallBtn.addEventListener('click', () => {
      triggerInstallPrompt();
    });
  }

  if (pwaModalDirectBtn) {
    pwaModalDirectBtn.addEventListener('click', () => {
      triggerInstallPrompt();
    });
  }

  if (pwaBtnClose) {
    pwaBtnClose.addEventListener('click', () => {
      if (pwaBanner) pwaBanner.classList.add('hidden');
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    });
  }

  // Run on page load
  initPWAUI();
});

// ==========================================================================
// PHOTO EDITOR ENGINE (Crop, Rotate, Zoom)
// ==========================================================================

const pe = {
  rotation: 0,     // degrees: 0, 90, 180, 270
  zoom: 1,         // 0.5 to 2.5
  panX: 0,         // Panning offset X
  panY: 0,         // Panning offset Y
  originalImage: null,
  callback: null,
  canvasW: 0, canvasH: 0,
  imgW: 0, imgH: 0,
  displayScale: 1,
  cropX: 0, cropY: 0, cropW: 0, cropH: 0,
  drag: null
};

function openPhotoEditor(base64, callback) {
  pe.rotation = 0;
  pe.zoom = 1;
  pe.panX = 0;
  pe.panY = 0;
  pe.callback = callback;
  pe.drag = null;
  pe.cropW = 0; // Force crop box re-init

  document.getElementById("zoom-slider").value = 100;
  document.getElementById("zoom-label").textContent = "100%";

  pe.originalImage = new Image();
  pe.originalImage.onload = function() {
    pe.imgW = this.naturalWidth;
    pe.imgH = this.naturalHeight;
    peRender();
    showModal("photo-editor-modal");
  };
  pe.originalImage.src = base64;
}

function peRender() {
  const canvas = document.getElementById("photo-editor-canvas");
  const ctx = canvas.getContext("2d");
  const wrapper = document.getElementById("photo-canvas-wrapper");

  const rotated = pe.rotation === 90 || pe.rotation === 270;
  const srcW = rotated ? pe.imgH : pe.imgW;
  const srcH = rotated ? pe.imgW : pe.imgH;

  // Fit to wrapper width (max ~460px)
  const maxW = Math.min(wrapper.clientWidth || 460, 460);
  const maxH = 320;
  const fitScale = Math.min(maxW / srcW, maxH / srcH, 1);
  pe.displayScale = fitScale * pe.zoom;

  // Canvas size remains fixed at the fit scale
  const canvasW = Math.round(srcW * fitScale);
  const canvasH = Math.round(srcH * fitScale);
  canvas.width = canvasW;
  canvas.height = canvasH;
  pe.canvasW = canvasW;
  pe.canvasH = canvasH;

  const container = document.getElementById("canvas-container");
  if (container) {
    container.style.width = canvasW + "px";
    container.style.height = canvasH + "px";
  }

  // Draw rotated + zoomed image centred on canvas, plus pan offset
  ctx.save();
  ctx.translate(canvasW / 2 + pe.panX, canvasH / 2 + pe.panY);
  ctx.rotate((pe.rotation * Math.PI) / 180);
  ctx.scale(fitScale * pe.zoom, fitScale * pe.zoom);
  ctx.drawImage(pe.originalImage, -pe.imgW / 2, -pe.imgH / 2, pe.imgW, pe.imgH);
  ctx.restore();

  // Init crop box to centered square on first render
  if (pe.cropW === 0) {
    const size = Math.min(canvasW, canvasH) - 32;
    pe.cropW = size;
    pe.cropH = size;
    pe.cropX = (canvasW - size) / 2;
    pe.cropY = (canvasH - size) / 2;
  }
  peClampCrop();
  peSyncCropBox();
}

function peSyncCropBox() {
  const box = document.getElementById("crop-box");
  box.style.left   = pe.cropX + "px";
  box.style.top    = pe.cropY + "px";
  box.style.width  = pe.cropW + "px";
  box.style.height = pe.cropH + "px";
}

function peClampCrop() {
  const minSize = 30;
  if (pe.cropW < minSize) pe.cropW = minSize;
  if (pe.cropH < minSize) pe.cropH = minSize;

  if (pe.cropX < 0) pe.cropX = 0;
  if (pe.cropY < 0) pe.cropY = 0;

  // Clamp right boundary properly without shifting cropX leftwards when expanding right
  if (pe.cropX + pe.cropW > pe.canvasW) {
    if (pe.drag && (pe.drag.type === "tr" || pe.drag.type === "br")) {
      pe.cropW = Math.max(minSize, pe.canvasW - pe.cropX);
    } else {
      pe.cropX = pe.canvasW - pe.cropW;
    }
  }

  // Clamp bottom boundary properly without shifting cropY upwards when expanding bottom
  if (pe.cropY + pe.cropH > pe.canvasH) {
    if (pe.drag && (pe.drag.type === "bl" || pe.drag.type === "br")) {
      pe.cropH = Math.max(minSize, pe.canvasH - pe.cropY);
    } else {
      pe.cropY = pe.canvasH - pe.cropH;
    }
  }
}

function peGetPointer(e) {
  const canvas = document.getElementById("photo-editor-canvas");
  const rect = canvas.getBoundingClientRect();
  const src = (e.touches && e.touches.length > 0) ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e);
  const scaleX = rect.width ? canvas.width / rect.width : 1;
  const scaleY = rect.height ? canvas.height / rect.height : 1;
  return { 
    x: (src.clientX - rect.left) * scaleX, 
    y: (src.clientY - rect.top) * scaleY 
  };
}

function peStartDrag(e) {
  e.preventDefault();
  const pt = peGetPointer(e);
  const handle = e.target.dataset.handle;
  const isCanvas = e.target.id === "photo-editor-canvas";
  
  pe.drag = {
    type: handle ? handle : (isCanvas ? "pan-image" : "move-crop"),
    startX: pt.x, startY: pt.y,
    startCropX: pe.cropX, startCropY: pe.cropY,
    startCropW: pe.cropW, startCropH: pe.cropH,
    startPanX: pe.panX, startPanY: pe.panY
  };
}

function peDoDrag(e) {
  if (!pe.drag) return;
  e.preventDefault();
  const pt = peGetPointer(e);
  const dx = pt.x - pe.drag.startX;
  const dy = pt.y - pe.drag.startY;
  const d = pe.drag;

  if (d.type === "pan-image") {
    pe.panX = d.startPanX + dx;
    pe.panY = d.startPanY + dy;
  } else if (d.type === "move-crop") {
    pe.cropX = d.startCropX + dx;
    pe.cropY = d.startCropY + dy;
  } else if (d.type === "tl") {
    pe.cropX = d.startCropX + dx;
    pe.cropY = d.startCropY + dy;
    pe.cropW = d.startCropW - dx;
    pe.cropH = d.startCropH - dy;
  } else if (d.type === "tr") {
    pe.cropY = d.startCropY + dy;
    pe.cropW = d.startCropW + dx;
    pe.cropH = d.startCropH - dy;
  } else if (d.type === "bl") {
    pe.cropX = d.startCropX + dx;
    pe.cropW = d.startCropW - dx;
    pe.cropH = d.startCropH + dy;
  } else if (d.type === "br") {
    pe.cropW = d.startCropW + dx;
    pe.cropH = d.startCropH + dy;
  }
  peClampCrop();
  peSyncCropBox();
  if (d.type === "pan-image") {
    peRender();
  }
}

function peEndDrag() { pe.drag = null; }

function peApply() {
  // Render final output at full original resolution with crop+rotation applied
  const out = document.createElement("canvas");
  const ctx = out.getContext("2d");

  // scale = how many original image pixels correspond to 1 canvas pixel
  const scale = 1 / pe.displayScale;

  const rotated = pe.rotation === 90 || pe.rotation === 270;
  const srcW = rotated ? pe.imgH : pe.imgW;
  const srcH = rotated ? pe.imgW : pe.imgH;

  // Canvas offset of image centre (always center of canvas)
  const cx = pe.canvasW / 2;
  const cy = pe.canvasH / 2;

  // Crop box centre in canvas coords
  const cropCx = pe.cropX + pe.cropW / 2;
  const cropCy = pe.cropY + pe.cropH / 2;

  // Offset from canvas centre in canvas coords
  const offX = cropCx - cx;
  const offY = cropCy - cy;

  // Convert offset to original image pixels
  const realOffX = offX / pe.displayScale;
  const realOffY = offY / pe.displayScale;

  // Output dimensions are crop size mapped to original resolution
  const outW = Math.round(pe.cropW * scale);
  const outH = Math.round(pe.cropH * scale);
  out.width  = outW;
  out.height = outH;

  ctx.save();
  ctx.translate(outW / 2, outH / 2);
  ctx.rotate((pe.rotation * Math.PI) / 180);

  // Rotate translation offset to align with raw image coordinates
  const angle = (pe.rotation * Math.PI) / 180;
  const cos = Math.cos(angle); 
  const sin = Math.sin(angle);
  const rotOffX = realOffX * cos + realOffY * sin;
  const rotOffY = -realOffX * sin + realOffY * cos;

  // Draw at full resolution (no fitScale or zoom applied inside drawImage coords)
  ctx.drawImage(
    pe.originalImage,
    -pe.imgW / 2 - rotOffX,
    -pe.imgH / 2 - rotOffY,
    pe.imgW,
    pe.imgH
  );
  ctx.restore();

  const resultBase64 = out.toDataURL("image/jpeg", 0.88);
  pe.callback && pe.callback(resultBase64);
  hideModal("photo-editor-modal");
  // Reset crop for next use
  pe.cropW = 0;
}

// Wire up photo editor events after DOM ready
document.addEventListener("DOMContentLoaded", function() {
  const cropBox = document.getElementById("crop-box");
  const canvas = document.getElementById("photo-editor-canvas");

  // Mouse events on crop box (move)
  cropBox.addEventListener("mousedown",  peStartDrag);
  document.addEventListener("mousemove", peDoDrag);
  document.addEventListener("mouseup",   peEndDrag);

  // Mouse events on canvas background (pan image)
  if (canvas) {
    canvas.addEventListener("mousedown", peStartDrag);
    canvas.addEventListener("touchstart", peStartDrag, { passive: false });
  }

  // Handle corners
  document.querySelectorAll(".crop-handle").forEach(function(h) {
    h.addEventListener("mousedown",  peStartDrag);
    h.addEventListener("touchstart", peStartDrag, { passive: false });
  });

  // Touch events on crop box
  cropBox.addEventListener("touchstart", peStartDrag, { passive: false });
  document.addEventListener("touchmove",  peDoDrag,   { passive: false });
  document.addEventListener("touchend",   peEndDrag);

  // Rotate buttons
  document.getElementById("rotate-left-btn").addEventListener("click", function() {
    pe.rotation = (pe.rotation - 90 + 360) % 360;
    pe.cropW = 0; // reset crop box because aspect ratio changes
    peRender();
  });
  document.getElementById("rotate-right-btn").addEventListener("click", function() {
    pe.rotation = (pe.rotation + 90) % 360;
    pe.cropW = 0;
    peRender();
  });

  // Zoom slider (Only zooms image, crop box remains in place)
  document.getElementById("zoom-slider").addEventListener("input", function() {
    pe.zoom = this.value / 100;
    document.getElementById("zoom-label").textContent = this.value + "%";
    peRender();
  });

  // Apply button
  document.getElementById("photo-editor-apply").addEventListener("click", peApply);

  // Reset button
  document.getElementById("photo-editor-reset").addEventListener("click", function() {
    pe.rotation = 0;
    pe.zoom = 1;
    pe.panX = 0;
    pe.panY = 0;
    pe.cropW = 0;
    document.getElementById("zoom-slider").value = 100;
    document.getElementById("zoom-label").textContent = "100%";
    peRender();
  });
});

// ==========================================================================
// CARTOON AVATAR GENERATOR
// ==========================================================================

const TOON_AVATARS = (function () {
  const ANIM = `<style>
    .ey { animation: bl 3.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    .mo { animation: sm 4.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    .hd { animation: hbob 6s ease-in-out infinite; transform-box: fill-box; transform-origin: bottom center; }
    @keyframes bl {
      0%, 82%, 100% { transform: scaleY(1); }
      90%, 94% { transform: scaleY(0.08); }
    }
    @keyframes sm {
      0%, 65%, 100% { transform: scale(1); }
      80%, 90% { transform: scale(1.1, 0.95); }
    }
    @keyframes hbob {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-1.5px) rotate(0.8deg); }
    }
  </style>`;

  function hair(style, c) {
    switch (style) {
      case 'sb':  return `<ellipse cx="50" cy="29" rx="25" ry="18" fill="${c}"/><rect x="25" y="28" width="50" height="14" fill="${c}"/>`;
      case 'lg':  return `<ellipse cx="50" cy="26" rx="26" ry="17" fill="${c}"/><rect x="23" y="26" width="9" height="36" rx="4" fill="${c}"/><rect x="68" y="26" width="9" height="36" rx="4" fill="${c}"/>`;
      case 'cb':  return `<circle cx="35" cy="29" r="12" fill="${c}"/><circle cx="50" cy="22" r="13" fill="${c}"/><circle cx="65" cy="29" r="12" fill="${c}"/>`;
      case 'pt':  return `<ellipse cx="50" cy="26" rx="22" ry="14" fill="${c}"/><ellipse cx="72" cy="36" rx="6" ry="14" fill="${c}"/>`;
      case 'sp':  return `<path d="M30,45 L26,18 L34,37 L40,15 L46,34 L50,13 L54,34 L60,15 L66,37 L74,18 L70,45Z" fill="${c}"/>`;
      case 'bn':  return `<ellipse cx="50" cy="31" rx="23" ry="14" fill="${c}"/><circle cx="50" cy="21" r="11" fill="${c}"/>`;
      case 'eld': return `<ellipse cx="50" cy="27" rx="25" ry="15" fill="${c}"/>`;
      case 'tiny':return `<ellipse cx="50" cy="33" rx="8" ry="6" fill="${c}"/>`;
      case 'wb':  return `<path d="M26,36 Q38,14 50,28 Q62,14 74,36 Q62,24 50,38 Q38,24 26,36Z" fill="${c}"/>`;
      default:    return `<ellipse cx="50" cy="28" rx="24" ry="16" fill="${c}"/>`;
    }
  }

  function extra(type, hc) {
    switch (type) {
      case 'gl':  return `<ellipse cx="41" cy="55" rx="9" ry="7" fill="none" stroke="#555" stroke-width="2.5"/><ellipse cx="59" cy="55" rx="9" ry="7" fill="none" stroke="#555" stroke-width="2.5"/><line x1="50" y1="55" x2="50" y2="55" stroke="#555" stroke-width="2"/>`;
      case 'cap': return `<path d="M24,42 Q50,22 76,42Z" fill="${hc}"/><rect x="18" y="40" width="64" height="8" rx="4" fill="${hc}"/><rect x="14" y="46" width="22" height="5" rx="2.5" fill="${hc}"/>`;
      case 'hb':  return `<rect x="26" y="40" width="48" height="8" rx="4" fill="#EF5350"/>`;
      case 'sg':  return `<rect x="31" y="50" width="17" height="10" rx="5" fill="#212121" opacity="0.9"/><rect x="52" y="50" width="17" height="10" rx="5" fill="#212121" opacity="0.9"/><line x1="48" y1="55" x2="52" y2="55" stroke="#212121" stroke-width="2"/>`;
      case 'bt':  return `<path d="M40,76 Q50,82 60,76 L62,90 Q50,95 38,90Z" fill="#1565C0"/>`;
      case 'bow': return `<rect x="38" y="24" width="24" height="8" rx="4" fill="#E91E63"/><circle cx="50" cy="28" r="5" fill="#F48FB1"/>`;
      case 'hj':  return `<path d="M22,56 Q22,16 50,16 Q78,16 78,56 L78,68 Q50,78 22,68Z" fill="${hc}" opacity="0.9"/>`;
      default:    return '';
    }
  }

  function blush(skin) {
    const c = skin === '#FDBCB4' ? '#FF8A80' : skin === '#D4956A' ? '#BF6040' : '#7A3B20';
    return `<circle cx="38" cy="63" r="5" fill="${c}" opacity="0.45"/><circle cx="62" cy="63" r="5" fill="${c}" opacity="0.45"/>`;
  }

  const configs = [
    // [bg,            skin,       hair-style, hair-color,  accessory]
    ['#1565C0',  '#FDBCB4', 'sb',  '#1A1A1A', 'none'],   // 1 — Boy (light)
    ['#AD1457',  '#FDBCB4', 'lg',  '#6B2D0E', 'none'],   // 2 — Girl (light)
    ['#6A1B9A',  '#8D5524', 'cb',  '#1A1A1A', 'none'],   // 3 — Boy (dark, curly)
    ['#E65100',  '#D4956A', 'pt',  '#1A1A1A', 'none'],   // 4 — Girl (medium, ponytail)
    ['#37474F',  '#FDBCB4', 'eld', '#E0E0E0', 'none'],   // 5 — Grandpa
    ['#2E7D32',  '#FDBCB4', 'bn',  '#E0E0E0', 'none'],   // 6 — Grandma
    ['#FF8F00',  '#FDBCB4', 'tiny','#FFD54F', 'none'],   // 7 — Baby
    ['#00838F',  '#FDBCB4', 'sb',  '#4E342E', 'gl'],     // 8 — Nerd (glasses)
    ['#7B1FA2',  '#8D5524', 'lg',  '#1A1A1A', 'bow'],    // 9 — Girl (dark, bow)
    ['#D84315',  '#D4956A', 'wb',  '#1A1A1A', 'hb'],     // 10 — Sporty (headband)
    ['#1B5E20',  '#FDBCB4', 'sb',  '#4E342E', 'cap'],    // 11 — Cap dude
    ['#212121',  '#D4956A', 'sp',  '#1A1A1A', 'sg'],     // 12 — Cool (sunglasses)
    ['#0277BD',  '#8D5524', 'sb',  '#6B2D0E', 'bt'],     // 13 — Boy (dark, bowtie)
    ['#880E4F',  '#FDBCB4', 'lg',  '#E91E63', 'none'],   // 14 — Girl (pink hair)
    ['#4527A0',  '#D4956A', 'cb',  '#FFA000', 'none'],   // 15 — Curly (golden, medium)
    ['#004D40',  '#D4956A', 'lg',  '#1A1A1A', 'hj'],     // 16 — Hijab
    // 6 New configs to bring total to 22:
    ['#00796B',  '#D4956A', 'sp',  '#6B2D0E', 'none'],   // 17 — Spiky teal boy
    ['#C2185B',  '#FDBCB4', 'wb',  '#FF4081', 'bow'],    // 18 — Pink wave bow girl
    ['#7B1FA2',  '#8D5524', 'tiny','#1A1A1A', 'gl'],     // 19 — Dark tiny glasses boy
    ['#E64A19',  '#FDBCB4', 'lg',  '#F57C00', 'hb'],     // 20 — Orange long headband girl
    ['#303F9F',  '#D4956A', 'sb',  '#FFA000', 'sg'],     // 21 — Golden boy sunglasses
    ['#455A64',  '#FDBCB4', 'cb',  '#5D4037', 'bt']      // 22 — Curly brown bowtie boy
  ];

  return configs.map(function ([bg, skin, hs, hc, fx]) {
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${ANIM}
<rect width="100" height="100" rx="20" fill="${bg}"/>
<g class="hd">
  ${hair(hs, hc)}
  <circle cx="50" cy="57" r="27" fill="${skin}"/>
  <g class="ey">
    <ellipse cx="41" cy="55" rx="4.5" ry="5" fill="#333"/>
    <circle cx="41.5" cy="53.5" r="1.8" fill="#fff"/>
  </g>
  <g class="ey">
    <ellipse cx="59" cy="55" rx="4.5" ry="5" fill="#333"/>
    <circle cx="59.5" cy="53.5" r="1.8" fill="#fff"/>
  </g>
  ${blush(skin)}
  <path class="mo" d="M43,68 Q50,75 57,68" stroke="#C62828" fill="none" stroke-width="2.5" stroke-linecap="round"/>
  ${extra(fx, hc)}
</g>
</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
  });
})();

// Render the cartoon avatar picker grid
function renderToonAvatarGrid() {
  const grid = document.getElementById("toon-avatar-grid");
  if (!grid) return;
  grid.innerHTML = "";

  TOON_AVATARS.forEach(function (dataUrl, idx) {
    const item = document.createElement("div");
    item.className = "toon-avatar-item";
    item.dataset.toonIdx = idx;

    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = "Cartoon avatar " + (idx + 1);
    item.appendChild(img);

    // Highlight if current member already uses this toon
    if (currentMember && currentMember.avatar === dataUrl) {
      item.classList.add("selected");
    }

    item.addEventListener("click", function () {
      // Clear old selection
      grid.querySelectorAll(".toon-avatar-item").forEach(function (el) {
        el.classList.remove("selected");
      });
      item.classList.add("selected");

      // Set as the chosen avatar (will be saved when user clicks "Save Profile")
      uploadedEditProfileAvatarBase64 = dataUrl;
      document.getElementById("profile-edit-avatar-preview").src = dataUrl;
    });

    grid.appendChild(item);
  });
}

// Patch openSettingsModal so it also renders toon grid each time it opens
const _origOpenSettings = typeof openSettingsModal === "function" ? openSettingsModal : null;
// Re-hook: renderToonAvatarGrid is called from openSettingsModal
document.addEventListener("DOMContentLoaded", function () {
  // Override the settings open button to also render toon grid
  document.querySelectorAll("[data-open-settings], #settings-btn, .settings-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTimeout(renderToonAvatarGrid, 50);
    });
  });
});

// Also render when the profile tab becomes active
document.addEventListener("DOMContentLoaded", function () {
  const tabBtn = document.getElementById("tab-profile-btn");
  if (tabBtn) {
    tabBtn.addEventListener("click", function () {
      setTimeout(renderToonAvatarGrid, 30);
    });
  }
});

// Render the cartoon avatar picker grid for the registration modal
function renderRegToonAvatarGrid() {
  const grid = document.getElementById("reg-toon-avatar-grid");
  if (!grid) return;
  grid.innerHTML = "";

  TOON_AVATARS.forEach(function (dataUrl, idx) {
    const item = document.createElement("div");
    item.className = "toon-avatar-item";
    item.dataset.toonIdx = idx;

    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = "Cartoon avatar " + (idx + 1);
    item.appendChild(img);

    // Default select first avatar if none chosen yet
    if (!uploadedCustomAvatarBase64 && idx === 0) {
      item.classList.add("selected");
      uploadedCustomAvatarBase64 = dataUrl;
      document.getElementById("reg-avatar-preview").src = dataUrl;
    } else if (uploadedCustomAvatarBase64 === dataUrl) {
      item.classList.add("selected");
    }

    item.addEventListener("click", function () {
      // Clear old selection
      grid.querySelectorAll(".toon-avatar-item").forEach(function (el) {
        el.classList.remove("selected");
      });
      item.classList.add("selected");

      // Set as the chosen registration avatar
      uploadedCustomAvatarBase64 = dataUrl;
      document.getElementById("reg-avatar-preview").src = dataUrl;
    });

    grid.appendChild(item);
  });
}

// ==========================================================================
// FIREBASE + IMGBB CLOUD INTEGRATION
// ==========================================================================

const FIREBASE_CONFIG_KEY = "docusaver_firebase_config";
const IMGBB_KEY_STORAGE    = "docusaver_imgbb_key";

let _firebaseApp = null;
let _firestore   = null;

// ── Config helpers ──────────────────────────────────────────────────────────

function getFirebaseConfig() {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveFirebaseConfig(cfg) {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(cfg));
}

function getImgbbKey() {
  return localStorage.getItem(IMGBB_KEY_STORAGE) || "";
}

// ── SDK init ─────────────────────────────────────────────────────────────────

function initFirebase() {
  const cfg = getFirebaseConfig();
  if (!cfg || !cfg.apiKey) return false;

  try {
    // Re-use existing app if already initialised with same project
    if (_firebaseApp && _firebaseApp.options.projectId === cfg.projectId) {
      return true;
    }

    // Delete old app if project changed
    if (_firebaseApp) {
      _firebaseApp.delete().catch(() => {});
      _firebaseApp = null;
      _firestore   = null;
    }

    _firebaseApp = firebase.initializeApp(cfg, cfg.projectId + "_" + Date.now());
    _firestore   = firebase.firestore(_firebaseApp);
    console.log("[Firebase] Connected to:", cfg.projectId);
    return true;
  } catch (err) {
    console.error("[Firebase] Init error:", err);
    _firebaseApp = null;
    _firestore   = null;
    return false;
  }
}

// ── ImgBB image upload ────────────────────────────────────────────────────────

async function uploadImageToImgbb(base64DataUrl) {
  const apiKey = getImgbbKey();
  if (!apiKey) throw new Error("ImgBB API key not set. Add it in Firebase Connect settings.");

  // Strip the data:image/jpeg;base64, prefix
  const base64 = base64DataUrl.replace(/^data:image\/\w+;base64,/, "");

  const formData = new FormData();
  formData.append("key", apiKey);
  formData.append("image", base64);

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error("ImgBB upload failed: " + res.status);
  const json = await res.json();

  if (!json.success) throw new Error("ImgBB error: " + (json.error && json.error.message));
  return json.data.url; // permanent hosted image URL
}

// ── Firestore helpers ─────────────────────────────────────────────────────────

function getFamilyDocRef() {
  if (!_firestore || !currentFamily) return null;
  return _firestore.collection("families").doc(currentFamily.username.toLowerCase());
}

// Push full db (members + documents) to Firestore.
// Before pushing, upload any new base64 document images to ImgBB and replace with URL.
async function pushDbToFirestore() {
  const ref = getFamilyDocRef();
  if (!ref) return;

  const apiKey = getImgbbKey();

  // Deep copy so we don't mutate in-memory objects until upload succeeds
  const membersForCloud = JSON.parse(JSON.stringify(db.members));
  const docsForCloud    = JSON.parse(JSON.stringify(db.documents));

  // Upload any base64 images that haven't been uploaded yet
  for (const doc of docsForCloud) {
    if (doc.image && doc.image.startsWith("data:")) {
      if (apiKey) {
        try {
          const url = await uploadImageToImgbb(doc.image);
          // Persist the hosted URL back into the real in-memory db too
          const realDoc = db.documents.find(d => d.id === doc.id);
          if (realDoc) realDoc.image = url;
          doc.image = url;
          console.log("[ImgBB] Uploaded doc image:", doc.id);
        } catch (uploadErr) {
          console.warn("[ImgBB] Could not upload image for doc", doc.id, uploadErr.message);
          doc.image = ""; // strip to avoid Firestore 1MB limit
        }
      } else {
        doc.image = ""; // no key — strip large blob
      }
    }
  }

  // Strip large base64 member avatars too (keep toon keys and hosted URLs)
  for (const m of membersForCloud) {
    if (m.avatar && m.avatar.startsWith("data:") && m.avatar.length > 500) {
      m.avatar = ""; // too large for Firestore
    }
  }

  await ref.set({
    familyName: currentFamily.familyName,
    username:   currentFamily.username,
    members:    membersForCloud,
    documents:  docsForCloud,
    updatedAt:  new Date().toISOString()
  }, { merge: true });

  // Also save updated URLs locally
  saveFamilies();
}

// Pull db from Firestore and merge into local state
async function pullDbFromFirestore() {
  const ref = getFamilyDocRef();
  if (!ref) return false;

  const snap = await ref.get();
  if (!snap.exists) return false;

  const data = snap.data();
  if (data.members)   db.members   = data.members;
  if (data.documents) db.documents = data.documents;

  // Sync back into family store
  const idx = families.findIndex(f => f.id === currentFamily.id);
  if (idx !== -1) {
    families[idx].members   = db.members;
    families[idx].documents = db.documents;
    currentFamily = families[idx];
  }
  saveFamilies();
  return true;
}

// ── UI Handlers ───────────────────────────────────────────────────────────────

async function handleFirebaseSettingsSave(event) {
  event.preventDefault();

  const statusEl = document.getElementById("firebase-settings-status");
  const cfg = {
    apiKey:        document.getElementById("fb-apiKey").value.trim(),
    projectId:     document.getElementById("fb-projectId").value.trim(),
    storageBucket: document.getElementById("fb-storageBucket").value.trim(),
    authDomain:    document.getElementById("fb-authDomain").value.trim(),
    appId:         document.getElementById("fb-appId").value.trim()
  };

  const imgbbKey = document.getElementById("fb-imgbbKey") ? document.getElementById("fb-imgbbKey").value.trim() : "";

  if (!cfg.apiKey || !cfg.projectId) {
    statusEl.textContent = "❌ API Key and Project ID are required.";
    statusEl.style.color = "#f44336";
    statusEl.classList.remove("hidden");
    return;
  }

  statusEl.textContent = "⏳ Testing connection…";
  statusEl.style.color = "var(--text-muted)";
  statusEl.classList.remove("hidden");

  saveFirebaseConfig(cfg);
  if (imgbbKey) localStorage.setItem(IMGBB_KEY_STORAGE, imgbbKey);

  const ok = initFirebase();
  if (!ok) {
    statusEl.textContent = "❌ Could not initialise Firebase SDK. Check your config values.";
    statusEl.style.color = "#f44336";
    return;
  }

  // Try a test write/read
  try {
    const ref = getFamilyDocRef();
    await ref.set({ _test: true, _ts: new Date().toISOString() }, { merge: true });

    statusEl.textContent = "✅ Connected! Syncing your vault to Firestore now…";
    statusEl.style.color = "#4CAF50";

    // Show disconnect btn
    const disconnectBtn = document.getElementById("disconnect-firebase-btn");
    if (disconnectBtn) disconnectBtn.classList.remove("hidden");

    // Push current local data to Firestore
    await pushDbToFirestore();
    statusEl.textContent = "✅ Firebase connected & vault synced successfully!";

  } catch (err) {
    statusEl.textContent = "❌ Connection test failed: " + err.message;
    statusEl.style.color = "#f44336";
    console.error("[Firebase] Test failed:", err);
  }
}

function handleFirebaseDisconnect() {
  if (!confirm("Disconnect Firebase? Your local data will be kept, but cloud sync will stop.")) return;

  localStorage.removeItem(FIREBASE_CONFIG_KEY);
  if (_firebaseApp) {
    _firebaseApp.delete().catch(() => {});
    _firebaseApp = null;
    _firestore   = null;
  }

  const statusEl = document.getElementById("firebase-settings-status");
  statusEl.textContent = "🔌 Firebase disconnected. Data stays on this device.";
  statusEl.style.color = "var(--text-muted)";
  statusEl.classList.remove("hidden");

  const disconnectBtn = document.getElementById("disconnect-firebase-btn");
  if (disconnectBtn) disconnectBtn.classList.add("hidden");

  // Clear form
  ["fb-apiKey","fb-projectId","fb-storageBucket","fb-authDomain","fb-appId"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}


// ── End of Firebase + ImgBB Integration ──────────────────────────────────────
