"use client"; // Indica que este componente se ejecuta en el cliente

import React, { useContext, useState, useEffect, createContext, useRef } from "react";
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
    const [isCheckingUser, setIsCheckingUser] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [missingInfo, setMissingInfo] = useState(null);
    const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
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
            }else{
                router.push('/');
            }
        } else if (!isCheckingUser && !currentUser) {
            setMissingInfo(false);
        }
    }, [currentUser, isCheckingUser, isNewGoogleUser, router]);


    // Función para iniciar sesión con email y contraseña
    const loginWithEmailAndPassword = async (email, password) => {
        isGoogleLoginRef.current = false;
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                email: email.trim().toLowerCase(),
                password,
            });

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            setCurrentUser(user);

            setIsAdmin(user.firstname === 'AdminAccount' || user.roleid === 8);
        } catch (error) {
            console.error("Error al iniciar sesión:", error.response?.data?.error || error.message);
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
            const { token, user, isNewUser } = event.data;
            if (token && user) {
                if(isNewUser){
                    setIsNewGoogleUser(true);
                }

                localStorage.setItem("token", token);
                setCurrentUser(user);
                setIsAdmin(user.firstname === 'AdminAccount' || user.roleid === 8);
                // popup.close();
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

    const logout = async () => {
        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/logout`,
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

    const value = {
        currentUser,
        loginWithEmailAndPassword,
        registerWithEmailAndPassword,
        logout,
        updateCurrentUser: setCurrentUser,
        isAdmin,
        missingInfo,
        loginWithGoogle,
        isCheckingUser,
    };

    return <AuthContext.Provider value={value}>{!isCheckingUser && children}</AuthContext.Provider>;
}