import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";
import { app } from '../firebase/firebase';

const auth = getAuth(app);

/**
 * Función para autenticar con custom token de Firebase
 * @param {string} firebaseToken - Custom token generado por el backend
 * @returns {Promise<Object>} - Usuario autenticado de Firebase
 */
export async function signInWithCustomTokenFirebase(firebaseToken) {
    try {
        const userCredential = await signInWithCustomToken(auth, firebaseToken);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in with custom token:", error);
        throw error;
    }
}

/**
 * Función para hacer login completo (Novaera API + Firebase)
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} - Resultado del login con tokens y usuario
 */
export async function loginPersonalizado(email, password) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

        // Hacer login con el API y obtener Firebase custom token
        const response = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en el login');
        }

        const data = await response.json();

        // Si hay firebaseToken entonces autenticar con Firebase
        if (data.firebaseToken) {
            try {
                const firebaseUser = await signInWithCustomTokenFirebase(data.firebaseToken);
                console.log("Usuario autenticado en Firebase:", firebaseUser.uid);

                // Guardar el token en localStorage para uso futuro
                localStorage.setItem('firebaseCustomToken', data.firebaseToken);

                return {
                    ...data,
                    firebaseUser
                };
            } catch (firebaseError) {
                console.warn("Login exitoso en API, pero fallo en Firebase:", firebaseError.message);
                // Continuar sin Firebase, el usuario puede seguir usando el sistema
                return data;
            }
        }

        return data;
    } catch (error) {
        console.error("Error en login personalizado:", error);
        throw error;
    }
}

/**
 * Función para hacer login solo para obtener Firebase custom token
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} - Firebase user y custom token
 */
export async function loginOnlyFirebase(email, password) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

        const response = await fetch(`${apiUrl}/auth/firebase-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error obteniendo Firebase token');
        }

        const data = await response.json();

        // Autenticar en Firebase con el custom token
        const firebaseUser = await signInWithCustomTokenFirebase(data.firebaseToken);

        return {
            firebaseUser,
            user: data.user,
            firebaseToken: data.firebaseToken
        };
    } catch (error) {
        console.error("Error en login Firebase:", error);
        throw error;
    }
}

/**
 * Función para cerrar sesión de Firebase
 */
export async function signOutFirebase() {
    try {
        await signOut(auth);
        localStorage.removeItem('firebaseCustomToken');
        console.log("Sesión cerrada en Firebase");
    } catch (error) {
        console.error("Error cerrando sesión en Firebase:", error);
        throw error;
    }
}

/**
 * Reconectar a Firebase usando el token guardado
 * Útil cuando el usuario necesita usar Firebase Storage
 */
export async function reconnectToFirebase() {
    try {
        const currentUser = getCurrentFirebaseUser();
        if (currentUser) {
            console.log("Usuario ya autenticado en Firebase:", currentUser.uid);
            return currentUser;
        }

        const savedToken = localStorage.getItem('firebaseCustomToken');
        if (!savedToken) {
            throw new Error('No hay token de Firebase guardado. Inicia sesión nuevamente.');
        }

        const firebaseUser = await signInWithCustomTokenFirebase(savedToken);
        console.log("Reconectado a Firebase:", firebaseUser.uid);
        return firebaseUser;

    } catch (error) {
        console.warn("No se pudo reconectar a Firebase:", error.message);
        localStorage.removeItem('firebaseCustomToken');
        throw error;
    }
}

/**
 * Verificar si el usuario está autenticado en Firebase o puede reconectarse
 */
export async function ensureFirebaseAuth() {
    try {
        const currentUser = getCurrentFirebaseUser();
        if (currentUser) {
            return currentUser;
        }

        return await reconnectToFirebase();
    } catch (error) {
        throw new Error('Se requiere autenticación en Firebase. Por favor, inicia sesión nuevamente.');
    }
}

/**
 * Obtener el usuario actual de Firebase
 */
export function getCurrentFirebaseUser() {
    return auth.currentUser;
}

/**
 * Escuchar cambios en el estado de autenticación de Firebase
 */
export function onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
}

export { auth };
