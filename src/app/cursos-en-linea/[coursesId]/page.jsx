"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams,useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import useFetchCourse from "@/hooks/fetchCourses/useFetchCourse";
import styles from "./page.module.css";

import CourseDetails from "@/components/courseDetails/courseDetails";
import CourseVideo from "@/components/courseVideo/courseVideo";
import Features from "@/components/features/features";
import ModuleCard from "@/components/moduleCards/moduleCards";

const CourseDetail = ({ params }) => {
    const searchParams = useSearchParams();
    const courseId = params?.coursesId || searchParams.get("courseId");

    const { course, setCourse } = useFetchCourse(courseId);

    const [modules, setModules] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    console.log("try",course)
    const { currentUser, isAdmin } = useAuth();

    useEffect(() => {
        const fetchModulesAndClasses = async () => {
            if (!courseId) return;

            try {
                const response = await fetch(`http://localhost:3000/api/modules/course/${courseId}`);
                const modulesData = await response.json();
                console.log(modulesData)
                const modulesWithSortedClasses = modulesData.map((mod) => ({
                    ...mod,
                    classes: Array.isArray(mod.classes)
                        ? mod.classes.sort((a, b) => a.orderClass - b.orderClass)
                        : [],
                }));


                modulesWithSortedClasses.sort((a, b) => a.order - b.order);
                setModules(modulesWithSortedClasses);
            } catch (error) {
                console.error("Error fetching modules and classes:", error);
            }
        };

        fetchModulesAndClasses();
    }, [courseId]);

    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            if (!currentUser || !courseId) return;

            try {
                const res = await fetch(`/api/users/${currentUser.uid}/enrollments`);
                const data = await res.json();
                setIsEnrolled(data.includes(courseId));
            } catch (error) {
                console.error("Error checking enrollment status:", error);
            }
        };

        checkEnrollmentStatus();
    }, [currentUser, courseId]);

    const handleFieldChange = async (field, value) => {
        try {
            await fetch(`/api/courses/${courseId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ [field]: value }),
            });
        } catch (error) {
            console.error("Error updating course field:", error);
        }
    };

    const addModule = async () => {
        try {
            const res = await fetch(`/api/courses/${courseId}/modules`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title: "Nuevo Módulo" }),
            });

            const newModule = await res.json();

            setModules((prevModules) => [
                ...prevModules,
                { ...newModule, classes: [] },
            ]);
        } catch (error) {
            console.error("Error adding module:", error);
        }
    };

    return (
        <div className={styles.container}>
            {!course ? (
                <p>Cargando curso...</p>
            ) : (
                <>
                    {isAdmin ? (
                        <input
                            type="text"
                            value={course.title || ""}
                            onChange={(e) => handleFieldChange("title", e.target.value)}
                            className={styles.titleInput}
                        />
                    ) : (
                        <span className={styles.titleText}>
                            {course.title || "Sin título disponible"}
                        </span>
                    )}

                    <div className={styles.courseMainContent}>
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
                        <Features
                            collectionName="onlineCourses"
                            courseId={courseId}
                            course={course}
                            setCourse={() => { }}
                        />
                    )}

                    {modules.length > 0 ? (
                        modules.map((classModule, moduleIndex) => (
                            <ModuleCard
                                key={classModule.id}
                                moduleData={{
                                    ...classModule,
                                    order: moduleIndex,
                                    totalModules: modules.length,
                                }}
                                totalModules={modules}
                                isAdmin={isAdmin}
                                collectionName="onlineCourses"
                                courseId={courseId}
                                onModulesUpdate={setModules}
                            />
                        ))
                    ) : (
                        <p>No hay módulos disponibles.</p>
                    )}

                    {isAdmin && (
                        <button
                            onClick={addModule}
                            className={styles.addModuleButton}
                            title="Añadir Módulo"
                        >
                            Añadir Módulo
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default CourseDetail;
