"use client"

import React, { useState, useEffect } from "react";
import styles from './CrudMenu.module.css';
import useFetchData from "@/hooks/useFetchData/useFetchData";
import { useRouter } from 'next/navigation';
import { useModalForm } from "@/hooks/useModalForm/useModalForm";
import { useConfirmationModal } from "@/hooks/useConfirmationModal/useConfirmationModal";
import { useSearch } from '@/hooks/useSearch/useSearch';
import { useApiActions } from '@/hooks/useApiActions/useApiActions';
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
    const { data: fetchedData, loading, error, refetch } = useFetchData(collectionName);
    const [ data, setData] = useState([]);
    const { filteredData, setSearchTerm } = useSearch(data, displayFields);
    const { isModalOpen, isEditMode, selectedItem, openForEdit, openForAdd, closeModal } = useModalForm(editFields);
    const { isConfirmationOpen, itemForConfirmation, openConfirmation, closeConfirmation } = useConfirmationModal();

    const { saveItem, deleteItem } = useApiActions({
        collectionName,
        idField,
        refetch,
        closeModal, 
        closeConfirmation
    });

    useEffect(() => {
        if(Array.isArray(fetchedData)){
            setData(fetchedData);
        }
    }, [fetchedData]);

    const handleItemClick = (item) => openForEdit(item);
    const handleAddClick = () => openForAdd();
    const handleDeleteItem = (item) => openConfirmation(item);

    const handleSave = async (item, isEditMode) => {
        try {
            for(const fieldConfig of editFields){
                if(fieldConfig.required){
                    const fieldName = fieldConfig.field;
                    const value = item[fieldName];
                           
                    if(value == null || String(value).trim()===''){
                        alert(`El campo "${fieldConfig.label}" no puede estar vacío.`);
                        return; 
                    }
                }
            }
            saveItem(item, isEditMode);

        } catch (error) {
            console.error("Error al guardar el elemento:", error);
        }
    };

    const handleConfirmDelete = () => {
        deleteItem(itemForConfirmation);
    };

    return (
        <div className={styles.CRUDContainer}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <SearchBar onSearch={setSearchTerm} onAdd={handleAddClick} />
            <section className={styles.itemsSection}>
                {loading ? (
                    <p>Cargando datos...</p>
                ): 
                    error ? (
                        <p>Error al cargar datos: {error.message}</p>
                    ): 
                filteredData && filteredData.length > 0 ? (
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
                    onClose={closeModal}
                    onSave={handleSave}
                    item={selectedItem}
                    editFields={editFields}
                    isEditMode={isEditMode}
                />
            )}
            <Modal
                modalType="confirmation"
                isOpen={isConfirmationOpen}
                onClose={closeConfirmation}
                onConfirm={handleConfirmDelete}
                description="¿Estás seguro de que deseas realizar esta acción?"
            />
        </div>
    );
};

export default CrudMenu;