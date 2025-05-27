"use client"

import React, { useEffect, useState } from "react";
import CrudMenu from "@/components/adminCrudMenu/adminCrudMenu";
import axios from "axios";

const ProjectsPage = () => {
    const collectionName = "student-Projects"; // table name in the database
    const [data, setData] = useState([]);

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

    useEffect(() => {
        const fetchStudentProjects = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/student-projects`);
                setData(response.data);
            } catch (error) {
                console.error("Error al cargar los studentProjects:", error);
            }
        };
        fetchStudentProjects();
    }, []);

    const handleSave = async (item, isEditMode) => {
        try {
            const url = isEditMode 
                ? `${process.env.NEXT_PUBLIC_API_URL}/student-projects/${item.studentProjectId}` 
                : `${process.env.NEXT_PUBLIC_API_URL}/student-projects`;
            const method = isEditMode ? "PUT" : "POST";

            const response = await axios({
                method,
                url,
                data: item,
            });
            console.log("Elemento guardado:", response.data);
            // Refrescar datos después de guardar
            const updated = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/student-projects`);
            setData(updated.data);
        } catch (error) {
            console.error("Error al guardar el studentProject:", error);
        }
    };

    const handleDelete = async (item) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/student-projects/${item.studentProjectId}`);
            const updated = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/student-projects`);
            setData(updated.data);
        } catch (error) {
            console.error("Error al eliminar el studentProject:", error);
        }
    };

    return (
        <div>
            <CrudMenu
                collectionName={collectionName}
                displayFields={displayFields}
                editFields={editFields}
                pageTitle="Student Projects"
                onSave={handleSave}
                onDelete={handleDelete}
                data={data}
            />
        </div>
    );
};

export default ProjectsPage;