"use client"

import React from "react";
import CrudMenu from "@/components/adminCrudMenu/adminCrudMenu";

const ProjectsPage = () => {
    document.title = "Gestión de estudiantes - Zeta Academia";

    const dateOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };


    const displayFields = [
        { label: 'Titulo', field: 'project_title' },
        {
            label: 'Estudiante',
            render: (item) => `${item.student_firstname || ''} ${item.student_lastname1 || ''}`.trim()
        },
        {
            label: 'Mentor Asignado',
            render: (item) => `${item.mentor_firstname || ''} ${item.mentor_lastname1 || ''}`.trim() || 'Sin asignar'
        },
        {
            label: 'Fecha de Límite',
            field: 'project_duedate',
            // render: (item) => new Date(item.project_duedate).toLocaleDateString()
            render: (item) => item.project_duedate ? new Date(item.project_duedate).toLocaleDateString('es-ES', dateOptions) : 'N/A'
        },
        { label: 'Estado', field: 'status_name' },
    ];

    const editFields = [
        {
            label: 'Título',
            // field: 'project_title',
            // type: 'text',
            // required: true
            render: (item) => <p>{item.project_title || 'N/A'}</p>
        },
        {
            label: 'Curso',
            // field: 'course_name'
             render: (item) => <p>{item.course_name || 'N/A'}</p>
        },
        {
            label: 'Fecha Límite',
            // render: (item) => <p>{item.project_duedate ? new Date(item.project_duedate).toLocaleString() : 'Fecha de Límite'}</p>,
            render: (item) => <p>{item.project_duedate ? new Date(item.project_duedate).toLocaleDateString('es-ES', dateOptions) : 'N/A'}</p>
            // type: 'text',
            // required: true
        },
        {
            label: 'Fecha de entrega *',
            // render: (item) => <p>{item.submissiondate ? new Date(item.submissiondate).toLocaleString() : '--Fecha de Entrega--'}</p>,
            render: (item) => <p>{item.submissiondate ? new Date(item.submissiondate).toLocaleDateString('es-ES', dateOptions) : 'Pendiente de entrega'}</p>
            // type: 'text',
            // required: true
        },
        {
            label: 'Archivo del Proyecto',
            render: (item) => {
                return item.project_fileurl
                    ? <a href={item.project_fileurl} target="_blank" rel="noopener noreferrer">Descargar proyecto</a>
                    : <p><i>No se ha subido el proyecto.</i></p>;
            }
            // field: 'fileurl',
            // type: 'text',
            // placeholder: 'https://ejemplo.com/feedback.pdf'
        },
        { label: 'Puntuación', field: 'score', type: 'number' },
        {
            label: 'Comentarios para el Estudiante',
            field: 'comments',
            type: 'textarea'
        },
        {
            label: 'Proyecto del Estudiante',
            render: (item) => {
                return item.studentfileurl
                ? <a href={item.studentfileurl} target="_blank" rel="noopener noreferrer">Descargar Entrega del Estudiante</a>
                : <p><i>El estudiante no ha subido un archivo.</i></p>;
            }
        }
    ];

    return (
        <div>
            <CrudMenu
                collectionName={"student-projects"}
                displayFields={displayFields}
                editFields={editFields}
                pageTitle="Proyectos de Estudiantes"
                idField="studentProjectId"
                getItemName={(item) => item.project_title} 
            />
        </div>
    );
};

export default ProjectsPage;