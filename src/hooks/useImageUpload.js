import { useState } from 'react';
import { storage } from '@/firebase/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { validateImage, compressImage, generateUniqueFileName } from '@/utils/imageUtils';
import { authenticateWithFirebase, isFirebaseAuthenticated } from '@/utils/firebaseStorageAuth';

export const useImageUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const uploadImage = async (file, userId) => {
        if (!file) {
            throw new Error('No file provided');
        }

        setUploading(true);
        setError(null);

        try {
            // Verificar si el usuario está autenticado con Firebase
            if (!isFirebaseAuthenticated()) {
                console.log('Usuario no autenticado con Firebase, autenticando...');
                await authenticateWithFirebase();
            }

            const validation = await validateImage(file);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(' '));
            }

            // Comprimir imagen si es necesario
            const compressedFile = await compressImage(file);
            const finalFile = compressedFile || file;

            // Crear referencia única para el archivo
            const fileName = generateUniqueFileName(file.name, userId);
            const imageRef = ref(storage, `profile-images/${fileName}`);

            // Subir archivo
            const snapshot = await uploadBytes(imageRef, finalFile);

            // Obtener URL de descarga
            const downloadURL = await getDownloadURL(snapshot.ref);

            setUploading(false);
            return downloadURL;
        } catch (err) {
            setUploading(false);
            setError(err.message);
            throw err;
        }
    };

    const deleteImage = async (imageUrl) => {
        try {
            const url = new URL(imageUrl);
            const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
            const imageRef = ref(storage, path);

            // Eliminar archivo
            await deleteObject(imageRef);
        } catch (err) {
            console.error('Error deleting image:', err);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return {
        uploadImage,
        deleteImage,
        clearError,
        uploading,
        error
    };
};
