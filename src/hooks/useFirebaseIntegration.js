"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCurrentFirebaseUser, ensureFirebaseAuth } from '@/utils/firebaseAuthCustom';

/**
 * Hook para integración con Firebase
 * Maneja la autenticación automática cuando se necesiten servicios de Firebase
 */
export function useFirebaseIntegration() {
    const { firebaseUser, currentUser, setFirebaseUser } = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Asegurar que el usuario esté autenticado en Firebase
     * Se conecta automáticamente si es necesario
     */
    const ensureFirebaseConnection = async () => {
        try {
            setError(null);
            setIsConnecting(true);

            // Si no hay usuario en tu sistema, no puede usar Firebase
            if (!currentUser) {
                throw new Error('Debes estar autenticado en el sistema para usar Firebase');
            }

            // Si ya está conectado a Firebase, retornar usuario actual
            if (firebaseUser) {
                return firebaseUser;
            }

            // Intentar conectar/reconectar a Firebase
            const firebaseUserConnected = await ensureFirebaseAuth();
            setFirebaseUser(firebaseUserConnected);

            return firebaseUserConnected;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsConnecting(false);
        }
    };

    /**
     * Verificar estado de conexión sin intentar conectar
     */
    const checkFirebaseConnection = () => {
        const currentFirebaseUser = getCurrentFirebaseUser();
        return {
            isConnected: !!currentFirebaseUser,
            user: currentFirebaseUser,
            canConnect: !!currentUser
        };
    };

    /**
     * Wrapper para ejecutar funciones que requieren Firebase
     */
    const withFirebaseAuth = async (firebaseFunction) => {
        try {
            await ensureFirebaseConnection();
            return await firebaseFunction();
        } catch (error) {
            console.error('Error ejecutando función Firebase:', error);
            throw error;
        }
    };

    return {
        firebaseUser,
        isConnecting,
        error,
        ensureFirebaseConnection,
        checkFirebaseConnection,
        withFirebaseAuth,
        clearError: () => setError(null)
    };
}
