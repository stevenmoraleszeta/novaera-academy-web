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

const CourseDetail = ({ params }) => {
    const searchParams = useSearchParams();
    const resolvedParams = use(params);
    const courseId = resolvedParams.coursesId || searchParams.get("courseId");
    const { course, setCourse } = useFetchCourse(courseId, 'onlineCourses');
    const router = useRouter();

    console.log("course info:", course);
    console.log("courseId recibido en hook:", courseId);

    const [modules, setModules] = useState([]);
    const { currentUser, isAdmin } = useAuth();
    const [isEnrolled, setIsEnrolled] = useState(false);

    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState(course?.videoUrl || "");

    const openVideoModal = () => {
        setVideoUrl(course?.videourl || "https://www.youtube.com/watch?v=zLRCwQS7XAM");
        setIsVideoModalOpen(true);
    };

    useEffect(() => {
        const fetchModulesAndClasses = async () => {
            if (!courseId) return;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules/course/${courseId}`);
                const modulesData = await response.json();
                console.log("Módulos y clases recibidos:", modulesData.moduleid);
                const modulesWithSortedClasses = modulesData.map((mod, idx) => ({
                    ...mod,
                    id: mod.moduleid, // Usa moduleid como id único
                    classes: Array.isArray(mod.classes)
                        ? mod.classes.map((cls, cidx) => ({
                            ...cls,
                            id: cls.classid || cls._id || `class-${cidx}` // Usa classid para las clases
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
            console.log("currentUser:", currentUser, "courseId:", courseId);
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
            // Calculates the new module order
            const orderModule = modules.length + 1;
            const newModule = {
                title: "Nuevo Módulo",
                orderModule,
                courseId,
            };

            // Call the API to create a new module
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

            // Refresh the modules list
            const modulesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules/course/${courseId}`);
            const modulesData = await modulesResponse.json();

            // Updates modules states
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

    const onClassClick = (moduleId, classId) => {
        console.log("Clase seleccionada:", moduleId, classId);
        router.push(`/cursos-en-linea/${courseId}/${moduleId}/${classId}`);
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
                        key={classModule.id || `module-${moduleIndex}`}
                        moduleData={{
                            ...classModule,
                            order: moduleIndex,
                        }}
                        totalModules={modules}
                        isAdmin={isAdmin}
                        collectionName={'onlineCourses'}
                        courseId={courseId}
                        onModulesUpdate={setModules}
                        onClassClick={onClassClick}
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
        </div>
    );
};

export default CourseDetail;