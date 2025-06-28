import React, { useState, useEffect, useRef } from "react";
import { FaArrowUp, FaArrowDown, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import styles from "./ProjectsList.module.css";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "../modal/modal";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/firebase";

const ProjectsList = ({
    isAdmin,
    isStudentInCourse,
    studentProjects,
    courseId,
    averageScore,
    students,
    mentor
}) => {
    const { currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        title: "",
        dueDate: "",
        file: null,
    });
    const fileInputRef = useRef(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editProject, setEditProject] = useState(null);

    // Cargar proyectos al montar
    useEffect(() => {
        if (!courseId) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/course/${courseId}`)
            .then(res => res.json())
            .then(setProjects)
            .catch(err => console.error("Error al cargar proyectos:", err));
    }, [courseId]);

    if (!isStudentInCourse && !isAdmin) return null;

    const addProject = async (projectData) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(projectData),
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error("Error al crear el proyecto: " + errorText);
            }
            await res.json();
            // Recargar proyectos
            const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/course/${courseId}`);
            setProjects(await updated.json());
        } catch (err) {
            console.error("Error al añadir proyecto:", err);
            alert(err.message);
        }
    };

    const handleAddProject = async (e) => {
        e.preventDefault();
        let fileUrl = "";
        if (newProject.file) {
            fileUrl = await uploadFileToFirebase(newProject.file);
        }
        await addProject({
            title: newProject.title,
            dueDate: newProject.dueDate,
            fileUrl,
            orderProject: projects.length + 1,
            courseId: courseId ? Number(courseId) : null,
            mentorId: mentor && mentor !== "" ? Number(mentor) : null,
            userId: students && students.length > 0 ? Number(students[0]) : null,
        });
        setIsAddModalOpen(false);
        setNewProject({ title: "", dueDate: "", file: null });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const deleteProject = async (projectId) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Error al eliminar el proyecto");
            // Recargar proyectos
            const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/course/${courseId}`);
            setProjects(await updated.json());
        } catch (err) {
            console.error("Error al eliminar proyecto:", err);
        }
    };

    const moveProject = async (projectId, index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= projects.length) return;
        const reordered = [...projects];
        const [moved] = reordered.splice(index, 1);
        reordered.splice(newIndex, 0, moved);

        try {
            await Promise.all(
                reordered.map((proj, idx) =>
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${proj.projectid}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: proj.title,
                            dueDate: proj.duedate || proj.dueDate || "",
                            fileUrl: proj.fileurl || proj.fileUrl || "",
                            orderProject: idx + 1,
                            courseId: proj.courseid || proj.courseId || null,
                            mentorId: proj.mentorid || proj.mentorId || null,
                            userId: proj.userid || proj.userId || null,
                        }),
                    })
                )
            );
            setProjects(reordered);
        } catch (err) {
            console.error("Error al reordenar proyectos:", err);
        }
    };

    const openEditModal = (project) => {
        setEditProject({
            ...project,
            dueDate: project.dueDate || project.duedate || "",
            file: null, // No puede editar el archivo anterior, solo subir uno nuevo
        });
        setIsEditModalOpen(true);
    };

    // Función para guardar cambios (admin o estudiante)
    const handleEditProject = async (e) => {
        e.preventDefault();
        let fileUrl = editProject.fileurl || editProject.fileUrl || "";
        if (editProject.file) {
            fileUrl = await uploadFileToFirebase(editProject.file);
        }
        try {
            if (isAdmin) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${editProject.projectid}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: editProject.title,
                        dueDate: editProject.dueDate,
                        fileUrl,
                        orderProject: editProject.orderproject || editProject.orderProject || 1,
                        courseId: editProject.courseid || editProject.courseId || null,
                        mentorId: editProject.mentorid || editProject.mentorId || null,
                        userId: editProject.userid || editProject.userId || null,
                    }),
                });
                if (!res.ok) throw new Error("Error al editar el proyecto");
            } else {
                // Solo permite subir archivo para estudiantes
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${editProject.projectid}/submit`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fileUrl,
                        userId: currentUser?.userid,
                    }),
                });
                if (!res.ok) throw new Error("Error al entregar el proyecto");
            }
            // Recargar proyectos
            const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/course/${courseId}`);
            setProjects(await updated.json());
            setIsEditModalOpen(false);
            setEditProject(null);
        } catch (err) {
            alert(err.message);
        }
    };

    function formatDateDMY(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d)) return "";
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = String(d.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    }

    function parseDMYtoISO(dmy) {
        if (!dmy) return "";
        const [day, month, year] = dmy.split("/");
        if (!day || !month || !year) return "";
        const fullYear = year.length === 2 ? `20${year}` : year.slice(-4);
        return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    const uploadFileToFirebase = async (file) => {
        if (!file) return "";
        const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    return (
        <div className={styles.mainContainer}>
            <h3>Proyectos</h3>
            {projects.map((project, index) => (
                <div
                    key={project.projectid}
                    className={styles.projectItem}
                    onClick={() => (isAdmin || isStudentInCourse) && openEditModal(project)}
                    style={{ cursor: (isAdmin || isStudentInCourse) ? "pointer" : "default" }}
                >
                    <span>{project.title}</span>
                    <span>{formatDateDMY(project.dueDate || project.duedate || "")}</span>
                    {isAdmin && (
                        <div className={styles.projectActions}>
                            <button
                                onClick={e => { e.stopPropagation(); moveProject(project.projectid, index, -1); }}
                                disabled={index === 0}
                                className={styles.projectAction}
                                title="Mover arriba"
                            >
                                <FaArrowUp />
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); moveProject(project.projectid, index, 1); }}
                                disabled={index === projects.length - 1}
                                className={styles.projectAction}
                                title="Mover abajo"
                            >
                                <FaArrowDown />
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); deleteProject(project.projectid); }}
                                className={styles.projectAction}
                                title="Eliminar Proyecto"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {isAdmin && (
                <button onClick={() => setIsAddModalOpen(true)} className={styles.addProjectButton}>
                    <FaPlus /> Añadir Proyecto
                </button>
            )}

            {/* Modal para añadir proyecto */}
            {isAddModalOpen && (
                <Modal modalType="customContent" isOpen={isAddModalOpen}>
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>Nuevo Proyecto</h3>
                            <form onSubmit={handleAddProject} className={styles.modalForm}>
                                <label>Título</label>
                                <input
                                    type="text"
                                    value={newProject.title}
                                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                    required
                                />
                                <label>Fecha de entrega</label>
                                <input
                                    type="date"
                                    value={newProject.dueDate}
                                    onChange={e => setNewProject({ ...newProject, dueDate: e.target.value })}
                                    required
                                />
                                <label>Archivo</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={e => setNewProject({ ...newProject, file: e.target.files[0] })}
                                    accept="*"
                                />
                                <div className={styles.formActions}>
                                    <button type="submit" className={styles.saveButton}>
                                        <FaPlus /> Guardar
                                    </button>
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className={styles.cancelButton}>
                                        <FaTimes /> Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal para editar proyecto */}
            {isEditModalOpen && editProject && (
                <Modal modalType="customContent" isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>{isAdmin ? "Editar Proyecto" : "Entregar Proyecto"}</h3>
                            <form onSubmit={handleEditProject} className={styles.modalForm}>
                                <label>Título</label>
                                <input
                                    type="text"
                                    value={editProject.title}
                                    onChange={e => setEditProject({ ...editProject, title: e.target.value })}
                                    required
                                    disabled={!isAdmin}
                                />
                                <label>Fecha de entrega</label>
                                <input
                                    type="date"
                                    value={editProject.dueDate}
                                    onChange={e => setEditProject({ ...editProject, dueDate: e.target.value })}
                                    required
                                    disabled={!isAdmin}
                                />
                                <label>Archivo</label>
                                <input
                                    type="file"
                                    onChange={e => setEditProject({ ...editProject, file: e.target.files[0] })}
                                    accept="*"
                                />
                                <div className={styles.formActions}>
                                    <button type="submit" className={styles.saveButton}>
                                        <FaPlus /> {isAdmin ? "Guardar" : "Entregar"}
                                    </button>
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className={styles.cancelButton}>
                                        <FaTimes /> Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal>
            )}

            {!isAdmin && (
                <div>
                    <span className={styles.averageLabel}>Promedio: </span>
                    <span
                        className={styles.averageLabel}
                        style={{
                            color: averageScore >= 80 ? "#005F73" : "#E85D04",
                        }}
                    >
                        {averageScore?.toFixed(2)}/100
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProjectsList;