import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsMMnBxmbjWKMjbo7LgHSxkXvsiAFqECQ",
  authDomain: "cng1-52988.firebaseapp.com",
  projectId: "cng1-52988",
  storageBucket: "cng1-52988.firebasestorage.app",
  messagingSenderId: "571737901914",
  appId: "1:571737901914:web:3063630d441b07b9b84163",
  measurementId: "G-H30941HNR5"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db)
    .then(() => console.log("✅ Offline persistence enabled"))
    .catch((err) => console.warn("⚠️ Persistence error:", err.code));
}

export default app;
