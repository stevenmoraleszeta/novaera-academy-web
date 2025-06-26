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
    idField = 'userid',
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

    useEffect(() => {
        if (propData) {
            setData(propData);
            setFilteredData(propData);
        } else if (fetchedData) {
            if (Array.isArray(fetchedData)) {
                setData(fetchedData);
                setFilteredData(fetchedData);
            }
        }
    }, [propData, fetchedData]);

    const handleSearchChange = (term) => {
        if (term.trim() === '') {
            setFilteredData(data);
            return;
        }
        const filtered = data.filter(item =>
            displayFields.some(({ field, render }) => { 
                let value = '';
                if (render) {
                    const renderedValue = render(item);
                    if (typeof renderedValue === 'string') {
                        value = renderedValue.toLowerCase();
                    }
                } else if (field) {
                    value = item[field]?.toString().toLowerCase() || '';
                }
                return value.includes(term.toLowerCase());
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
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const token = localStorage.getItem("token");
            const url = isEditMode ? `${apiUrl}/${collectionName}/${item[idField]}` : `${apiUrl}/${collectionName}`;
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await axios({
                method,
                url,
                data: item,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            //guardamos los datos aquí
            let newDataArray;
            if (isEditMode) {
                newDataArray = data.map((i) =>
                    i[idField] === item[idField] ? response.data : i
                );
            } else {
                newDataArray = [...data, response.data];
            }
            setData(newDataArray);
            setFilteredData(newDataArray);

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
            if (!itemToDelete || !itemToDelete[idField]) {   //ahora con idField para todos los modals
                console.error("No se puede eliminar: el item o su ID no está definido.");
                setIsConfirmModalOpen(false);
                return;
            }
            
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            await axios.delete(`${apiUrl}/${collectionName}/${itemToDelete[idField]}`);

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

    return (
        <div className={styles.CRUDContainer}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <SearchBar onSearch={handleSearchChange} onAdd={handleAddClick} />
            <section className={styles.itemsSection}>
                {filteredData && filteredData.length > 0 ? (
                    filteredData.map((item) => (
                        <ItemCard
                            key={item[idField]}
                            item={item}
                            displayFields={displayFields}
                            onEdit={() => handleItemClick(item)}
                            onDelete={() => handleDeleteItem(item)}
                            idField={idField}
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