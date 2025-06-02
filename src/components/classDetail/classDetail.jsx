"use client";

import React, { useEffect, useState } from "react";
import styles from "./ClassDetail.module.css";
import ResourceList from "@/components/resourceList/resourceList";
import FixedBar from "@/components/fixedBarClasses/fixedBar";
import RestrictedContent from "@/components/restrictedContent/restrictedContent";
import { Modal } from "@/components/modal/modal";

const ClassDetail = ({
    courseId,
    moduleId,
    classId,
    currentUser,
    isAdmin,
    isEnrolled = true, // Puedes cambiar esto según tu lógica
    onBackToSyllabus,
}) => {
    const [classTitle, setClassTitle] = useState("");
    const [resources, setResources] = useState([]);
    const [classesInModule, setClassesInModule] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isPreviousClassCompleted, setIsPreviousClassCompleted] = useState(true);
    const [isRestricted, setIsRestricted] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!classId || !courseId || !moduleId) return;
            try {
                const url = `${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error("No se pudo obtener la clase");
                const data = await res.json();
                setClassTitle(data.title || "");

                const resourcesUrl = `${process.env.NEXT_PUBLIC_API_URL}/class-resources/by-course-module-class/${courseId}/${moduleId}/${classId}`;
                const resourcesRes = await fetch(resourcesUrl);
                if (!resourcesRes.ok) throw new Error("No se pudieron obtener los recursos");
                const resourcesData = await resourcesRes.json();
                setResources(resourcesData || []);
            } catch (error) {
                console.error("Error al obtener la clase o recursos:", error);
            }
        };
        fetchData();
    }, [classId, courseId, moduleId]);

    const handleCompleteClass = async () => {
        try {
            if (!currentUser || !currentUser.id) {
                console.error("Usuario no autenticado.");
                return;
            }
            const completedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${currentUser.id}/completed-classes`);
            if (!completedRes.ok) {
                console.error("No se pudo obtener el progreso del usuario.");
                return;
            }
            const completedData = await completedRes.json();
            const completedClasses = completedData.completedClasses || [];
            const currentClassIndex = classesInModule.findIndex(cls => cls.id === classId);
            if (currentClassIndex > 0 && !isCompleted) {
                const previousClassId = classesInModule[currentClassIndex - 1].id;
                if (!completedClasses.includes(previousClassId)) {
                    setIsAlertOpen(true);
                    console.error("La clase anterior no está completada. No puedes completar esta clase.");
                    return;
                }
            }
            const newCompletedStatus = !isCompleted;
            const updatedClasses = newCompletedStatus
                ? [...completedClasses, classId]
                : completedClasses.filter(id => id !== classId);
            const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${currentUser.id}/completed-classes`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completedClasses: updatedClasses }),
            });
            if (!updateRes.ok) {
                throw new Error("No se pudo actualizar el progreso de la clase.");
            }
            setIsCompleted(newCompletedStatus);
        } catch (error) {
            console.error("Error actualizando el estado de la clase:", error);
        }
    };

    const handleBackToSyllabus = () => {
        if (onBackToSyllabus) {
            onBackToSyllabus();
        }
    };

    const handleConsultMentor = () => {
        const message = encodeURIComponent(`Hola, tengo una pregunta sobre la clase "${classTitle}".`);
        const whatsappUrl = `https://wa.me/+50661304830?text=${message}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <div>
            {isRestricted ? (
                <RestrictedContent
                    isAdmin={isAdmin}
                    isEnrolled={isEnrolled}
                    courseId={courseId}
                />
            ) : (
                <div className={styles.classDetailContainer}>
                    <div className={styles.titleContainer}>
                        {isAdmin ? (
                            <input
                                type="text"
                                value={classTitle}
                                onChange={(e) => setClassTitle(e.target.value)}
                                className={styles.titleInput}
                            />
                        ) : (
                            <span className={styles.titleInput}>{classTitle}</span>
                        )}
                    </div>
                    <ResourceList
                        resources={resources}
                        isAdmin={isAdmin}
                        setResources={setResources}
                        setIsModalOpen={setIsModalOpen}
                    />
                    <FixedBar
                        classesInModule={classesInModule}
                        classId={classId}
                        isCompleted={isCompleted}
                        isPreviousClassCompleted={isPreviousClassCompleted}
                        handleCompleteClass={handleCompleteClass}
                        handleBackToSyllabus={handleBackToSyllabus}
                        handleConsultMentor={handleConsultMentor}
                    />
                    {isModalOpen && (
                        <Modal
                            isOpen={isModalOpen}
                            resources={resources}
                            setResources={setResources}
                            title="Agregar recurso"
                            onClose={() => setIsAlertOpen(false)}
                            modalType="addResources"
                        />
                    )}
                    {isAlertOpen && (
                        <Modal
                            title="No se puede completar esta clase"
                            description="Parece que la clase anterior aún no se completa"
                            isOpen={isModalOpen}
                            onClose={() => setIsAlertOpen(false)}
                            modalType="alert"
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassDetail;