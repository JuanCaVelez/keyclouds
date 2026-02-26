import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyALVwZYrN2Z7ReIJqhFBfkm-qeic49cYGo",
  authDomain: "keyclouds-42396.firebaseapp.com",
  projectId: "keyclouds-42396",
  storageBucket: "keyclouds-42396.firebasestorage.app",
  messagingSenderId: "378158567334",
  appId: "1:378158567334:web:fde35e1cfd37f7d1f18967"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };