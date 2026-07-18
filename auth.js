// ============================================================
// AUTH.JS
// Handles signup, login, logout, form validation, and
// route protection. Firebase Auth persists the session in
// the browser by default (localStorage-backed), so users
// stay logged in across visits until they explicitly log out.
// ============================================================

import { auth, provider } from "./firebase.js"; // Updated to import provider
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup // Imported signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ---- Helpers ----------------------------------------------

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// At least 6 characters (Firebase's own minimum) — kept simple
// and non-punishing, per the "lightweight" brief.
function isStrongPassword(pw) {
  return pw.length >= 6;
}

function showBanner(el, message, type) {
  el.textContent = message;
  el.className = `form-banner ${type} show`;
}

function hideBanner(el) {
  el.className = "form-banner";
}

function setCaptchaError(bannerEl, message) {
  showBanner(bannerEl, message, "error");
}

function setFieldError(inputEl, errorEl, message) {
  inputEl.classList.add("error");
  if (message) errorEl.textContent = message;
  errorEl.classList.add("show");
}

function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove("error");
  errorEl.classList.remove("show");
}

// Turns Firebase's raw error codes into plain-language messages.
function friendlyAuthError(error) {
  const code = error.code || "";
  const map = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/popup-closed-by-user": "The sign-in popup was closed before finishing."
  };
  return map[code] || "Something went wrong. Please try again.";
}

function setLoading(button, spinner, isLoading, idleLabel) {
  button.disabled = isLoading;
  spinner.classList.toggle("show", isLoading);
  button.querySelector(".btn-label").textContent = isLoading ? "" : idleLabel;
}

function wirePasswordToggle(toggleBtn, inputEl) {
  if (!toggleBtn) return;
  toggleBtn.addEventListener("click", () => {
    const isHidden = inputEl.type === "password";
    inputEl.type = isHidden ? "text" : "password";
    toggleBtn.textContent = isHidden ? "Hide" : "Show";
  });
}

// ---- Redirect logged-in users away from auth pages ---------
// Runs on index.html (login) and signup.html only.
function redirectIfLoggedIn() {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "dashboard.html";
  });
}

// ---- Protect dashboard.html ---------------------------------
function protectDashboard(onUser) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      onUser(user);
    }
  });
}

// ---- Login page wiring ---------------------------------------
function initLoginPage() {
  redirectIfLoggedIn();

  const form = document.getElementById("login-form");
  if (!form) return;

  const emailInput = document.getElementById("login-email");
  const passInput = document.getElementById("login-password");
  const emailError = document.getElementById("login-email-error");
  const passError = document.getElementById("login-password-error");
  const banner = document.getElementById("login-banner");
  const submitBtn = document.getElementById("login-submit");
  const spinner = submitBtn.querySelector(".spinner");

  wirePasswordToggle(document.getElementById("login-toggle-pass"), passInput);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideBanner(banner);
    clearFieldError(emailInput, emailError);
    clearFieldError(passInput, passError);

    const email = emailInput.value.trim();
    const password = passInput.value;

    // 1. Core Field Validations
    let valid = true;
    if (!isValidEmail(email)) {
      setFieldError(emailInput, emailError, "Enter a valid email address.");
      valid = false;
    }
    if (!password) {
      setFieldError(passInput, passError, "Password is required.");
      valid = false;
    }
    if (!valid) return;

    // 2. Security Wrapper: Verify Cloudflare Turnstile Token
    const turnstileResponse = typeof turnstile !== "undefined" ? turnstile.getResponse() : "";
    if (!turnstileResponse) {
      setCaptchaError(banner, "Please complete the security check.");
      return;
    }

    setLoading(submitBtn, spinner, true, "Log In");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in redirectIfLoggedIn() handles the redirect.
    } catch (error) {
      showBanner(banner, friendlyAuthError(error), "error");
      setLoading(submitBtn, spinner, false, "Log In");
      // Safely reset the Cloudflare checkbox token if authentication fails
      if (typeof turnstile !== "undefined") turnstile.reset();
    }
  });

  // ---- Google Sign-In Logic ----
  const googleBtn = document.getElementById("google-login-btn");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      hideBanner(banner);
      try {
        await signInWithPopup(auth, provider);
        // redirectIfLoggedIn() will catch the new user session and send them to dashboard.html
      } catch (error) {
        showBanner(banner, friendlyAuthError(error), "error");
      }
    });
  }
}

// ---- Signup page wiring ----------------------------------------
function initSignupPage() {
  redirectIfLoggedIn();

  const form = document.getElementById("signup-form");
  if (!form) return;

  const nameInput = document.getElementById("signup-name");
  const emailInput = document.getElementById("signup-email");
  const passInput = document.getElementById("signup-password");
  const confirmInput = document.getElementById("signup-confirm");

  const nameError = document.getElementById("signup-name-error");
  const emailError = document.getElementById("signup-email-error");
  const passError = document.getElementById("signup-password-error");
  const confirmError = document.getElementById("signup-confirm-error");

  const banner = document.getElementById("signup-banner");
  const submitBtn = document.getElementById("signup-submit");
  const spinner = submitBtn.querySelector(".spinner");

  wirePasswordToggle(document.getElementById("signup-toggle-pass"), passInput);
  wirePasswordToggle(document.getElementById("signup-toggle-confirm"), confirmInput);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideBanner(banner);
    [nameInput, emailInput, passInput, confirmInput].forEach((el) => el.classList.remove("error"));
    [nameError, emailError, passError, confirmError].forEach((el) => el.classList.remove("show"));

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value;
    const confirm = confirmInput.value;

    let valid = true;
    if (name.length < 2) {
      setFieldError(nameInput, nameError, "Enter your name.");
      valid = false;
    }
    if (!isValidEmail(email)) {
      setFieldError(emailInput, emailError, "Enter a valid email address.");
      valid = false;
    }
    if (!isStrongPassword(password)) {
      setFieldError(passInput, passError, "Password must be at least 6 characters.");
      valid = false;
    }
    if (confirm !== password || !confirm) {
      setFieldError(confirmInput, confirmError, "Passwords don't match.");
      valid = false;
    }
    if (!valid) return;

    setLoading(submitBtn, spinner, true, "Create Account");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      // onAuthStateChanged in redirectIfLoggedIn() handles the redirect.
    } catch (error) {
      showBanner(banner, friendlyAuthError(error), "error");
      setLoading(submitBtn, spinner, false, "Create Account");
    }
  });
}

// ---- Logout (used on dashboard.html) ----------------------------
function wireLogout(buttonEl) {
  if (!buttonEl) return;
  buttonEl.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}

export { initLoginPage, initSignupPage, protectDashboard, wireLogout };
