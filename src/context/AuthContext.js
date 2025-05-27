// src/context/AuthContext.js
"use client"; // Indica que este componente se ejecuta en el cliente

import React, { useContext, useState, useEffect, createContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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
    const [missingInfo, setMissingInfo] = useState(null);
    const router = useRouter();

    // nuevo manejo del cambio de estado de autenticación
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setCurrentUser(null);
                    setLoading(false);
                    return;
                }
                console.log("Token:", token);
                const response = await axios.get("http://localhost:4000/api/users/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const user = response.data;
                setCurrentUser(user);
                setIsAdmin(user.namerole === "Admin");
                setMissingInfo(!user.country || !user.phone || !user.age);
            } catch (error) {
                console.error("Error fetching current user:", error.response?.data?.error || error.message);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    // Función para iniciar sesión con email y contraseña
    const loginWithEmailAndPassword = async (email, password) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                email,
                password,
            });

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            setCurrentUser(user);

            setIsAdmin(user.namerole === "Admin");

            setMissingInfo(!user.country || !user.phone || !user.age);
        } catch (error) {
            console.error("Error al iniciar sesión:", error.response?.data?.error || error.message);
            throw error;
        }
    };


    const registerWithEmailAndPassword = async (email, password, name, profilePicture) => {
        try {
            let photoUrl = "";

            if (profilePicture) {
                const formData = new FormData();
                formData.append("file", profilePicture);

                const uploadResponse = await axios.post("http://localhost:4000/api/upload", formData);
                photoUrl = uploadResponse.data.url;
            }

            const response = await axios.post("http://localhost:4000/api/users", {
                email,
                password,
                firstName: name,
                photoUrl,
                roleId: 2, // Asignar un rol student por defecto
            });

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            setCurrentUser(user);
            setIsAdmin(false);
            setMissingInfo(true);
        } catch (error) {
            console.error("Error al registrar usuario:", error.response?.data?.error || error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:4000/api/logout",
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            localStorage.removeItem("token");
            setCurrentUser(null);
        } catch (error) {
            console.error("Error al cerrar sesión:", error.response?.data?.error || error.message);
        }
    };

    useEffect(() => {
        if (!loading && currentUser && missingInfo) {
            router.push("/");
        }
    }, [currentUser, missingInfo, loading, router]);

    const value = {
        currentUser,
        loginWithEmailAndPassword,
        registerWithEmailAndPassword,
        logout,
        updateCurrentUser: setCurrentUser,
        isAdmin,
        missingInfo,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}



/* 

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



*/