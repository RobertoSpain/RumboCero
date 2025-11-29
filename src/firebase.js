// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDv-8Cyuxkjg4JVzsipp-avoovTAGNkcpM",
  authDomain: "proyecto-fct-roberto.firebaseapp.com",
  projectId: "proyecto-fct-roberto",
  storageBucket: "proyecto-fct-roberto.firebasestorage.app",
  messagingSenderId: "622521611256",
  appId: "1:622521611256:web:41df14b1f87b8ed0c2dc0d",
  measurementId: "G-DNF04GPNR9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app); 

// Exportamos todos los servicios, incluyendo 'db'
export { app, analytics, auth, db }; 