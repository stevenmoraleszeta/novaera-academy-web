import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useFirebaseIntegration } from "../hooks/useFirebaseIntegration";
import app from "../firebase/firebase";

const storage = getStorage(app);

/**
 * Ejemplo de cómo usar Firebase Storage con custom tokens
 * Esta función muestra el patrón a seguir para cualquier operación de Firebase
 */
export async function uploadFileExample(file, folder = 'uploads') {
    try {
        // Asegurar conexión a Firebase
        const { ensureFirebaseConnection } = useFirebaseIntegration();
        const firebaseUser = await ensureFirebaseConnection();

        // Realizar operación de Firebase Storage
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const filePath = `${folder}/${firebaseUser.uid}/${fileName}`;

        const fileRef = ref(storage, filePath);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('Archivo subido exitosamente:', downloadURL);

        return {
            url: downloadURL,
            path: filePath,
            name: fileName
        };

    } catch (error) {
        console.error('Error subiendo archivo:', error);
        throw error;
    }
}

/**
 * Hook personalizado para usar Firebase Storage con custom tokens
 */
export function useFirebaseStorageWithAuth() {
    const { withFirebaseAuth } = useFirebaseIntegration();

    const uploadFile = async (file, folder = 'uploads') => {
        return withFirebaseAuth(async () => {
            return await uploadFileExample(file, folder);
        });
    };

    // Podemos usar más funciones aquí: deleteFile, listFiles, u otras

    return {
        uploadFile
        // luego retornar aqui
    };
}

/**
 * Ejemplo de uso:
 * 
 * function Component() {
 *     const { uploadFile } = useFirebaseStorageWithAuth();
 *     
 *     const handleFileUpload = async (file) => {
 *         try {
 *             const result = await uploadFile(file, 'my-folder');
 *             console.log('Archivo subido:', result.url);
 *         } catch (error) {
 *             console.error('Error:', error.message);
 *         }
 *     };
 *     
 *     return (
 *         <input 
 *             type="file" 
 *             onChange={(e) => handleFileUpload(e.target.files[0])} 
 *         />
 *     );
 * }
 */
