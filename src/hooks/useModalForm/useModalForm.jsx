import { useState } from 'react';

export const useModalForm = (editFields = []) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const openForEdit = (item) => {
        setSelectedItem(item);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const openForAdd = () => {
        const emptyItem = editFields.reduce((acc, { field }) => (field ? { ...acc, [field]: '' } : acc), {});
        setSelectedItem(emptyItem);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedItem(null);
        setIsModalOpen(false);
    };

    return {
        isModalOpen,
        isEditMode,
        selectedItem,
        openForEdit,
        openForAdd,
        closeModal,
    };
};