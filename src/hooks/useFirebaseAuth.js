"use client";

import { useState, useEffect } from 'react';
import {
    getCurrentFirebaseUser,
    onAuthStateChanged,
    loginOnlyFirebase,
    signOutFirebase
} from '../utils/firebaseAuthCustom';

export function useFirebaseAuth() {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obtener el usuario actual al montar el componente
        const currentUser = getCurrentFirebaseUser();
        setFirebaseUser(currentUser);
        setLoading(false);

        // Escuchar cambios en el estado de autenticación
        const unsubscribe = onAuthStateChanged((user) => {
            setFirebaseUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithCredentials = async (email, password) => {
        try {
            const result = await loginOnlyFirebase(email, password);
            return result;
        } catch (error) {
            console.error('Error en login Firebase:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOutFirebase();
        } catch (error) {
            console.error('Error en logout Firebase:', error);
            throw error;
        }
    };

    return {
        firebaseUser,
        loading,
        loginWithCredentials,
        logout,
        isAuthenticated: !!firebaseUser
    };
}
