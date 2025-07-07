"use client"; // Indica que este componente se ejecuta en el cliente

import React, { useContext, useState, useEffect, createContext, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    loginPersonalizado,
    signOutFirebase,
    onAuthStateChanged,
    signInWithCustomTokenFirebase,
    ensureFirebaseAuth,
    getCurrentFirebaseUser
} from "../utils/firebaseAuthCustom";

// Crear el contexto de autenticación
const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

// Componente proveedor de autenticación
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isCheckingUser, setIsCheckingUser] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [missingInfo, setMissingInfo] = useState(null);
    const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
    const [firebaseUser, setFirebaseUser] = useState(null);
    const router = useRouter();

    const isGoogleLoginRef = useRef(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token || token === "undefined" || token === "null" || token.trim() === "") {
                    localStorage.removeItem("token");
                    setCurrentUser(null);
                    setIsCheckingUser(false);
                    return;
                }
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
                const response = await axios.get(`${apiUrl}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const user = response.data;
                setCurrentUser(user);
                setIsAdmin(user.firstname === 'AdminAccount' || user.roleid === 8); // asume que el rol de admin tiene roleid 8
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    setCurrentUser(null);
                }
                console.error("Error fetching current user:", error.response?.data?.error || error.message);
            } finally {
                setIsCheckingUser(false);
            }
        };

        fetchCurrentUser();
    }, []);


    useEffect(() => {
        if (!isCheckingUser && currentUser) {
            let infoIsMissing;
            if (isNewGoogleUser) {
                infoIsMissing = false;
                setIsNewGoogleUser(false);
            } else {
                infoIsMissing = !currentUser.firstname ||
                    !currentUser.lastname1 ||
                    !currentUser.country ||
                    !currentUser.phone ||
                    (currentUser.age === null || currentUser.age === undefined);
            }

            setMissingInfo(infoIsMissing);

            if (infoIsMissing) {
                router.push("/completeInfo");
            } 
            // else {
                // router.push('/');
            // }
        } else if (!isCheckingUser && !currentUser) {
            setMissingInfo(false);
            router.push('/');
        }
    }, [currentUser, isCheckingUser, isNewGoogleUser, router]);


    // Función para iniciar sesión con email y contraseña

    // Escuchar cambios en Firebase Auth
    useEffect(() => {
        const unsubscribe = onAuthStateChanged((user) => {
            setFirebaseUser(user);
            if (user) {
                console.log("Usuario autenticado en Firebase:", user.uid);
            } else {
                console.log("Usuario no autenticado en Firebase");
            }
        });

        return () => unsubscribe();
    }, []);

    // Función para iniciar sesión con email y contraseña (incluye Firebase)

    const loginWithEmailAndPassword = async (email, password) => {
        isGoogleLoginRef.current = false;
        try {
            const result = await loginPersonalizado(email.trim().toLowerCase(), password);
            const { token, user, firebaseUser } = result;

            localStorage.setItem("token", token);
            setCurrentUser(user);
            setFirebaseUser(firebaseUser || null);

            setIsAdmin(user.firstname === 'AdminAccount' || user.roleid === 8);

            // Calcular si falta información usando la misma lógica que en otros lugares
            const infoIsMissing = !user.firstname ||
                !user.lastname1 ||
                !user.country ||
                !user.phone ||
                (user.age === null || user.age === undefined);
            setMissingInfo(infoIsMissing);

        } catch (error) {
            console.error("Error al iniciar sesión:", error.message);
            throw error;
        }
    };

    const loginWithGoogle = () => {
        isGoogleLoginRef.current = true;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const googleAuthUrl = `${apiUrl.replace('/api', '')}/auth/google`;
        const width = 500, height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2.5;
        const popup = window.open(
            googleAuthUrl,
            "GoogleLogin",
            `width=${width},height=${height},left=${left},top=${top}`
        );

        // Escucha el mensaje del popup con el token
        const handleMessage = async (event) => {
            // Cambiar esto cuando el backend está en otro dominio
            if (!event.origin.includes(process.env.NEXT_PUBLIC_API_URL.replace('/api', ''))) return;

            const { token, user, isNewUser, firebaseToken } = event.data;

            if (token && user) {
                if (isNewUser) {
                    setIsNewGoogleUser(true);
                }

                localStorage.setItem("token", token);
                setCurrentUser(user);
                setIsAdmin(user.firstname === 'AdminAccount' || user.roleid === 8);

                // Calcular si falta información usando la misma lógica consistente
                const infoIsMissing = !user.firstname ||
                    !user.lastname1 ||
                    !user.country ||
                    !user.phone ||
                    (user.age === null || user.age === undefined);
                setMissingInfo(infoIsMissing);

                // Si hay firebaseToken, autenticar en Firebase
                if (firebaseToken) {
                    try {
                        const firebaseUser = await signInWithCustomTokenFirebase(firebaseToken);
                        setFirebaseUser(firebaseUser);
                    } catch (error) {
                        console.error("Error autenticando en Firebase:", error);
                    }
                }

                popup.close();

                window.removeEventListener("message", handleMessage);
            }
        };

        window.addEventListener("message", handleMessage);
    };

    const registerWithEmailAndPassword = async (email, password, name, profilePicture) => {
        try {
            let photoUrl = "";

            if (profilePicture) {
                const formData = new FormData();
                formData.append("file", profilePicture);

                const uploadResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData);
                photoUrl = uploadResponse.data.url;
            }

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                email,
                password,
                firstName: name,
                photoUrl,
                roleId: 9, // Asignar un rol student por defecto
            });

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            setCurrentUser(user);
            setIsAdmin(false);
            // setMissingInfo(true);
        } catch (error) {
            console.error("Error al registrar usuario:", error.response?.data?.error || error.message);
            throw error;
        }
    };

    // Función para actualizar el usuario actual
    const updateCurrentUser = (updatedUser) => {
        setCurrentUser(updatedUser);

        // Actualizar también los estados derivados
        if (updatedUser) {
            setIsAdmin(updatedUser.firstname === 'AdminAccount' || updatedUser.roleid === 8);

            // Recalcular si falta información
            const infoIsMissing = !updatedUser.firstname ||
                !updatedUser.lastname1 ||
                !updatedUser.country ||
                !updatedUser.phone ||
                (updatedUser.age === null || updatedUser.age === undefined);
            setMissingInfo(infoIsMissing);
        } else {
            setIsAdmin(false);
            setMissingInfo(false);
        }
    };


    // funcion para recuperar contraseña!!!
    const sendPasswordResetRequest = async (email) => {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/request-password-reset`, { email });
        } catch (error) {
            console.error("Error al solicitar el reseteo de contraseña:", error.response?.data?.error || error.message);
            throw error;
        }
    };


    //Funcion para cambiar la contreseña manteniendo el token 
    const resetPasswordWithToken = async (token, newPassword) => {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, { token, newPassword });
        } catch (error) {
            console.error("Error al cambiar la contraseña:", error.response?.data?.error || error.message);
            throw error;
        }
    };


    

    const logout = async () => {
        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            localStorage.removeItem("token");
            setCurrentUser(null);

            // Cerrar sesión en Firebase también
            try {
                await signOutFirebase();
                setFirebaseUser(null);
            } catch (firebaseError) {
                console.error("Error cerrando sesión en Firebase:", firebaseError);
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error.response?.data?.error || error.message);
        }
    };


    // Función para asegurar autenticación en Firebase cuando sea necesaria
    const ensureFirebaseAuthentication = async () => {
        try {
            const firebaseUser = await ensureFirebaseAuth();
            setFirebaseUser(firebaseUser);
            return firebaseUser;
        } catch (error) {
            console.error("Error asegurando autenticación Firebase:", error);
            throw error;
        }
    };

    const value = {
        currentUser,
        loginWithEmailAndPassword,
        registerWithEmailAndPassword,
        logout,
        updateCurrentUser, // Usar la nueva función
        isAdmin,
        missingInfo,
        loginWithGoogle,
        isCheckingUser,
        firebaseUser,
        setFirebaseUser,
        ensureFirebaseAuthentication, 
        sendPasswordResetRequest, 
        resetPasswordWithToken
    };

    return <AuthContext.Provider value={value}>{!isCheckingUser && children}</AuthContext.Provider>;
}