import { auth } from '@/firebase/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import axios from 'axios';

/**
 * Autentica al usuario con Firebase usando un token personalizado
 */
export const authenticateWithFirebase = async () => {
    try {
        // Obtener el token JWT del localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }

        // Solicitar un custom token desde tu backend
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/firebase-token`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        const { firebaseToken } = response.data;
        
        // Autenticar con Firebase usando el custom token
        const userCredential = await signInWithCustomToken(auth, firebaseToken);
        return userCredential.user;
    } catch (error) {
        console.error('Error authenticating with Firebase:', error);
        throw error;
    }
};

/**
 * Verifica si el usuario está autenticado con Firebase
 */
export const isFirebaseAuthenticated = () => {
    return auth.currentUser !== null;
};

/**
 * Obtiene el usuario actual de Firebase
 */
export const getCurrentFirebaseUser = () => {
    return auth.currentUser;
};
