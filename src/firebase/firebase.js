// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDibclTFuQDBSVTpFvUJ2vwtZRcsggDYf4",
    authDomain: "zeta-3a31d.firebaseapp.com",
    projectId: "zeta-3a31d",
    storageBucket: "zeta-3a31d.appspot.com",
    messagingSenderId: "40990344122",
    appId: "1:40990344122:web:8f77a29b547de928b71383",
    measurementId: "G-RZJEYWP11R"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa el servicio de autenticación
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Inicializa Firestore
const db = getFirestore(app);

// Inicializa Firebase Storage
const storage = getStorage(app);

// Exporta los servicios necesarios
export { app, auth, db, storage, googleProvider, signInWithPopup };
