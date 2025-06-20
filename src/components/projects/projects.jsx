import React from "react";
import { FaArrowUp, FaArrowDown, FaTrash } from "react-icons/fa";
import styles from "./ProjectsList.module.css";
import { useAuth } from "@/context/AuthContext";

const ProjectsList = ({
    isAdmin,
    isStudentInCourse,
    studentProjects,
    courseId,
    averageScore,
    students,
}) => {
    const { currentUser } = useAuth();
    const [projects, setProjects] = useState([]);

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

            const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/course/${courseId}`);
            setProjects(await updated.json());
        } catch (err) {
            console.error("Error al añadir proyecto:", err);
            alert(err.message);
        }
    };

    const deleteProject = async (projectId) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Error al eliminar el proyecto");

            const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/course/${courseId}`);
            setProjects(await updated.json());
        } catch (err) {
            console.error("Error al eliminar proyecto:", err);
        }
    };

    const moveProject = async () => {

    }

    const handleEditProject = async (projectId, updatedData) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });
            if (!res.ok) throw new Error("Error al editar el proyecto");
            const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/course/${courseId}`);
            setProjects(await updated.json());
        } catch (err) {
            console.error("Error al editar proyecto:", err);
        }
    };

    const renderProjectActions = (project, index) => (
        <div className={styles.projectActions}>
            <button
                onClick={(event) => {
                    event.stopPropagation();
                    moveProject(project.id, index, -1);
                }}
                disabled={index === 0}
                className={styles.projectAction}
            >
                <FaArrowUp />
            </button>
            <button
                onClick={(event) => {
                    event.stopPropagation();
                    moveProject(project.id, index, 1);
                }}
                disabled={index === projects.length - 1}
                className={styles.projectAction}
            >
                <FaArrowDown />
            </button>
            <button
                onClick={(event) => {
                    event.stopPropagation();
                    deleteProject(project.id);
                }}
                className={styles.projectAction}
                title="Eliminar Proyecto"
            >
                <FaTrash />
            </button>
        </div>
    );

    return (
        <div className={styles.mainContainer}>
            <div className={styles.projects}>
                <h3>Proyectos</h3>
                {(isAdmin ? projects : studentProjects)
                    .filter((project) => project.courseId === courseId)
                    .map((project, index) => {
                        const studentProject = studentProjects.find(
                            (sp) => sp.projectId === project.id
                        );
                        return (
                            <div
                                key={project.id}
                                className={styles.projectItem}
                                onClick={() => handleEditProject(project)}
                            >
                                <span>{project.title}</span>
                                {!isAdmin && (
                                    <span>
                                        {studentProject ? studentProject.score : "No score"}
                                    </span>
                                )}
                                {isAdmin && renderProjectActions(project, index)}
                            </div>
                        );
                    })}
                <div>
                    {!isAdmin && (
                        <>
                            <span className={styles.averageLabel}>Promedio: </span>
                            <span
                                className={styles.averageLabel}
                                style={{
                                    color: averageScore >= 80 ? "#005F73" : "#E85D04",
                                }}
                            >
                                {averageScore.toFixed(2)}/100
                            </span>
                        </>
                    )}
                </div>
                {isAdmin && (
                    <button
                        onClick={() => addProject({
                            title: "Nuevo Proyecto",
                            dueDate: new Date().toISOString().slice(0, 10),
                            fileUrl: "",
                            orderProject: projects.length + 1,
                            courseId,
                            mentorId: currentUser?.userid,
                            userId: students && students.length > 0 ? Number(students[0]) : null,
                        })}
                        className={styles.addProjectButton}
                    >
                        Añadir Proyecto
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProjectsList;