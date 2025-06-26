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
        { 
            label: 'Cursos Matriculados',
            render: (item) => {
                if (!item.enrolled_courses || item.enrolled_courses.length === 0) {
                    return 'Sin cursos';
                }
                return (
                    <><h4>Cursos Matriculados</h4><ul className={styles.courseList}>
                        {item.enrolled_courses.map((course, index) => (
                            <li key={index}>{course}</li>
                        ))}
                    </ul></>
                );
            }
        },
    ];

    const editFields = [
        { label: 'Nombre', field: 'firstname' },
        { label: 'Primer Apellido', field: 'lastname1' },
        { label: 'Segundo Apellido', field: 'lastname2' },
        { label: 'Edad', field: 'age', type: 'number' },
        { label: 'Email', field: 'email' },
        { label: 'Telefono', field: 'phone'},
        { label: 'Ocupación', field: 'occupation' },
        { label: 'Estilo de Aprendizaje', field: 'learningstyle' },
        { label: 'Intereses', field: 'interests' },
        { label: 'Nivel Inicial', field: 'initiallevel' },
        { label: 'Objetivos Personales', field: 'personalgoals' },
        { label: 'País', field: 'country'},
    ];

    return (
            <div className={styles.adminCoursesContainer}>
                <CrudMenu
                    collectionName="students"
                    displayFields={displayFields}
                    editFields={editFields}
                    pageTitle='Gestión de Estudiantes'
                    idField="userid"
                />
            </div>
    );
};

export default AdminUsers;