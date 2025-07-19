// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAo9y8XqwfFxJaSZ-POdrPv0uDXQxxgpBo",
  authDomain: "repcode-84a8f.firebaseapp.com",
  projectId: "repcode-84a8f",
  storageBucket: "repcode-84a8f.firebasestorage.app",
  messagingSenderId: "852115837761",
  appId: "1:852115837761:web:172772f797684f597a07c0",
  measurementId: "G-NMVQRN2ZWR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);