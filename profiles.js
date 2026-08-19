// ============================================================
// PROFILES.JS
// Manages Netflix-style profile switching with cinematic loading.
// ============================================================

import { auth } from "./firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const db = getFirestore();

const profilesGrid = document.getElementById("profiles-grid");
const addModal = document.getElementById("add-profile-modal");
const addForm = document.getElementById("add-profile-form");
const cancelBtn = document.getElementById("cancel-profile-btn");

let currentUser = null;

// Clean vector shapes for icons
const iconSVGs = [
  // Shield icon
  `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  // Play button icon
  `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  // Film reel icon
  `<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
  // Target / Compass icon
  `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`
];

const gradients = [
  "linear-gradient(135deg, #6366f1, #a855f7)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #f59e0b, #ef4444)"
];

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user;
    await loadProfiles(user);
  }
});

async function loadProfiles(user) {
  profilesGrid.innerHTML = `<div style="color: var(--text-tertiary); font-size: 14px;">Loading profiles...</div>`;
  
  try {
    const q = query(collection(db, "profiles"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    
    profilesGrid.innerHTML = "";
    let profileCount = 0;
    
    querySnapshot.forEach((docSnap) => {
      profileCount++;
      const data = docSnap.data();
      renderProfileCard(docSnap.id, data.name, data.iconIndex ?? (profileCount % iconSVGs.length));
    });

    if (profileCount === 0) {
      const defaultName = user.displayName || user.email.split("@")[0];
      const newDoc = await addDoc(collection(db, "profiles"), {
        userId: user.uid,
        name: defaultName,
        iconIndex: 0
      });
      renderProfileCard(newDoc.id, defaultName, 0);
      profileCount = 1;
    }

    if (profileCount < 4) {
      renderAddCard();
    }
  } catch (err) {
    console.warn("Firestore error:", err);
    profilesGrid.innerHTML = "";
    const fallbackName = user.displayName || user.email.split("@")[0];
    renderProfileCard("local-fallback", fallbackName, 0);
    renderAddCard();
  }
}

function renderProfileCard(id, name, iconIndex) {
  const card = document.createElement("div");
  card.className = "profile-card";
  const bgStyle = gradients[iconIndex % gradients.length];
  const svgContent = iconSVGs[iconIndex % iconSVGs.length];

  card.innerHTML = `
    <div class="profile-avatar-box" style="background: ${bgStyle};">
      ${svgContent}
    </div>
    <div class="profile-name">${name}</div>
  `;

  // Cinematic Loading Transition on Click
  card.addEventListener("click", () => {
    sessionStorage.setItem("alsaflix_active_profile", JSON.stringify({ id, name, iconIndex }));

    // Create and show cinematic loading overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; background: var(--bg); z-index: 9999;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 20px; opacity: 0; transition: opacity 0.4s ease; backdrop-filter: blur(20px);
    `;
    overlay.innerHTML = `
      <div style="width: 64px; height: 64px; border: 4px solid var(--border-light); border-top-color: var(--text-primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <div style="font-family: var(--font-display); font-size: 24px; letter-spacing: 2px; color: var(--text-primary);">Loading AlsaFlix...</div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.style.opacity = "1"; }, 10);

    // Redirect after 1.5 seconds of smooth animation
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  });

  profilesGrid.appendChild(card);
}

function renderAddCard() {
  const card = document.createElement("div");
  card.className = "profile-card add-profile-card";
  card.innerHTML = `
    <div class="add-icon">+</div>
    <div class="profile-name">Add Profile</div>
  `;
  card.addEventListener("click", () => {
    addModal.classList.add("show");
  });
  profilesGrid.appendChild(card);
}

if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    addModal.classList.remove("show");
  });
}

if (addForm) {
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameVal = document.getElementById("new-profile-name").value.trim();
    if (!nameVal || !currentUser) return;

    const submitBtn = document.getElementById("save-profile-btn");
    submitBtn.disabled = true;
    submitBtn.querySelector(".btn-label").textContent = "Saving...";

    try {
      const randomIconIndex = Math.floor(Math.random() * iconSVGs.length);
      await addDoc(collection(db, "profiles"), {
        userId: currentUser.uid,
        name: nameVal,
        iconIndex: randomIconIndex
      });
      addModal.classList.remove("show");
      addForm.reset();
      await loadProfiles(currentUser);
    } catch (err) {
      console.error("Error adding profile:", err);
      alert("Could not save profile to database.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector(".btn-label").textContent = "Save";
    }
  });
}