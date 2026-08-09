// ============================================================
// DASHBOARD.JS
// Protects route, renders movie cards from movies.js, and
// handles in-app video streaming modal + search + theme + mobile toast.
// ============================================================

import { movies } from "./movies.js";
import { protectDashboard, wireLogout } from "./auth.js";

const grid = document.getElementById("movie-grid");
const searchInput = document.getElementById("search-input");
const welcomeName = document.getElementById("welcome-name");
const resultsMeta = document.getElementById("results-meta");

// Modal DOM Elements
const videoModal = document.getElementById("video-modal");
const modalBackdrop = document.getElementById("modal-backdrop");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalMovieTitle = document.getElementById("modal-movie-title");
const videoIframe = document.getElementById("video-iframe");

// Mobile Toast Notice DOM Elements
const mobileNoticeToast = document.getElementById("mobile-notice-toast");
const closeToastBtn = document.getElementById("close-toast-btn");

// ---- Show Toast Notice for Mobile Users ----
function showMobileNotice() {
  const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);

  if (isMobile && mobileNoticeToast) {
    mobileNoticeToast.classList.add("show");

    // Auto dismiss after 6 seconds
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
  
  // 1. Convert Google Drive view/share links
  if (rawUrl.includes("drive.google.com")) {
    return rawUrl.replace(/\/view(\?.*)?$/, "/preview").replace(/\/edit(\?.*)?$/, "/preview");
  }

  // 2. Convert YouTube links (standard, shorts, or mobile share links)
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

  // Trigger mobile desktop view tip when modal opens
  showMobileNotice();

  const embedUrl = getEmbedUrl(movie.driveLink);
  if (modalMovieTitle) modalMovieTitle.textContent = movie.title;
  videoIframe.src = embedUrl;

  videoModal.classList.add("active");
  videoModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // Block page scrolling behind modal
}

function closeVideoModal() {
  if (!videoModal || !videoIframe) return;

  videoModal.classList.remove("active");
  videoModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  // Reset src after transition finishes so audio stops playing instantly
  setTimeout(() => {
    videoIframe.src = "";
  }, 300);
}

// Modal Event Listeners
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeVideoModal);
if (modalBackdrop) modalBackdrop.addEventListener("click", closeVideoModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && videoModal && videoModal.classList.contains("active")) {
    closeVideoModal();
  }
});

// ---- Skeleton loading state ----
function renderSkeletons(count = 10) {
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "skeleton-card";
    card.innerHTML = `
      <div class="skeleton-poster"></div>
      <div class="skeleton-line" style="width: 70%;"></div>
      <div class="skeleton-btn"></div>
    `;
    grid.appendChild(card);
  }
}

// ---- Build one movie card ----
function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";
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

  // Intercept click to launch in-app player modal
  card.querySelector(".btn-watch").addEventListener("click", () => {
    openVideoModal(movie);
  });

  return card;
}

// ---- Render list of movies ----
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

  list.forEach((movie) => grid.appendChild(createMovieCard(movie)));
  if (resultsMeta) {
    resultsMeta.textContent = `${list.length} title${list.length === 1 ? "" : "s"}`;
  }
}

// ---- Live search by title ----
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

// ---- Init ----
renderSkeletons();

protectDashboard((user) => {
  let displayName = "Member";

  if (user) {
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

// Wire logout button
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  wireLogout(logoutBtn);
}

// Theme Toggle
const themeBtn = document.getElementById("theme-toggle");
if (themeBtn) {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeBtn.textContent = "☀️";
  } else {
    themeBtn.textContent = "🌙";
  }

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    themeBtn.textContent = dark ? "☀️" : "🌙";
    localStorage.setItem("theme", dark ? "dark" : "light");
  });
}
