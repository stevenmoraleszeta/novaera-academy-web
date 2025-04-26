import React, { useState, useEffect } from "react";
import styles from './CrudMenu.module.css';
import useFetchData from "@/app/hooks/useFetchData";
import { db } from "@/firebase/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import ItemCard from './itemCard';
import ModalForm from './ModalForm';
import ConfirmationModal from './ConfirmationModal';

const CrudMenu = ({
    collectionName,
    displayFields,
    editFields,
    pageTitle,
    itemActions = [],
    filterFunction,
    fileUploadHandler,
    onSave,
    onDelete,
    determineState,
    getStateColor,
    data: propData,
    downloadBtn,
    isCheckStatus,
}) => {
    const { data: fetchedData, loading, error } = useFetchData(collectionName);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (propData) {
            setData(propData);
            setFilteredData(propData);
        } else if (fetchedData) {
            setData(fetchedData);
            setFilteredData(fetchedData);
        }
    }, [propData, fetchedData]);

    const handleSearchChange = (term) => {
        if (term.trim() === '') {
            setFilteredData(data);
            return;
        }
        const filtered = data.filter(item =>
            displayFields.some(({ field }) => {
                const value = item[field]?.toString().toLowerCase() || '';
                return value.includes(term);
            })
        );
        setFilteredData(filtered);
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        const emptyItem = editFields.reduce((acc, { field }) => ({ ...acc, [field]: '' }), {});
        setSelectedItem(emptyItem);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setSelectedItem(null);
        setIsModalOpen(false);
    };

    const handleSave = async (item, isEditMode) => {
        try {
            if (onSave) {
                await onSave(item, isEditMode);
            } else {
                if (isEditMode && item.id) {
                    const itemRef = doc(db, collectionName, item.id);
                    await updateDoc(itemRef, item);
                } else {
                    const docRef = await addDoc(collection(db, collectionName), item);
                    item.id = docRef.id;
                }
            }
            handleModalClose();
        } catch (error) {
            console.error("Error al guardar el elemento:", error);
        }
    };

    const handleDeleteItem = (item) => {
        setItemToDelete(item);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const itemRef = doc(db, collectionName, itemToDelete.id);
            await deleteDoc(itemRef);
            setData((prevData) => prevData.filter((i) => i.id !== itemToDelete.id));
            setFilteredData((prevData) => prevData.filter((i) => i.id !== itemToDelete.id));
        } catch (error) {
            console.error("Error al eliminar el elemento:", error);
        } finally {
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };

    if (loading) return <p>Cargando datos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className={styles.CRUDContainer}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <SearchBar onSearch={handleSearchChange} onAdd={handleAddClick} />
            <section className={styles.itemsSection}>
                {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            displayFields={displayFields}
                            onEdit={() => handleItemClick(item)}
                            onDelete={() => handleDeleteItem(item)}
                        />
                    ))
                ) : (
                    <p>No se encontraron elementos.</p>
                )}
            </section>
            {isModalOpen && (
                <ModalForm
                    isOpen={isModalOpen}
                    item={selectedItem}
                    editFields={editFields}
                    isEditMode={isEditMode}
                    onClose={handleModalClose}
                    onSave={handleSave}
                />
            )}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                message="¿Estás seguro de que quieres eliminar este elemento?"
            />
        </div>
    );
};

export default CrudMenu;