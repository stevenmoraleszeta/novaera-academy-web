"use client";

import styles from './page.module.css';
import React from 'react';
import RequireAuth from '@/features/RequireAuth';
import AdminButton from '@/components/adminButton/adminButton';

const AdminMenu = () => {
    document.title = "Menu Admin - ZETA";

    return (
        <RequireAuth>
            <div className={styles.adminMenuContainer}>
                <div className={styles.buttonContainer}>
                    <AdminButton
                        iconName="AiOutlineUser"
                        text="Usuarios"
                        path="/admin/usuarios"
                    />
                    <AdminButton
                        iconName="AiOutlineRead"
                        text="Estudiantes"
                        path="/admin/students"
                    />
                    <AdminButton
                        iconName="AiOutlineProject"
                        text="Proyectos Estudiantes"
                        path="/admin/students-proyects"
                    />
                </div>
            </div>
        </RequireAuth>
    );
};

export default AdminMenu;