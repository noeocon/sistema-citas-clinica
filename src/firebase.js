// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtG_jphfhqNRWejWUMnGFzH_luJCAuNuE",
  authDomain: "doctor-app-6a11a.firebaseapp.com",
  projectId: "doctor-app-6a11a",
  storageBucket: "doctor-app-6a11a.firebasestorage.app",
  messagingSenderId: "94528136820",
  appId: "1:94528136820:web:fa803c9982b6e4c1315321",
  measurementId: "G-EMMN8SNXM2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);