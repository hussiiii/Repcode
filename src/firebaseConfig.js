// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQHmA0XPSOZKHvAn2cyXYk84RC-LzCO_c",
  authDomain: "flashcode-dummy.firebaseapp.com",
  projectId: "flashcode-dummy",
  storageBucket: "flashcode-dummy.firebasestorage.app",
  messagingSenderId: "956824887489",
  appId: "1:956824887489:web:79f73aba04e8d22af7b440"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);