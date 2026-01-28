import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtG_jphfhqNRWejWUMnGFzH_luJCAuNuE",
  authDomain: "doctor-app-6a11a.firebaseapp.com",
  projectId: "doctor-app-6a11a",
  storageBucket: "doctor-app-6a11a.firebasestorage.app",
  messagingSenderId: "94528136820",
  appId: "1:94528136820:web:fa803c9982b6e4c1315321",
  measurementId: "G-EMMN8SNXM2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar la base de datos para usarla en App.js
export const db = getFirestore(app);