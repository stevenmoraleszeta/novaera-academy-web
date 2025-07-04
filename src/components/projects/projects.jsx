import React, { useState, useEffect, useRef } from "react";
import { FaArrowUp, FaArrowDown, FaTrash, FaPlus, FaTimes, FaDownload } from "react-icons/fa";
import styles from "./ProjectsList.module.css";
import { useAuth } from "@/context/AuthContext";
import { useFirebaseIntegration } from "@/hooks/useFirebaseIntegration";
import { Modal } from "../modal/modal";
import { useModal } from '../../context/ModalContext';
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
    const { ensureFirebaseConnection, isConnecting, error } = useFirebaseIntegration();
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
    const [uploadingFile, setUploadingFile] = useState(false);

    const { showAlert, showConfirm } = useModal();
    // Cargar proyectos al montar
    useEffect(() => {
        if (!courseId) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/course/${courseId}`)
            .then(res => res.json())
            .then(setProjects)
            .catch(err => console.error("Error al cargar proyectos:", err));
    }, [courseId]);

    if (!isStudentInCourse && !isAdmin) return null;


    ///agrega varios pero con el problema que se lo agrega todos al primero que encuentre, entonces crea varios pero con el mismo usuario!!!!!
    const addProject = async (projectData) => {
        const uniqueStudentIds = [...new Set(students)];

        if (!uniqueStudentIds || uniqueStudentIds.length === 0) {
            showAlert("No se puede añadir un proyecto porque no hay estudiantes inscritos en el curso.", "Acción Requerida");
            return;
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(projectData),
            });
            const responseData = await res.json();
            if (!res.ok) {
                throw new Error(responseData.error || "Error al crear el proyecto base.");
            }
            const newProject = responseData.project;
            if (!newProject || !newProject.projectid) {
                throw new Error("La API no devolvió los datos del nuevo proyecto.");
            }
            const assignmentPromises = uniqueStudentIds.map(studentId => {
                // console.log(newProject);
                const studentProjectData = {
                    title: newProject.title,
                    dueDate: newProject.duedate,
                    submissionDate: null,
                    fileUrl: newProject.fileurl,
                    studentFileUrl: null,
                    comments: null,
                    score: null,
                    courseId: newProject.courseid,
                    projectId: newProject.projectid,
                    userId: studentId,
                    mentorId: newProject.mentorid,
                    statusId: 2,
                    userEmail: newProject.userEmail,
                    mentorEmail: newProject.mentorEmail,
                };

                console.log("Enviando al backend:", studentProjectData);
                return fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-projects`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(studentProjectData),
                });
            });

            const responses = await Promise.all(assignmentPromises);

            const failedAssignment = responses.find(response => !response.ok);
            if (failedAssignment) {
                throw new Error("Se creó el proyecto, pero falló la asignación a uno o más estudiantes.");
            }
            setProjects(currentProjects => [...currentProjects, newProject]);
            showAlert("Proyecto añadido y asignado a todos los estudiantes.", "Éxito");

        } catch (err) {
            showAlert(`Error en el proceso: ${err.message}`, "Error");
        }
    };

    const handleAddProject = async (e) => {
        e.preventDefault();

        try {
            let fileUrl = "";
            if (newProject.file) {
                console.log("Procesando archivo para nuevo proyecto...");
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

        } catch (error) {
            console.error("Error en handleAddProject:", error);
        }
    };

    const deleteProject = async (projectId, projectTitle) => {
        showConfirm(
            `¿Estás seguro de que deseas eliminar el proyecto "${projectTitle}"?`,
            async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`, {
                        method: "DELETE",
                    });

                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ error: "Error desconocido" }));
                        throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
                    }

                    const updatedProjects = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/course/${courseId}`)
                        .then(res => res.json());
                    setProjects(updatedProjects);
                    showAlert("Proyecto eliminado exitosamente.", "Éxito");
                } catch (err) {
                    console.error("Error al eliminar proyecto:", err);
                    showAlert(`Error al eliminar: ${err.message}`, "Error");
                }
            },
            "Confirmar Eliminación"
        );
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
            showAlert(`Error al reordenar proyectos: ${err.message}`, "Error");
        }
    };

    function formatSimpleDate(dateString) {
        const date = new Date(dateString);
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        return new Intl.DateTimeFormat('es-CR', options).format(date);
    }

    const openEditModal = (project) => {
        const inputDate = project.duedate ? project.duedate.split('T')[0] : '';
        setEditProject({
            ...project,
            dueDate: inputDate,
            file: null, // No puede editar el archivo anterior, solo subir uno nuevo
            fileurl: project.fileurl,
        });
        setIsEditModalOpen(true);
    };

    // Función para guardar cambios (admin o estudiante)
    const handleEditProject = async (e) => {
        e.preventDefault();

        try {
            let fileUrl = editProject.fileurl || editProject.fileUrl || "";
            if (editProject.file) {
                console.log("Procesando archivo para editar proyecto...");
                fileUrl = await uploadFileToFirebase(editProject.file);
            }

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
            showAlert("Proyecto actualizado.", "Éxito");
        } catch (err) {
            showAlert(`Error al actualizar: ${err.message}`, "Error");
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

        try {
            setUploadingFile(true);

            // Asegurar autenticación en Firebase antes de subir
            console.log("Asegurando autenticación en Firebase...");
            const firebaseUser = await ensureFirebaseConnection();
            console.log("Usuario autenticado en Firebase:", firebaseUser.uid);

            // Crear referencia única del archivo
            const timestamp = Date.now();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${timestamp}_${sanitizedFileName}`;
            const storageRef = ref(storage, `projects/${firebaseUser.uid}/${fileName}`);

            console.log("Subiendo archivo a Firebase Storage...");

            // Subir archivo
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            console.log("Archivo subido exitosamente:", downloadURL);
            return downloadURL;

        } catch (error) {
            showAlert(`Error subiendo archivo: ${error.message}`, "Error de Firebase");
            throw error;
        } finally {
            setUploadingFile(false);
        }
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
                                onClick={e => { e.stopPropagation(); deleteProject(project.projectid, project.title); }}
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
                <button onClick={() => setIsAddModalOpen(true)} className="add-element-button">
                    <FaPlus /> Añadir Proyecto
                </button>
            )}

            {/* Modal para añadir proyecto */}
            {isAddModalOpen && (
                <Modal modalType="customContent" isOpen={isAddModalOpen}>
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>Nuevo Proyecto</h3>

                            {/* Muestra error si hay problemas con Firebase */}
                            {error && (
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#ffebee',
                                    border: '1px solid #f44336',
                                    borderRadius: '4px',
                                    marginBottom: '16px',
                                    color: '#d32f2f'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <form onSubmit={handleAddProject} className={styles.modalForm}>
                                <label>Título</label>
                                <input
                                    type="text"
                                    value={newProject.title}
                                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                    required
                                    className={styles.title}
                                />
                                <label>Fecha de entrega</label>
                                <input
                                    type="date"
                                    value={newProject.dueDate}
                                    onChange={e => setNewProject({ ...newProject, dueDate: e.target.value })}
                                    required
                                    className={styles.title}
                                />
                                <label>Archivo</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={e => setNewProject({ ...newProject, file: e.target.files[0] })}
                                    accept="*"
                                    className={styles.title}
                                />
                                <div className="formActions">
                                    <button
                                        type="submit"
                                        className="saveButton"
                                        disabled={uploadingFile || isConnecting}
                                    >
                                        {uploadingFile ? (
                                            <>Subiendo archivo...</>
                                        ) : isConnecting ? (
                                            <>Conectando...</>
                                        ) : (
                                            <><FaPlus /> Añadir</>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="cancelButton"
                                        disabled={uploadingFile}
                                    >
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
                            <h3>{isAdmin ? "Editar Proyecto" : "PEntregar royecto"}</h3>

                            {/* Mostrar error si hay problemas con Firebase */}
                            {error && (
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#ffebee',
                                    border: '1px solid #f44336',
                                    borderRadius: '4px',
                                    marginBottom: '16px',
                                    color: '#d32f2f'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <form onSubmit={handleEditProject} className={styles.modalForm}>
                                <label>Título</label>
                                <input
                                    type="text"
                                    value={editProject.title}
                                    onChange={e => setEditProject({ ...editProject, title: e.target.value })}
                                    required
                                    disabled={!isAdmin}
                                    className={styles.title}
                                />
                                <label>Fecha de entrega</label>
                                <input
                                    type="date"
                                    value={editProject.dueDate}
                                    onChange={e => setEditProject({ ...editProject, dueDate: e.target.value })}
                                    required
                                    disabled={!isAdmin}
                                    className={styles.title}
                                />
                                <label>Instrucciones del proyecto</label>
                                {editProject.fileurl ? (
                                    <a
                                        href={editProject.fileurl}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cancelButton"
                                    >
                                        <FaDownload /> Descargar Instrucciones
                                    </a>
                                ) : (
                                    <p className={styles.noFileMessage}>No hay instrucciones adjuntas.</p>
                                )}
                                <label>Archivo</label>
                                <input
                                    type="file"
                                    onChange={e => setEditProject({ ...editProject, file: e.target.files[0] })}
                                    accept="*"
                                    className={styles.title}
                                />
                                <div className="formActions">
                                    <button
                                        type="submit"
                                        className="saveButton"
                                        disabled={uploadingFile || isConnecting}
                                    >
                                        {uploadingFile ? (
                                            <>Subiendo archivo...</>
                                        ) : isConnecting ? (
                                            <>Conectando...</>
                                        ) : (
                                            <><FaPlus /> {isAdmin ? "Guardar" : "Entregar"}</>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(closeModal) => setIsEditModalOpen(false)}
                                        className="cancelButton"
                                        disabled={uploadingFile}
                                    >
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