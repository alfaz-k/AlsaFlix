// ============================================================
// FIREBASE.JS
// Initializes Firebase and exports the auth instance for use
// across auth.js and dashboard.js.
//
// HOW TO SET THIS UP:
// 1. Go to https://console.firebase.google.com and create a project.
// 2. In Project Settings > General, scroll to "Your apps" and add
//    a Web app. Firebase will give you a config object — paste it
//    into firebaseConfig below.
// 3. In the Firebase console, go to Build > Authentication >
//    Sign-in method, and enable "Email/Password".
// 4. That's it — no backend server or API keys to hide. Firebase
//    web config is safe to expose publicly; it's not a secret key,
//    it just tells the SDK which project to talk to. Security is
//    enforced by Firebase Auth + your Firestore/Storage rules
//    (this project doesn't use Firestore, so there's nothing else
//    to lock down).
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// TODO: Replace with your own Firebase project config.
const firebaseConfig = {
  apiKey: "AIzaSyBMBaeYL0_vDTfqDmZppXLoFi8HsTgwcRE",
  authDomain: "alsaflix.firebaseapp.com",
  projectId: "alsaflix",
  storageBucket: "alsaflix.firebasestorage.app",
  messagingSenderId: "769682706717",
  appId: "1:769682706717:web:875ad45ab371062fa911f4",
  measurementId: "G-H2CNFT813Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };