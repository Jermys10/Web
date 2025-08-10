import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAIzpzXSWp5cOByf_4nYx0Na0X58ELRthw",
  authDomain: "redsocial-7b0fd.firebaseapp.com",
  projectId: "redsocial-7b0fd",
  storageBucket: "redsocial-7b0fd.appspot.com", // CORREGIDO: .appspot.com
  messagingSenderId: "82200026282",
  appId: "1:82200026282:web:4d4ff86ec08f6759c584d3",
  measurementId: "G-7TPP7J06T5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
