// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUNYnbB7Efkr3h3Lric9INjE7_PBn1VDQ",
  authDomain: "game1-5e569.firebaseapp.com",
  projectId: "game1-5e569",
  storageBucket: "game1-5e569.firebasestorage.app",
  messagingSenderId: "1039720116965",
  appId: "1:1039720116965:web:418f8388a52663ca635a0c",
  measurementId: "G-FK4YNH72H8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);