"use client";

import React, { useEffect, useState, use, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import useFetchCourse from "@/hooks/fetchCourses/useFetchCourse";

import { useCompletedClasses } from "@/hooks/useCompletedClasses/useCompletedClasses"; 
import CourseDetails from "@/components/courseDetails/courseDetails";
import CourseVideo from "@/components/courseVideo/courseVideo";
import Features from "@/components/features/features";
import ModuleCard from "@/components/moduleCards/moduleCards";
import { Modal } from "@/components/modal/modal";
import ProjectsList from "@/components/projects/projects";
import ClassesRecorded from "@/components/classesRecorded/ClassesRecorded";

import { FaPlus, FaTrash } from "react-icons/fa";
import styles from "./courseComponent.module.css";

const CourseDetail = ({
    courseIdentification,
    isLiveCourse = false,
    studentProjects = [],
    averageScore = null,
}) => {
    const searchParams = useSearchParams();
    const courseIdFromSearch = searchParams.get("courseId");
    const courseId = courseIdFromSearch || courseIdentification;
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
    const [mentorList, setMentorList] = useState([]);
    
    const { completedClasses, fetchCompletedStatus } = useCompletedClasses({
        userId: currentUser?.userid,
    });

    useEffect(() => {
        if (currentUser?.userid) {
            fetchCompletedStatus();
        }
    }, [currentUser?.userid]);

    const getClassId = (cls) => cls.classid || cls.id;

    const highlightedClassId = useMemo(() => {
        for (const module of modules) {
            const nextClass = module.classes?.find(
                cls => !completedClasses.includes(Number(getClassId(cls)))
            );
            if (nextClass) {
                return getClassId(nextClass);
            }
        }
        return null;
    }, [modules, completedClasses]);

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
        if (!courseId) {
            console.warn("No hay courseId válido, no se hace fetch");
            return;
        }
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-courses/by-course/${courseId}`)
            .then(res => res.json())
            .then(data => {
                setStudents(data.map(sc => sc.userid));
            });
    }, [isLiveCourse, isAdmin, courseId]);

    useEffect(() => {
        if (course && course.mentorid) {
            setSelectedMentor(course.mentorid);
        }
    }, [course]);

    const openGroupModal = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`);
            const data = await res.json();
            setSelectedMentor(data.mentorid || "");
            const mentorRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mentors`);
            const mentorData = await mentorRes.json();
            setMentorList(Array.isArray(mentorData) ? mentorData : []);
        } catch (e) {
            setSelectedMentor("");
            setMentorList([]);
        }
        setIsGroupModalOpen(true);
    };

    const assignMentor = async (mentorId) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/mentor`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mentorId: Number(mentorId) }),
            });
            setSelectedMentor(Number(mentorId));
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
                const updatedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-courses/by-course/${courseId}`);
                const updatedData = await updatedRes.json();
                setStudents(updatedData.map(sc => sc.userid));
            }
        } catch (e) {
            console.error("Error al eliminar estudiante:", e);
        }
    };

    const openVideoModal = () => {
        setVideoUrl(course?.videoUrl || "https://www.youtube.com/watch?v=zLRCwQS7XAM");
        setIsVideoModalOpen(true);
    };

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
            <div className={styles.mainContentGrid}>
                <div className={styles.leftColumn}>
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
                                highlightedClassId={highlightedClassId}
                                completedClasses={completedClasses}
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
                </div>

                <div className={styles.rightColumn}>
                    {/* ProjectsList solo para cursos en vivo */}
                    {isLiveCourse && (
                        <ProjectsList
                            isAdmin={isAdmin}
                            isStudentInCourse={isEnrolled}
                            studentProjects={studentProjects}
                            courseId={courseId}
                            averageScore={averageScore}
                            students={students}
                            mentor={selectedMentor}
                        />
                    )}
                    {/* Records solo para cursos en vivo */}
                    {isLiveCourse && <ClassesRecorded courseId={courseId} isAdmin={isAdmin} />}
                    {/* {isLiveCourse && <ClassesRecorded courseId={courseId} />}    */}
                </div>
            </div>

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
                            {Array.isArray(mentorList) && mentorList.map(mentor => {
                                const user = allUsers.find(u => u.userid === mentor.userid);
                                return (
                                    <option key={mentor.mentorid} value={mentor.mentorid}>
                                        {user ? user.firstname : "Nombre no disponible"}
                                    </option>
                                );
                            })}
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