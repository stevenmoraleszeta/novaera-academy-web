"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './page.module.css';
import CrudMenu from '@/components/adminCrudMenu/adminCrudMenu';

import countries from "@/jsonFiles/paises.json";

const AdminUsers = () => {
    document.title = "Administración de Usuarios - ZETA";

    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/roles`);
                const formattedRoles = response.data.map(role => ({
                    value: role.roleid,
                    label: role.namerole
                }));
                setRoles(formattedRoles);
            } catch (error) {
                console.error("Error al cargar los roles:", error);
            }
        };
        fetchRoles();
    }, []);

    const countryOptions = countries.map(country => ({
        value: country.es,
        label: country.es
    }));

    const displayFields = [
        {
            label: 'Nombre Completo', 
            render: (item) => `${item.firstname || ''} ${item.lastname1 || ''} ${item.lastname2 || ''}`.trim()
        },
        { label: 'Correo', field: 'email' },
        { label: 'Teléfono', field: 'phone' },
    ];
    
    const editFields = [
        { label: 'Nombre *', field: 'firstname', required: true},
        { label: 'Primer Apellido *', field: 'lastname1', required: true },
        { label: 'Segundo Apellido', field: 'lastname2' },
        { label: 'Correo *', field: 'email', required: true},
        { label: 'Telefono', field: 'phone'},
        { label: 'Edad', field: 'age', type: 'number' },
        { 
            label: 'Rol *', 
            field: 'roleid', 
            type: 'select',
            required: true,
            options: roles 
        },
        { 
            label: 'País', 
            field: 'country',
            type: 'select',
            options: countryOptions 
        },
        // { label: 'Rol *', field: 'roleid', type: 'number', required: true},
        // { label: 'País', field: 'country' },
    ];

    return (
            <div className={styles.adminCoursesContainer}>
                <CrudMenu
                    collectionName="users"
                    displayFields={displayFields}
                    editFields={editFields}
                    pageTitle='Gestión de Usuarios'
                    idField="userid"
                />
            </div>
    );
};

export default AdminUsers;
