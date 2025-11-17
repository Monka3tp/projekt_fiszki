import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyD-cVh2Q2Hw1Io7eZgygdoN3xybwQ0hvBQ",

  authDomain: "fisz-8e1d1.firebaseapp.com",

  projectId: "fisz-8e1d1",

  storageBucket: "fisz-8e1d1.firebasestorage.app",

  messagingSenderId: "1013207585761",

  appId: "1:1013207585761:web:b97e282a00529bd0ed78a0"

};


// initialize once (safe for hot reload / multiple imports)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;