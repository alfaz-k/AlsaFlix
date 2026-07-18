// ============================================================
// DASHBOARD.JS
// Runs on dashboard.html. Protects the route, shows the
// welcome message, renders movie cards from movies.js, and
// wires up live search + logout.
// ============================================================

import { movies } from "./movies.js";
import { protectDashboard, wireLogout } from "./auth.js";

const grid = document.getElementById("movie-grid");
const searchInput = document.getElementById("search-input");
const welcomeName = document.getElementById("welcome-name");
const resultsMeta = document.getElementById("results-meta");

// ---- Skeleton loading state while auth resolves ----
function renderSkeletons(count = 10) {
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
  card.querySelector(".btn-watch").addEventListener("click", () => {
    window.open(movie.driveLink, "_blank", "noopener,noreferrer");
  });
  return card;
}

// ---- Render a list of movies into the grid ----
function renderMovies(list) {
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
    resultsMeta.textContent = "0 results";
    return;
  }

  list.forEach((movie) => grid.appendChild(createMovieCard(movie)));
  resultsMeta.textContent = `${list.length} title${list.length === 1 ? "" : "s"}`;
}

// ---- Live search by title ----
function initSearch() {
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
  const displayName = user.displayName || user.email.split("@")[0];
  welcomeName.textContent = displayName;
  renderMovies(movies);
  initSearch();
});

wireLogout(document.getElementById("logout-btn"));

const themeBtn = document.getElementById("theme-toggle");

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