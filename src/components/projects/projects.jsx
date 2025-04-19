import React from "react";
import { FaArrowUp, FaArrowDown, FaTrash } from "react-icons/fa";
import styles from "./ProjectsList.module.css";

const ProjectsList = ({
    isAdmin,
    isStudentInCourse,
    projects,
    studentProjects,
    courseId,
    averageScore,
    handleEditProject,
    moveProject,
    deleteProject,
    addProject,
}) => {
    if (!isStudentInCourse && !isAdmin) return null;

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
                    <button onClick={addProject} className={styles.addProjectButton}>
                        Añadir Proyecto
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProjectsList;