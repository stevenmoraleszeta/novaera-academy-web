"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

import CourseDetails from "@/components/courseDetails/courseDetails";
import CourseVideo from "@/components/courseVideo/courseVideo";
import Features from "@/components/features/features";
import ModuleCard from "@/components/moduleCards/moduleCards";

const defaultFeatures = [
    {
        iconUrl:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FReloj%20Icon.png?alt=media&token=d323e959-9e9a-493c-a697-3b40799f94de",
        title: "Curso asincrónico",
        description: "Aprende cualquier día y hora.",
    },
    {
        iconUrl:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FIdea%20Icon.png?alt=media&token=38c0b934-1b7c-45ac-b665-26205af181a7",
        title: "Aprendizaje práctico",
        description: "Aprende con problemas reales.",
    },
    {
        iconUrl:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPerson%20Notify%20Icon.png?alt=media&token=c37120e9-371b-45c9-b24e-5bc891fbfde3",
        title: "Atención personalizada",
        description: "Consulta al mentor en cualquier momento.",
    },
    {
        iconUrl:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificado%20Icon.png?alt=media&token=608dc368-d510-4276-a551-f50cdcb4b7e6",
        title: "Certificado de finalización",
        description: "Incrementa tu conocimiento.",
    },
];

const CourseDetail = ({ params }) => {
    const searchParams = useSearchParams();
    const resolvedParams = use(params);
    const courseId = resolvedParams.coursesId || searchParams.get("courseId");
    const [course, setCourse] = useState({
        title: "Introducción a la Programación con Python",
        description:
            "Conviértete en programador con Python desde cero. No necesitarás conocimientos previos y cuenta con apoyo personalizado.",
        discountedPrice: 35,
        originalPrice: 65,
        category: "Programación",
        videoUrl: "https://www.youtube.com/embed/rc9Db0uuOPI?si=DiiGkghjvsq_QkGU",
        imageUrl:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FprogrammingDefaulImage.webp?alt=media&token=1ddc96cb-88e5-498e-8d9f-a870f32ecc45",
        courseIcon:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FpythonIconPng.png?alt=media&token=6583f3bc-0ce1-42f8-adbe-75e4ede5e662",
        features: [
            {
                iconUrl:
                    "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FReloj%20Icon.png?alt=media&token=d323e959-9e9a-493c-a697-3b40799f94de",
                title: "Curso asincrónico",
                description: "Aprende cualquier día y hora.",
            },
            {
                iconUrl:
                    "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FIdea%20Icon.png?alt=media&token=38c0b934-1b7c-45ac-b665-26205af181a7",
                title: "Aprendizaje práctico",
                description: "Aprende con problemas reales.",
            },
            {
                iconUrl:
                    "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPerson%20Notify%20Icon.png?alt=media&token=c37120e9-371b-45c9-b24e-5bc891fbfde3",
                title: "Atención personalizada",
                description: "Consulta al mentor en cualquier momento.",
            },
            {
                iconUrl:
                    "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificado%20Icon.png?alt=media&token=608dc368-d510-4276-a551-f50cdcb4b7e6",
                title: "Certificado de finalización",
                description: "Incrementa tu conocimiento.",
            },
        ],
    });
    const [modules, setModules] = useState([]);
    const { currentUser, isAdmin } = useAuth();
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) {
                console.error("courseId is undefined");
                return;
            }

            try {
                const docRef = doc(db, "onlineCourses", courseId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const fetchedData = docSnap.data();

                    if (!fetchedData.features || fetchedData.features.length === 0) {
                        fetchedData.features = defaultFeatures;
                        await updateDoc(docRef, { features: defaultFeatures }); // Update Firestore
                    }

                    setCourse((prevCourse) => ({
                        ...prevCourse,
                        ...fetchedData,
                    }));
                    document.title = `${fetchedData.title || "Curso"} - ZETA`;
                } else {
                    console.error("Course not found");
                    router.push("/cursos-en-linea");
                }
            } catch (error) {
                console.error("Error fetching course:", error);
            }
        };

        const fetchModulesAndClasses = async () => {
            if (!courseId) {
                console.error("courseId is undefined");
                return;
            }

            try {
                const modulesSnapshot = await getDocs(
                    collection(db, "onlineCourses", courseId, "modules")
                );

                const fetchedModules = await Promise.all(
                    modulesSnapshot.docs.map(async (moduleDoc) => {
                        const moduleData = moduleDoc.data();
                        const classesSnapshot = await getDocs(
                            collection(
                                db,
                                "onlineCourses",
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

        fetchCourse();
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
        const docRef = doc(db, "onlineCourses", courseId);
        await updateDoc(docRef, { [field]: value });
    };

    const addModule = async () => {
        const newModule = { title: "Nuevo Módulo", classes: [] };
        const moduleRef = await addDoc(
            collection(db, "onlineCourses", courseId, "modules"),
            newModule
        );
        setModules((prevModules) => [
            ...prevModules,
            { id: moduleRef.id, ...newModule },
        ]);
    };

    return (
        <div className={styles.container}>
            <CourseDetails
                course={course}
                isAdmin={isAdmin}
                isEnrolled={isEnrolled}
                handleFieldChange={handleFieldChange}
                handleContactClick={() => { }}
                openModal={() => { }}
                openVideoModal={() => { }}
            />
            <CourseVideo course={course} isAdmin={isAdmin} openVideoModal={() => { }} />
            {!isEnrolled && (
                <Features collectionName={'onlineCourses'} courseId={courseId} course={course} setCourse={setCourse}></Features>
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
                        collectionName={'onlineCourses'}
                        courseId={courseId}
                        onModulesUpdate={setModules}
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
        </div>
    );
};

export default CourseDetail;