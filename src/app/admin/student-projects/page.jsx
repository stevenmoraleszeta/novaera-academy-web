"use client"

import React from "react";
import CrudMenu from "@/components/adminCrudMenu/adminCrudMenu";

const ProjectsPage = () => {
    const collectionName = "projects";
    const displayFields = [
        { label: "Title", field: "title" },
        { label: "Due Date", field: "dueDate" },
        { label: "File", field: "fileUrl" },
    ];

    const editFields = [
        { label: "Title", field: "title", type: "text" },
        { label: "Due Date", field: "dueDate", type: "date" },
        { label: "File URL", field: "fileUrl", type: "text" },
        { label: "Order", field: "orderProject", type: "number" },
        { label: "Course ID", field: "courseId", type: "number" },
        { label: "Mentor ID", field: "mentorId", type: "number" },
        { label: "User ID", field: "userId", type: "number" },
    ];

    const handleSave = async (item, isEditMode) => {
        try {
            const url = isEditMode ? `/api/projects/${item.id}` : `/api/projects`;
            const method = isEditMode ? "PUT" : "POST";

            const response = await axios({
                method,
                url,
                data: item,
            });
            console.log("Elemento guardado:", response.data);
        } catch (error) {
            console.error("Error al guardar el proyecto:", error);
        }
    };

    const handleDelete = async (item) => {
        try {
            const response = await axios.delete(`/api/projects/${item.id}`);
            console.log("Elemento eliminado:", response.data);
        } catch (error) {
            console.error("Error al eliminar el proyecto:", error);
        }
    };

    return (
        <div>
            <CrudMenu
                collectionName={collectionName}
                displayFields={displayFields}
                editFields={editFields}
                pageTitle="Proyectos"
                onSave={handleSave}
                onDelete={handleDelete}
                data={[]}
            />
        </div>
    );
};

export default ProjectsPage;