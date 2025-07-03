"use client"

import React from "react";
import CrudMenu from "@/components/adminCrudMenu/adminCrudMenu";

const ProjectsPage = () => {
    document.title = "Gestión de estudiantes - Zeta Academia";
    const displayFields = [
         { label: 'Titulo', field: 'project_title'}, 
        {
            label: 'Estudiante',
            render: (item) => `${item.student_firstname || ''} ${item.student_lastname1 || ''}`.trim()
        },
        {
            label: 'Mentor Asignado', 
            render: (item) => `${item.mentor_firstname || ''} ${item.mentor_lastname1 || ''}`.trim() || 'Sin asignar'
        },
        { 
            label: 'Fecha de Entrega', 
            field: 'project_duedate',
            render: (item) => new Date(item.project_duedate).toLocaleDateString()
        },
        { label: 'Estado', field: 'status_name' },
    ];

    const editFields = [
        { 
            label: 'Título *', 
            field: 'project_title', 
            type: 'text',
            required: true
        },
        {   label: 'Curso', 
            field: 'course_name'
        },
        { 
            label: 'Fecha Límite *', 
            render: (item) => <p>{item.submissiondate ? new Date(item.project_duedate).toLocaleString() : 'Fecha de Entregada'}</p>, 
            type: 'text',
            required: true
        },
        { label: 'Puntuación', field: 'score', type: 'number' },
        { 
            label: 'Fecha de entrega *', 
            render: (item) => <p>{item.submissiondate ? new Date(item.submissiondate).toLocaleString() : 'Fecha de Entregada'}</p>, 
            type: 'text',
            required: true
        },
        //Esto no se como manejarlo del los archivos!!!
        // { 
        //     label: 'Archivo del Proyecto', 
        //     field: 'project_fileurl', 
        //     type: 'text', 
        //     placeholder: 'https://ejemplo.com/feedback.pdf' 
        // },
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
                idField="projectid"
            />
        </div>
    );
};

export default ProjectsPage;