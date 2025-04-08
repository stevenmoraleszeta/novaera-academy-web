// src/context/AuthContext.js
"use client"; // Indica que este componente se ejecuta en el cliente

import React, { useContext, useState, useEffect, createContext } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, googleProvider, signInWithPopup } from "../firebase/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore"; // Importar funciones de Firestore
import { db } from "../firebase/firebase";
import { useRouter } from "next/navigation";


// Crear el contexto de autenticación
const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

// Componente proveedor de autenticación
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [missingInfo, setMissingInfo] = useState(null); // Inicializa en null para evitar redirecciones prematuras
    const [isCheckingUser, setIsCheckingUser] = useState(false); // new information checker 
    const router = useRouter();

    // Manejar el cambio de estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true); // Indica que la aplicación está cargando
            if (user) {
                setIsCheckingUser(true);
                await checkUserInFirestore(user);
                setCurrentUser(user);
                setIsCheckingUser(false);
            } else {
                setCurrentUser(null);
                setMissingInfo(null); // Reinicia el estado si no hay usuario
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Función para iniciar sesión con Google
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setCurrentUser(result.user);
            console.log("Usuario autenticado:");

            setIsCheckingUser(true);
            await checkUserInFirestore(result.user);
            setIsCheckingUser(false);
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
        }
    };

    // **Función para iniciar sesión con email y contraseña**
    const loginWithEmailAndPassword = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setCurrentUser(userCredential.user);

        } catch (error) {
            console.error("Error al iniciar sesión con email y contraseña:", error.message);
            throw error;
        }
    };





    // Función para crear usuario con email, contraseña y nombre completo
    const registerWithEmailAndPassword = async (email, password, name, profilePicture) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            let photoURL = "";

            if (profilePicture) {
                // Subir la imagen a Firebase Storage
                const storageRef = ref(storage, v4());
                await uploadBytes(storageRef, profilePicture);
                photoURL = await getDownloadURL(storageRef); // Obtener la URL de la imagen subida
            }

            // Actualizar el nombre y la foto en el perfil del usuario
            await updateProfile(user, { displayName: name, photoURL });

            // Guardar en Firestore
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                displayName: name,
                email: user.email,
                photoURL, // URL de la foto de perfil
                role: "student", // Rol por defecto
                pais: "",
                number: "",
                edad: "",
            });

            setCurrentUser(user);
            setIsAdmin(false);
            setMissingInfo(true); // Se considera que faltan los datos adicionales
            console.log("Usuario registrado exitosamente con foto de perfil");
        } catch (error) {
            console.error("Error al registrar usuario:", error.message);
            if (error.code === "auth/email-already-in-use") {
                throw new Error("El correo ya está registrado. Intenta con otro.");
            } else {
                throw new Error("Error al registrar usuario. Inténtalo de nuevo.");
            }
        }
    };


    // **Función para cerrar sesión**
    const logout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            console.log("Sesión cerrada");
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
        }
    };




    const checkUserInFirestore = async (user) => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();

                setIsAdmin(userData.role === "admin");
                setMissingInfo(
                    !userData.pais?.trim() || !userData.number?.trim() || !userData.edad?.trim() // makes sure all this data is being store in the DB
                );
            } else {


                const estudiantesQuery = query(collection(db, "estudiantes"), where("userId", "==", user.uid));
                const estudiantesSnapshot = await getDocs(estudiantesQuery);

                let estudianteDocRef;
                if (estudiantesSnapshot.empty) {

                    estudianteDocRef = await addDoc(collection(db, "estudiantes"), {
                        userId: user.uid,
                        createdAt: new Date(),
                        nombreCompleto: "",
                        edad: "",
                        number: "",
                        email: "",
                        curso: "",
                        ocupacion: "",
                        estiloAprendizaje: "",
                        Intereses: "",
                        nivelInicial: "",
                        objetivosIndividuales: "",
                    });
                } else {
                    estudianteDocRef = estudiantesSnapshot.docs[0].ref;
                }

                await setDoc(userDocRef, {
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    role: "student",
                    pais: "",
                    number: "",
                    edad: "",
                    estudianteId: estudianteDocRef.id,
                });
                setIsAdmin(false);
                setMissingInfo(true);
                console.log("Usuario agregado a Firestore");
            }
        } catch (error) {
            console.error("Error verificando usuario en Firestore:", error);
        }
    };

    // if loading and is checking user is different from true, will push the user to the complete information page 
    useEffect(() => {
        if (!loading && !isCheckingUser) {
            if (currentUser && missingInfo) {
                router.push("/completeInfoPage");
            }
        }
    }, [currentUser, missingInfo, loading, isCheckingUser, router]);

    const value = {
        currentUser,
        loginWithGoogle,
        loginWithEmailAndPassword,
        registerWithEmailAndPassword,
        logout,
        updateCurrentUser: setCurrentUser,
        isAdmin,
        missingInfo,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}  