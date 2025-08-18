// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCj4bvaHnTbdOiAvhMf0HJ3zg_Y08XdgVk",
  authDomain: "iei-fcirt.firebaseapp.com",
  projectId: "iei-fcirt",
  storageBucket: "iei-fcirt.appspot.com",
  messagingSenderId: "692760351112",
  appId: "1:692760351112:web:c0505b61ecd1e90d48ea3d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);