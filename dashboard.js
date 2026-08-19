// ============================================================
// DASHBOARD.JS
// Protects route, renders movie cards from movies.js with clean hover
// & scroll reveal, handles video modal, suggest modal, search & theme.
// ============================================================

import { movies } from "./movies.js";
import { protectDashboard, wireLogout } from "./auth.js";

// DOM Elements
const grid = document.getElementById("movie-grid");
const searchInput = document.getElementById("search-input");
const welcomeName = document.getElementById("welcome-name");
const resultsMeta = document.getElementById("results-meta");

// Video Modal DOM Elements
const videoModal = document.getElementById("video-modal");
const modalBackdrop = document.getElementById("modal-backdrop");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalMovieTitle = document.getElementById("modal-movie-title");
const videoIframe = document.getElementById("video-iframe");

// Suggest Movie Modal Elements
const suggestBtn = document.getElementById("suggest-movie-btn");
const suggestModal = document.getElementById("suggest-modal");
const closeSuggestBtn = document.getElementById("close-modal");

// Mobile Notice Toast Elements
const mobileNoticeToast = document.getElementById("mobile-notice-toast");
const closeToastBtn = document.getElementById("close-toast-btn");

// ---- Suggest Movie Modal Handlers ----
function openSuggestModal() {
  if (!suggestModal) return;
  suggestModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeSuggestModal() {
  if (!suggestModal) return;
  suggestModal.classList.remove("active");
  document.body.style.overflow = "";
}

if (suggestBtn) suggestBtn.addEventListener("click", openSuggestModal);
if (closeSuggestBtn) closeSuggestBtn.addEventListener("click", closeSuggestModal);

if (suggestModal) {
  suggestModal.addEventListener("click", (e) => {
    if (e.target === suggestModal) closeSuggestModal();
  });
}

// ---- Show Toast Notice for Mobile Users ----
function showMobileNotice() {
  const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);

  if (isMobile && mobileNoticeToast) {
    mobileNoticeToast.classList.add("show");

    setTimeout(() => {
      mobileNoticeToast.classList.remove("show");
    }, 6000);
  }
}

if (closeToastBtn && mobileNoticeToast) {
  closeToastBtn.addEventListener("click", () => {
    mobileNoticeToast.classList.remove("show");
  });
}

// ---- Convert Google Drive & YouTube Links into Streamable Embeds ----
function getEmbedUrl(rawUrl) {
  if (!rawUrl) return "";
  
  // 1. Google Drive Links
  if (rawUrl.includes("drive.google.com")) {
    return rawUrl.replace(/\/view(\?.*)?$/, "/preview").replace(/\/edit(\?.*)?$/, "/preview");
  }

  // 2. YouTube Links
  if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
    let videoId = "";

    if (rawUrl.includes("youtu.be/")) {
      videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0];
    } else if (rawUrl.includes("youtube.com/shorts/")) {
      videoId = rawUrl.split("youtube.com/shorts/")[1]?.split("?")[0];
    } else if (rawUrl.includes("watch?v=")) {
      videoId = rawUrl.split("watch?v=")[1]?.split("&")[0];
    } else if (rawUrl.includes("youtube.com/embed/")) {
      return rawUrl;
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
  }
  
  return rawUrl;
}

// ---- Open & Close Video Player Modal ----
function openVideoModal(movie) {
  if (!videoModal || !videoIframe) return;

  showMobileNotice();

  const embedUrl = getEmbedUrl(movie.driveLink);
  if (modalMovieTitle) modalMovieTitle.textContent = movie.title;
  videoIframe.src = embedUrl;

  videoModal.classList.add("active");
  videoModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeVideoModal() {
  if (!videoModal || !videoIframe) return;

  videoModal.classList.remove("active");
  videoModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  setTimeout(() => {
    videoIframe.src = "";
  }, 300);
}

// Modal Global Listeners
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeVideoModal);
if (modalBackdrop) modalBackdrop.addEventListener("click", closeVideoModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (videoModal && videoModal.classList.contains("active")) closeVideoModal();
    if (suggestModal && suggestModal.classList.contains("active")) closeSuggestModal();
  }
});

// ---- Skeleton Loading State ----
function renderSkeletons(count = 10) {
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML = `
      <div class="skeleton-poster"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-btn"></div>
    `;
    grid.appendChild(card);
  }
}

// ---- Scroll Reveal Observer ----
const scrollObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    root: null,
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px"
  }
);

// ---- Build Card with Clean & Classy Hover Effect ----
function createMovieCard(movie, index = 0) {
  const card = document.createElement("div");
  card.className = "movie-card reveal-init";
  
  card.style.transitionDelay = `${(index % 6) * 0.06}s`;

  card.innerHTML = `
    <div class="movie-poster-wrap">
      <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
    </div>
    <div class="movie-body">
      <div class="movie-title">${movie.title}</div>
      <button class="btn-watch" type="button" aria-label="Watch ${movie.title} now">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <polygon points="6 3 20 12 6 21 6 3"></polygon>
        </svg>
        Watch Now
      </button>
    </div>
  `;

  // Watch Button Handler
  card.querySelector(".btn-watch").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    btn.classList.add("loading");

    setTimeout(() => {
      btn.classList.remove("loading");
      openVideoModal(movie);
    }, 400);
  });

  // Observe card for scroll fade-in
  scrollObserver.observe(card);

  return card;
}

// ---- Render Movie Grid ----
function renderMovies(list) {
  if (!grid) return;
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="11" cy="11" r="7"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>No movies match your search.</p>
      </div>
    `;
    if (resultsMeta) resultsMeta.textContent = "0 results";
    return;
  }

  list.forEach((movie, index) => grid.appendChild(createMovieCard(movie, index)));
  if (resultsMeta) {
    resultsMeta.textContent = `${list.length} title${list.length === 1 ? "" : "s"}`;
  }
}

// ---- Live Title Search ----
function initSearch() {
  if (!searchInput) return;
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = query
      ? movies.filter((m) => m.title.toLowerCase().includes(query))
      : movies;
    renderMovies(filtered);
  });
}

// ---- Initialize App ----
renderSkeletons();

protectDashboard((user) => {
  let displayName = "Member";

  // Load active profile from sessionStorage if chosen from profiles.html
  const activeProfile = JSON.parse(sessionStorage.getItem("alsaflix_active_profile"));
  if (activeProfile && activeProfile.name) {
    displayName = activeProfile.name;
  } else if (user) {
    if (user.displayName) {
      displayName = user.displayName;
    } else if (user.email) {
      displayName = user.email.split("@")[0];
    } else if (user.phoneNumber) {
      displayName = user.phoneNumber;
    }
  }

  if (welcomeName) {
    welcomeName.textContent = displayName;
  }

  renderMovies(movies);
  initSearch();
});

// Logout Button Connection
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  wireLogout(logoutBtn);
}

// ---- BULLETPROOF THEME TOGGLE ----
const themeBtn = document.getElementById("theme-toggle");
if (themeBtn) {
  let savedTheme = localStorage.getItem("alsaflix-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeBtn.textContent = savedTheme === "dark" ? "☀️" : "🌙";

  themeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    themeBtn.textContent = newTheme === "dark" ? "☀️" : "🌙";
    
    localStorage.setItem("alsaflix-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }, true);
}
