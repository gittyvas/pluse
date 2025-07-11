// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzigpJFzjVjnlBWyxsSnoKVQTZr-Sp0PM",
  authDomain: "pulse-crm-60584.firebaseapp.com",
  projectId: "pulse-crm-60584",
  storageBucket: "pulse-crm-60584.firebasestorage.app",
  messagingSenderId: "654113465230",
  appId: "1:654113465230:web:e4a42ce51e54d37e087adf",
  measurementId: "G-36FTVJDRGN" // Added measurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

