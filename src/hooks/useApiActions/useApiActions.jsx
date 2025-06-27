import { useCallback } from 'react';
import axios from 'axios';

export const useApiActions = ({ collectionName, idField, refetch, closeModal, closeConfirmation }) => {
    const saveItem = useCallback(async (item, isEditMode) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const token = localStorage.getItem("token");
            const url = isEditMode ? `${apiUrl}/${collectionName}/${item[idField]}` : `${apiUrl}/${collectionName}`;
            const method = isEditMode ? 'PUT' : 'POST';

            await axios({ method, url, data: item, headers: { Authorization: `Bearer ${token}` } });

            refetch();
            if (closeModal) closeModal();
            
        } catch (error) {
            console.error("Error al guardar el elemento:", error);
            alert("Error al guardar: " + (error.response?.data?.message || error.message));
        }
    }, [collectionName, idField, refetch, closeModal]);

    const deleteItem = useCallback(async (itemToDelete) => {
        try {
            if (!itemToDelete || !itemToDelete[idField]) {
                console.error("No se puede eliminar: el item o su ID no está definido.");
                if (closeConfirmation) closeConfirmation();
                return;
            }
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            await axios.delete(`${apiUrl}/${collectionName}/${itemToDelete[idField]}`);

            refetch();
            if (closeConfirmation) closeConfirmation();

        } catch (error) {
            console.error("Error al eliminar el elemento:", error);
            alert("Error al eliminar: " + (error.response?.data?.message || error.message));
        }
    }, [collectionName, idField, refetch, closeConfirmation]); 

    return { saveItem, deleteItem };
};