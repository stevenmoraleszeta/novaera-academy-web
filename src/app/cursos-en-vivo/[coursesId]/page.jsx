"use client";

import React, { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import useFetchCourse from "@/hooks/fetchCourses/useFetchCourse";
import styles from "./page.module.css";

import CourseDetails from "@/components/courseDetails/courseDetails";
import CourseVideo from "@/components/courseVideo/courseVideo";
import Features from "@/components/features/features";
import ModuleCard from "@/components/moduleCards/moduleCards";
import ProjectsList from "@/components/projects/projects";

const CourseDetail = ({ params }) => {
    const searchParams = useSearchParams();
    const resolvedParams = use(params);
    const courseId = resolvedParams.coursesId || searchParams.get("courseId");
    const course = useFetchCourse(courseId, 'liveCourses');

    const [modules, setModules] = useState([]);
    const { currentUser, isAdmin } = useAuth();
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchModulesAndClasses = async () => {
            if (!courseId) {
                console.error("courseId is undefined");
                return;
            }

            try {
                const modulesSnapshot = await getDocs(
                    collection(db, "liveCourses", courseId, "modules")
                );

                const fetchedModules = await Promise.all(
                    modulesSnapshot.docs.map(async (moduleDoc) => {
                        const moduleData = moduleDoc.data();
                        const classesSnapshot = await getDocs(
                            collection(
                                db,
                                "liveCourses",
                                courseId,
                                "modules",
                                moduleDoc.id,
                                "classes"
                            )
                        );

                        const classes = classesSnapshot.docs.map((classDoc) => ({
                            id: classDoc.id,
                            ...classDoc.data(),
                        }));

                        classes.sort((a, b) => a.order - b.order);
                        return {
                            id: moduleDoc.id,
                            ...moduleData,
                            classes,
                        };
                    })
                );

                fetchedModules.sort((a, b) => a.order - b.order);
                setModules(fetchedModules);
            } catch (error) {
                console.error("Error fetching modules and classes:", error);
            }
        };

        fetchModulesAndClasses();
    }, [courseId]);

    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            if (!currentUser) return;

            try {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const enrolledCourses = userData.enrolledCourses || [];
                    setIsEnrolled(enrolledCourses.includes(courseId));
                }
            } catch (error) {
                console.error("Error checking enrollment status:", error);
            }
        };

        checkEnrollmentStatus();
    }, [currentUser, courseId]);

    const handleFieldChange = async (field, value) => {
        const updatedCourse = { ...course, [field]: value };
        setCourse(updatedCourse);
        const docRef = doc(db, "liveCourses", courseId);
        await updateDoc(docRef, { [field]: value });
    };

    const addModule = async () => {
        const newModule = { title: "Nuevo Módulo", classes: [] };
        const moduleRef = await addDoc(
            collection(db, "liveCourses", courseId, "modules"),
            newModule
        );
        setModules((prevModules) => [
            ...prevModules,
            { id: moduleRef.id, ...newModule },
        ]);
    };

    return (
        <div className={styles.container}>
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
                <Features collectionName={'liveCourses'} courseId={courseId} course={course} setCourse={course}></Features>
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
                <button onClick={addModule} className={styles.addModuleButton} title="Añadir Módulo">
                    Add Module
                </button>
            )}
            <ProjectsList
                isAdmin={isAdmin}
                isStudentInCourse={isStudentInCourse}
                projects={projects}
                studentProjects={studentProjects}
                courseId={courseId}
                averageScore={averageScore}
                handleEditProject={handleEditProject}
                moveProject={moveProject}
                deleteProject={deleteProject}
                addProject={addProject}
            />
        </div>
    );
};

export default CourseDetail;