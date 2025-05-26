"use client";

import React, { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import useFetchCourse from "@/hooks/fetchCourses/useFetchCourse";

import CourseDetails from "@/components/courseDetails/courseDetails";
import CourseVideo from "@/components/courseVideo/courseVideo";
import Features from "@/components/features/features";
import ModuleCard from "@/components/moduleCards/moduleCards";

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

    console.log("modules:", modules);

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
                <CourseVideo course={course} isAdmin={isAdmin} openVideoModal={() => { }} />
                <CourseDetails
                    course={course}
                    isAdmin={isAdmin}
                    isEnrolled={isEnrolled}
                    handleFieldChange={handleFieldChange}
                    handleContactClick={() => { }}
                    openModal={() => { }}
                    openVideoModal={() => { }}
                />
            </div>
            {!isEnrolled && (
                <Features collectionName={'onlineCourses'} courseId={courseId} course={course} setCourse={course}></Features>
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
                        onModulesUpdate={course}
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
        </div>
    );
};

export default CourseDetail;