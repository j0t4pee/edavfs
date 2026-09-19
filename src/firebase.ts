import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBcurDP4wJA1WIbOEZAkbIf7EMfas4IV-w",
  authDomain: "edav-d9100.firebaseapp.com",
  projectId: "edav-d9100",
  storageBucket: "edav-d9100.firebasestorage.app",
  messagingSenderId: "894859704165",
  appId: "1:894859704165:web:9c1638350e5a5e0bc7d38c",
  measurementId: "G-YLH0BZ0920"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 