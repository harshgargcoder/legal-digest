import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAibinS3rWf_Q03VF-tv2nVlb0T24nxy7c",
  authDomain: "legaldigest-6288.firebaseapp.com",
  projectId: "legaldigest-6288",
  storageBucket: "legaldigest-6288.firebasestorage.app",
  messagingSenderId: "894612942958",
  appId: "1:894612942958:web:0aea9d14541882551a367f",
  measurementId: "G-BS5J0RXYPJ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
