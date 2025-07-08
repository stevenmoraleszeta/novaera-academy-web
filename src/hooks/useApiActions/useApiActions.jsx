import { useCallback } from 'react';
import axios from 'axios';
import { useModal } from "@/context/ModalContext"; 

export const useApiActions = ({ collectionName, idField, refetch, closeModal, closeConfirmation }) => {

    const { showAlert } = useModal();

    const saveItem = useCallback(async (item, isEditMode) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const token = localStorage.getItem("token");
            const url = isEditMode ? `${apiUrl}/${collectionName}/${item[idField]}` : `${apiUrl}/${collectionName}`;
            const method = isEditMode ? 'PUT' : 'POST';

            await axios({ method, url, data: item, headers: { Authorization: `Bearer ${token}` } });

            refetch();
            if (closeModal) closeModal();

            showAlert("El elemento se ha guardado correctamente", "Éxito");
        } catch (error) {
            showAlert(`Error al guardar el elemento`, "Error");
        }
    }, [collectionName, idField, refetch, closeModal]);

    const deleteItem = useCallback(async (itemToDelete) => {
        try {
            if (!itemToDelete || !itemToDelete[idField]) {
                showAlert(`No se puede eliminar: el item o su ID no está definido:`, "Error");
                if (closeConfirmation) closeConfirmation();
                return;
            }
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            await axios.delete(`${apiUrl}/${collectionName}/${itemToDelete[idField]}`);

            refetch();
            showAlert("El usuario se ha eliminado correctamente", "Éxito");

        } catch (error) {
            showAlert(`Error al eliminar el elemento`, "Error");
        }
    }, [collectionName, idField, refetch, closeConfirmation]); 

    return { saveItem, deleteItem };
};