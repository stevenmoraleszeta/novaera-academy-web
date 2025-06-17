"use client";

import React, { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import useFetchCourse from "@/hooks/fetchCourses/useFetchCourse";

import CourseDetails from "@/components/courseDetails/courseDetails";
import CourseVideo from "@/components/courseVideo/courseVideo";
import Features from "@/components/features/features";
import ModuleCard from "@/components/moduleCards/moduleCards";
import { Modal } from "@/components/modal/modal";
import ProjectsList from "@/components/projects/projects";

import { FaPlus, FaTrash } from "react-icons/fa";
import styles from "./courseComponent.module.css";

const CourseDetail = ({
    params,
    isLiveCourse = false,
    studentProjects = [],
    averageScore = null,
}) => {
    const searchParams = useSearchParams();
    const resolvedParams = use(params);
    const courseId = resolvedParams.coursesId || searchParams.get("courseId");
    const { course, setCourse } = useFetchCourse(courseId, isLiveCourse ? "liveCourses" : "onlineCourses");
    const router = useRouter();

    const [modules, setModules] = useState([]);
    const { currentUser, isAdmin } = useAuth();
    const [isEnrolled, setIsEnrolled] = useState(false);

    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState(course?.videoUrl || "");

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState("");
    const [adminUsers, setAdminUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchEmail, setSearchEmail] = useState("");

    const filteredStudents = allUsers.filter(
        (user) =>
            (user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) || !searchTerm) &&
            (user.email?.toLowerCase().includes(searchEmail.toLowerCase()) || !searchEmail)
    );

    useEffect(() => {
        if (!isLiveCourse || !isAdmin) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`)
            .then(res => res.json())
            .then(data => {
                setAllUsers(data);
                setAdminUsers(data.filter(u => u.roleid === 8));
            });

        // Traer los estudiantes inscritos en el curso
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-courses/by-course/${courseId}`)
            .then(res => res.json())
            .then(data => {
                setStudents(data.map(sc => sc.userid));
            });
    }, [isLiveCourse, isAdmin, courseId]);

    const openGroupModal = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`);
            const data = await res.json();
            setSelectedMentor(data.mentorid || "");
        } catch (e) {
            setSelectedMentor("");
        }
        setIsGroupModalOpen(true);
    };

    const assignMentor = async (mentorId) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...course, mentorId }),
            });
            setSelectedMentor(mentorId);
        } catch (e) {
            console.error("Error al asignar mentor:", e);
        }
    };

    const handleAddStudent = async (studentId) => {
        const numericId = Number(studentId);
        if (!numericId) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-courses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: Number(studentId),
                    courseId: Number(courseId),
                    enrollmentDate: new Date().toISOString().split('T')[0],
                }),
            });
            setStudents([...students, numericId]);
        } catch (e) {
            console.error("Error al agregar estudiante:", e);
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-courses/by-course/${courseId}`);
            const data = await res.json();
            const studentCourse = data.find(sc => sc.userid === studentId);
            if (studentCourse) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-courses/${studentCourse.id}`, {
                    method: "DELETE",
                });
                setStudents(students.filter(id => id !== studentId));
            }
        } catch (e) { }
    };

    const openVideoModal = () => {
        setVideoUrl(course?.videoUrl || "https://www.youtube.com/watch?v=zLRCwQS7XAM");
        setIsVideoModalOpen(true);
    };

    // Proyectos (solo para cursos en vivo)
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchModulesAndClasses = async () => {
            if (!courseId) return;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules/course/${courseId}`);
                const modulesData = await response.json();
                const modulesWithSortedClasses = modulesData.map((mod, idx) => ({
                    ...mod,
                    id: mod.moduleid,
                    classes: Array.isArray(mod.classes)
                        ? mod.classes.map((cls, cidx) => ({
                            ...cls,
                            id: cls.classid || cls._id || `class-${cidx}`,
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
            if (!currentUser || !currentUser.userid || !courseId) return;

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/student-courses/${courseId}/${currentUser.userid}`
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

    // Proyectos para cursos en vivo
    useEffect(() => {
        if (isLiveCourse && courseId) {
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
        }
    }, [isLiveCourse, courseId]);

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
        const fieldMap = {
            discountedprice: "discountedPrice",
            originalprice: "originalPrice",
            description: "description",
            title: "title",
        };
        const backendField = fieldMap[field] || field;

        const normalizedCourse = {
            ...course,
            discountedPrice: course.discountedPrice ?? course.discountedprice,
            originalPrice: course.originalPrice ?? course.originalprice,
            imageUrl: course.imageUrl ?? course.imageurl,
            courseIcon: course.courseIcon ?? course.courseicon,
            videoUrl: course.videoUrl ?? course.videourl,
            categoryId: course.categoryId ?? course.categoryid,
            mentorId: course.mentorId ?? course.mentorid,
            modalityId: course.modalityId ?? course.modalityid,
        };

        normalizedCourse[backendField] = value;
        setCourse(normalizedCourse);

        const backendCourse = {
            courseId,
            title: normalizedCourse.title,
            description: normalizedCourse.description,
            discountedPrice: normalizedCourse.discountedPrice,
            originalPrice: normalizedCourse.originalPrice,
            imageUrl: normalizedCourse.imageUrl,
            courseIcon: normalizedCourse.courseIcon,
            videoUrl: normalizedCourse.videoUrl,
            archived: false,
            updatedAt: new Date().toISOString(),
            categoryId: normalizedCourse.categoryId,
            mentorId: normalizedCourse.mentorId,
            modalityId: normalizedCourse.modalityId,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(backendCourse),
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

            const modulesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules/course/${courseId}`);
            const modulesData = await modulesResponse.json();

            const modulesWithSortedClasses = modulesData.map((mod, idx) => ({
                ...mod,
                id: mod.moduleid,
                classes: Array.isArray(mod.classes)
                    ? mod.classes.map((cls, cidx) => ({
                        ...cls,
                        id: cls.classid || cls._id || `class-${cidx}`,
                    })).sort((a, b) => a.orderClass - b.orderClass)
                    : [],
            }));

            modulesWithSortedClasses.sort((a, b) => a.orderModule - b.orderModule);
            setModules(modulesWithSortedClasses);
        } catch (error) {
            console.error("Error al añadir módulo:", error);
        }
    };

    const onClassClick = (moduleId, classId) => {
        const basePath = isLiveCourse ? "cursos-en-vivo" : "cursos-en-linea";
        router.push(`/${basePath}/${courseId}/${moduleId}/${classId}`);
    };

    const handleSaveVideoUrl = async () => {
        await handleFieldChange("videoUrl", videoUrl);
        setIsVideoModalOpen(false);
    };

    useEffect(() => {
        setVideoUrl(course?.videoUrl || "");
    }, [course?.videoUrl]);


    if (!course) {
        return <div>Cargando información del curso...</div>;
    }

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
                <CourseVideo course={course} isAdmin={isAdmin} openVideoModal={openVideoModal} />
                <CourseDetails
                    course={course}
                    isAdmin={isAdmin}
                    isEnrolled={isEnrolled}
                    handleFieldChange={handleFieldChange}
                    handleContactClick={() => { }}
                    openGroupModal={openGroupModal}
                    openVideoModal={openVideoModal}
                    isLiveCourse={isLiveCourse}
                />
            </div>
            {!isEnrolled && (
                <Features courseId={courseId} course={course} setCourse={setCourse}></Features>
            )}
            {modules.length > 0 ? (
                modules.map((classModule, moduleIndex) => (
                    <ModuleCard
                        key={classModule.id || `module-${moduleIndex}`}
                        moduleData={{
                            ...classModule,
                            order: moduleIndex,
                        }}
                        totalModules={modules}
                        isAdmin={isAdmin}
                        courseId={courseId}
                        onModulesUpdate={setModules}
                        onClassClick={onClassClick}
                        currentUser={currentUser}
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

            {/* ProjectsList solo para cursos en vivo */}
            {isLiveCourse && (
                <ProjectsList
                    isAdmin={isAdmin}
                    isStudentInCourse={isEnrolled}
                    projects={projects}
                    studentProjects={studentProjects}
                    courseId={courseId}
                    averageScore={averageScore}
                    handleEditProject={handleEditProject}
                    moveProject={() => { }}
                    deleteProject={deleteProject}
                    addProject={addProject}
                    students={students}
                />
            )}

            {isVideoModalOpen && (
                <Modal isOpen={isVideoModalOpen}
                    onClose={() => setIsVideoModalOpen(false)}
                    title="Editar enlace del video"
                    modalType="customContent">
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <input
                            type="text"
                            name="videoUrl"
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
            {isGroupModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Asignar Mentor</h3>
                        <select
                            value={selectedMentor || ""}
                            onChange={async (e) => {
                                const mentorId = e.target.value;
                                setSelectedMentor(mentorId);
                                if (mentorId) {
                                    await assignMentor(mentorId);
                                }
                            }}
                        >
                            <option value="">Selecciona un mentor</option>
                            {adminUsers.map(user => (
                                <option key={user.userid} value={user.userid}>
                                    {user.firstname || "Nombre no disponible"}
                                </option>
                            ))}
                        </select>
                        <h3>Asignar Estudiantes</h3>
                        <input
                            type="text"
                            placeholder="Buscar estudiante por nombre"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <input
                            type="email"
                            placeholder="Buscar estudiante por email"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            className={styles.searchInput}
                        />
                        <div className={styles.buttonContainer}>
                            <select id="studentSelect">
                                <option value="">Selecciona un estudiante</option>
                                {filteredStudents.map(user => (
                                    <option key={user.userid} value={user.userid}>
                                        {user.firstname || "Nombre no disponible"} - {user.email}
                                    </option>
                                ))}
                            </select>
                            <button onClick={() => handleAddStudent(document.getElementById('studentSelect').value)}>
                                <FaPlus />
                            </button>
                        </div>
                        <table className={styles.studentTable}>
                            <thead>
                                <tr>
                                    <th>Estudiantes</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(studentId => {
                                    const student = allUsers.find(user => user.userid === studentId);
                                    return (
                                        <tr key={studentId}>
                                            <td>{student ? student.firstname : "Nombre no disponible"}</td>
                                            <td>
                                                <button onClick={() => handleRemoveStudent(studentId)}>
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className={styles.buttonContainer}>
                            <button onClick={() => setIsGroupModalOpen(false)} className={styles.secondaryButton}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail;