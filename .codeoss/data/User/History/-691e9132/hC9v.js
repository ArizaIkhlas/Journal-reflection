import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Replace with your Web App Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_PUBLIC_API_KEY", // Public Firebase Identification Key (Safe)
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const FUNCTION_URL = "https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/analyzeAndSaveJournal";

// DOM Elements
const authSec = document.getElementById("auth-section");
const appSec = document.getElementById("app-section");
const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");
const btnSave = document.getElementById("btn-save");
const journalInput = document.getElementById("journal-input");
const insightBox = document.getElementById("insight-box");
const insightText = document.getElementById("insight-text");
const entriesContainer = document.getElementById("entries-container");

// 1. Auth Event Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    authSec.classList.add("hidden");
    appSec.classList.remove("hidden");
    document.getElementById("user-email").innerText = user.email;
    loadJournalEntries(user.uid);
  } else {
    authSec.classList.remove("hidden");
    appSec.classList.add("hidden");
  }
});

btnLogin.onclick = () => signInWithPopup(auth, new GoogleAuthProvider());
btnLogout.onclick = () => signOut(auth);

// 2. Submit Entry to Cloud Function Backend
btnSave.onclick = async () => {
  const text = journalInput.value.trim();
  if (!text) return alert("Please enter text.");

  btnSave.disabled = true;
  btnSave.innerText = "Analyzing with Gemini...";

  try {
    const idToken = await auth.currentUser.getIdToken();
    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify({ text })
    });

    const data = await res.json();
    if (res.ok) {
      insightText.innerText = data.insight;
      insightBox.classList.remove("hidden");
      journalInput.value = "";
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Request failed.");
  } finally {
    btnSave.disabled = false;
    btnSave.innerText = "Analyze & Save Entry";
  }
};

// 3. Live Updates from Firestore
function loadJournalEntries(uid) {
  const q = query(
    collection(db, "users", uid, "journal_entries"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    entriesContainer.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <small>${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : "Just now"}</small>
        <p><strong>Note:</strong> ${data.content}</p>
        <p><em><strong>Gemini Reflection:</strong> ${data.aiInsight}</em></p>
      `;
      entriesContainer.appendChild(div);
    });
  });
}