"use client";

import React from 'react';
import styles from './page.module.css';
import CrudMenu from '@/components/adminCrudMenu/adminCrudMenu';

const AdminUsers = () => {
    document.title = "Administración de Usuarios - ZETA";
    // Fields to display in the list view
    const displayFields = [
        {
            label: 'Nombre Completo', 
            render: (item) => `${item.firstname || ''} ${item.lastname1 || ''} ${item.lastname2 || ''}`.trim()
        },
        { label: 'Correo', field: 'email' },
        { label: 'Teléfono', field: 'phone' },
    ];

    /* Preguntar si se debe cambiar!!! */
    // Fields to display and edit in the modal
    const editFields = [
        { label: 'Nombre', field: 'firstname' },
        { label: 'Primer Apellido', field: 'lastname1' },
        { label: 'Segundo Apellido', field: 'lastname2' },
        { label: 'Correo', field: 'email' },
        { label: 'Edad', field: 'age', type: 'number' },
        { label: 'Rol', field: 'roleid', type: 'number' },
        { label: 'País', field: 'country' },
    ];

    return (
            <div className={styles.adminCoursesContainer}>
                <CrudMenu
                    collectionName="users"
                    displayFields={displayFields}
                    editFields={editFields}
                    pageTitle='Gestión de Usuarios'
                />
            </div>
    );
};

export default AdminUsers;
