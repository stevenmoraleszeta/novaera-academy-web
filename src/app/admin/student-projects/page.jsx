"use client";

import React from 'react';
import CrudMenu from '@/components/adminCrudMenu/adminCrudMenu';

const studentProjects = () => {
    const displayFields = [
        { field: 'name', label: 'Nombre' },
        { field: 'description', label: 'Descripción' },
    ];

    const editFields = [
        { field: 'name', label: 'Nombre', type: 'text' },
        { field: 'description', label: 'Descripción', type: 'text' },
    ];

    const handleSave = async (item, isEditMode) => {
        console.log('Guardando elemento:', item, 'Modo edición:', isEditMode);
    };

    const handleDelete = async (item) => {
        console.log('Eliminando elemento:', item);
    };

    return (
        <CrudMenu
            collectionName="miColeccion"
            displayFields={displayFields}
            editFields={editFields}
            pageTitle="Gestión de Elementos"
            onSave={handleSave}
            onDelete={handleDelete}
        />
    );
};

export default studentProjects;