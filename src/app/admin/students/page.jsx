"use client";

import React from 'react';
import styles from './page.module.css';
import CrudMenu from '@/components/adminCrudMenu/adminCrudMenu';

const AdminUsers = () => {
    document.title = "Gestión de estudiantes - Zeta Academia";
    const displayFields = [
        {
            label: 'Nombre Completo', 
            render: (item) => `${item.firstname || ''} ${item.lastname1 || ''} ${item.lastname2 || ''}`.trim()
        },
        { label: 'Curso', field: 'curso' },
    ];

    const editFields = [
        { label: 'Nombre', field: 'firstname' },
        { label: 'Primer Apellido', field: 'lastname1' },
        { label: 'Segundo Apellido', field: 'lastname2' },
        { label: 'Edad', field: 'edad', type: 'number' },
        { label: 'Email', field: 'email' },
        { label: 'Curso', field: 'curso' },
        { label: 'Ocupación', field: 'ocupacion' },
        { label: 'Estilo de aprendizaje', field: 'estiloAprendizaje' },
        { label: 'Intereses Personales', field: 'Intereses' },
        { label: 'Nivel inicial', field: 'nivelInicial' },
        { label: 'Objetivos Individuales', field: 'objetivosIndividuales' },
        { label: 'Nombre de Usuario', field: 'username' },
        {
            label: 'País',
            field: 'pais',
        },
    ];

    return (
            <div className={styles.adminCoursesContainer}>
                <CrudMenu
                    collectionName="estudiantes"
                    displayFields={displayFields}
                    editFields={editFields}
                    pageTitle='Gestión de Estudiantes'
                />
            </div>
    );
};

export default AdminUsers;