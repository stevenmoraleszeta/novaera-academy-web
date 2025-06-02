"use client";

import React, { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import useFetchCourse from "@/hooks/fetchCourses/useFetchCourse";

import CourseDetails from "@/components/courseDetails/courseDetails";
import CourseVideo from "@/components/courseVideo/courseVideo";
import Features from "@/components/features/features";
import ModuleCard from "@/components/moduleCards/moduleCards";
import ProjectsList from "@/components/projects/projects";
import { Modal } from "@/components/modal/modal";

const CourseDetail = ({ params }) => {
    const searchParams = useSearchParams();
    const resolvedParams = use(params);
    const courseId = resolvedParams.coursesId || searchParams.get("courseId");
    const { course, setCourse } = useFetchCourse(courseId, 'liveCourses');

    const [modules, setModules] = useState([]);
    const { currentUser, isAdmin } = useAuth();
    const [isEnrolled, setIsEnrolled] = useState(false);

    const [projects, setProjects] = useState([]);
    const [studentProjects, setStudentProjects] = useState([]);

    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState(course?.videoUrl || "");

    const openVideoModal = () => {
        setVideoUrl(course?.videoUrl || "");
        setIsVideoModalOpen(true);
    };

    useEffect(() => {
        const fetchModulesAndClasses = async () => {
            if (!courseId) {
                console.error("courseId is undefined");
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules/course/${courseId}?type=live`);
                if (!response.ok) throw new Error("No se pudieron obtener los módulos");
                const modulesData = await response.json();

                const modulesWithSortedClasses = modulesData.map((mod, idx) => ({
                    ...mod,
                    id: mod.moduleid,
                    classes: Array.isArray(mod.classes)
                        ? mod.classes.map((cls, cidx) => ({
                            ...cls,
                            id: cls.classid || cls._id || `class-${cidx}`
                        })).sort((a, b) => a.orderClass - b.orderClass)
                        : [],
                }));

                modulesWithSortedClasses.sort((a, b) => a.orderModule - b.orderModule);
                setModules(modulesWithSortedClasses);
            } catch (error) {
                console.error("Error fetching modules and classes:", error);
            }
        };

        fetchModulesAndClasses();
    }, [courseId]);

    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            if (!currentUser || !currentUser.id || !courseId) return;

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/student-courses/${courseId}/${currentUser.id}`
                );
                if (response.status === 200) {
                    const data = await response.json();
                    setIsEnrolled(data && data.length > 0);
                } else {
                    setIsEnrolled(false);
                }
            } catch (error) {
                console.error("Error checking enrollment status:", error);
                setIsEnrolled(false);
            }
        };

        checkEnrollmentStatus();
    }, [currentUser, courseId]);

    // NUEVO: Cargar proyectos del curso
    useEffect(() => {
        if (!courseId) return;
        const fetchProjects = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/course/${courseId}`);
                if (!res.ok) throw new Error("No se pudieron obtener los proyectos");
                const data = await res.json();
                setProjects(data);
            } catch (err) {
                console.error("Error al obtener proyectos:", err);
            }
        };
        fetchProjects();
    }, [courseId]);

    // Cargar proyectos del estudiante
    useEffect(() => {
        if (!courseId || !currentUser?.id) return;
        const fetchStudentProjects = async () => {
            try {

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-projects?courseId=${courseId}&userId=${currentUser.id}`);
                if (!res.ok) throw new Error("No se pudieron obtener los proyectos del estudiante");
                const data = await res.json();
                setStudentProjects(data);
            } catch (err) {
                console.error("Error al obtener proyectos del estudiante:", err);
            }
        };
        fetchStudentProjects();
    }, [courseId, currentUser]);

    //Handlers para proyectos
    const addProject = async (projectData) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(projectData),
            });
            if (!res.ok) throw new Error("Error al crear el proyecto");
            await res.json();

            const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/course/${courseId}`);
            setProjects(await updated.json());
        } catch (err) {
            console.error("Error al añadir proyecto:", err);
        }
    };

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

    const handleFieldChange = async (field, value) => {
        const updatedCourse = { ...course, [field]: value };
        setCourse(updatedCourse);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ [field]: value }),
            });

            if (!response.ok) {
                throw new Error("Error al actualizar el curso");
            }
        } catch (error) {
            console.error("Error al actualizar el curso:", error);
        }
    };

    const addModule = async () => {
        try {
            const orderModule = modules.length + 1;
            const newModule = {
                title: "Nuevo Módulo",
                orderModule,
                courseId,
                type: "live"
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newModule),
            });

            if (!response.ok) {
                throw new Error("Error al crear el módulo");
            }

            // refreshes the modules list
            const modulesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules/course/${courseId}?type=live`);
            const modulesData = await modulesResponse.json();

            const modulesWithSortedClasses = modulesData.map((mod, idx) => ({
                ...mod,
                id: mod.moduleid,
                classes: Array.isArray(mod.classes)
                    ? mod.classes.map((cls, cidx) => ({
                        ...cls,
                        id: cls.classid || cls._id || `class-${cidx}`
                    })).sort((a, b) => a.orderClass - b.orderClass)
                    : [],
            }));

            modulesWithSortedClasses.sort((a, b) => a.orderModule - b.orderModule);
            setModules(modulesWithSortedClasses);
        } catch (error) {
            console.error("Error al añadir módulo:", error);
        }
    };

    const handleSaveVideoUrl = async () => {
        await handleFieldChange("videoUrl", videoUrl);
        setIsVideoModalOpen(false);
    };

    return (
        <div className="course-detail-container">
            {isAdmin ? (
                <input
                    type="text"
                    value={course.title || ""}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="course-detail-title-input"
                />
            ) : (
                <span className="course-detail-title-text">
                    {course.title || "Sin título disponible"}
                </span>
            )}
            <div className="course-detail-main-content">
                <CourseVideo
                    course={course}
                    isAdmin={isAdmin}
                    openVideoModal={openVideoModal}
                />
                <CourseDetails
                    course={course}
                    isAdmin={isAdmin}
                    isEnrolled={isEnrolled}
                    handleFieldChange={handleFieldChange}
                    handleContactClick={() => { }}
                    openModal={() => { }}
                    openVideoModal={openVideoModal}
                />
            </div>
            {!isEnrolled && (
                <Features courseId={courseId} course={course} setCourse={setCourse}></Features>
            )}
            {modules.length > 0 ? (
                modules.map((classModule, moduleIndex) => (
                    <ModuleCard
                        key={classModule.id}
                        moduleData={{
                            ...classModule,
                            order: moduleIndex,
                        }}
                        totalModules={modules}
                        isAdmin={isAdmin}
                        collectionName={'liveCourses'}
                        courseId={courseId}
                        onModulesUpdate={course}
                    />
                ))
            ) : (
                <p>No hay módulos disponibles.</p>
            )}
            {isAdmin && (
                <button onClick={addModule} className="course-detail-add-module-button" title="Añadir Módulo">
                    Add Module
                </button>
            )}
            <ProjectsList
                isAdmin={isAdmin}
                isStudentInCourse={isEnrolled}
                projects={projects}
                studentProjects={studentProjects}
                courseId={courseId}
                averageScore={null}
                handleEditProject={handleEditProject}
                moveProject={() => { }}
                deleteProject={deleteProject}
                addProject={addProject}
            />

            {isVideoModalOpen && (
                <Modal isOpen={isVideoModalOpen}
                    onClose={() => setIsVideoModalOpen(false)}
                    title="Editar enlace del video"
                    modalType="customContent">
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <input
                            type="text"
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                            placeholder="Pega el enlace del video"
                            style={{ width: "100%" }}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={handleSaveVideoUrl}>Guardar</button>
                            <button onClick={() => setIsVideoModalOpen(false)}>Cancelar</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CourseDetail;