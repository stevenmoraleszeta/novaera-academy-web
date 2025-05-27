"use client"

import React, { useState, useEffect } from "react";
import styles from './CrudMenu.module.css';
import useFetchData from "@/hooks/useFetchData/useFetchData";
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import ItemCard from './itemCard';
import axios from "axios";
import { Modal } from "../modal/modal";


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
            // Usar el onSave del padre si existe (para integración con API externa)
            if (onSave) {
                await onSave(item, isEditMode);
                handleModalClose();
                return;
            }
            // Si no, fallback local (no recomendado para API externa)
            const idField = item.studentProjectId ? 'studentProjectId' : 'id';
            const url = isEditMode ? `/api/${collectionName}/${item[idField]}` : `/api/${collectionName}`;
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await axios({
                method,
                url,
                data: item,
            });

            if (isEditMode) {
                setData((prevData) =>
                    prevData.map((i) => (i[idField] === item[idField] ? response.data : i))
                );
            } else {
                setData((prevData) => [...prevData, response.data]);
            }

            handleModalClose();
        } catch (error) {
            console.error("Error al guardar el elemento:", error);
        }
    };

    const handleDeleteItem = async (item) => {
        setItemToDelete(item);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            // Usar el onDelete del padre si existe (para integración con API externa)
            if (onDelete) {
                await onDelete(itemToDelete);
                setIsConfirmModalOpen(false);
                setItemToDelete(null);
                return;
            }
            // Si no, fallback local (no recomendado para API externa)
            const idField = itemToDelete.studentProjectId ? 'studentProjectId' : 'id';
            await axios.delete(`/api/${collectionName}/${itemToDelete[idField]}`);

            setData((prevData) => prevData.filter((i) => i[idField] !== itemToDelete[idField]));
            setFilteredData((prevData) => prevData.filter((i) => i[idField] !== itemToDelete[idField]));

            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error("Error al eliminar el elemento:", error);
        }
    };

    const handleCloseConfirmation = () => {
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    }

    const handleConfirmAction = () => {
        if (itemToDelete) {
            confirmDelete();
        } else {
            handleCloseConfirmation();
        }
    }

    /* if (loading) return <p>Cargando datos...</p>;
    if (error) return <p>Error: {error}</p>; */

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
                <Modal
                    modalType="formModal"
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSave={handleSave}
                    item={selectedItem}
                    editFields={editFields}
                    isEditMode={isEditMode}
                />
            )}
            <Modal
                modalType="confirmation"
                isOpen={isConfirmModalOpen}
                onClose={handleCloseConfirmation}
                onConfirm={handleConfirmAction}
                description="¿Estás seguro de que deseas realizar esta acción?"
            />
        </div>
    );
};

export default CrudMenu;