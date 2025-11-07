// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-cVh2Q2Hw1Io7eZgygdoN3xybwQ0hvBQ",
  authDomain: "fisz-8e1d1.firebaseapp.com",
  projectId: "fisz-8e1d1",
  storageBucket: "fisz-8e1d1.firebasestorage.app",
  messagingSenderId: "1013207585761",
  appId: "1:1013207585761:web:b97e282a00529bd0ed78a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
