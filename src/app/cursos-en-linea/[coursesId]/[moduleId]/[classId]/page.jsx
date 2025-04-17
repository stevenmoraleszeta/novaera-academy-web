import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/firebase";
import styles from "./page.module.css";
import ResourceList from "@/components/ResourceList";
import FixedBar from "@/components/FixedBar";
import RestrictedContent from "@/components/RestrictedContent";
import { Modal } from "@/components/modal/modal";

const ClassDetail = () => {
    const router = useRouter();
    const { currentUser, isAdmin } = useAuth();
    const { courseId, moduleId, classId } = useParams();

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
            // Fetch logic here
        };
        fetchData();
    }, [classId, courseId, moduleId, currentUser]);

    const handleCompleteClass = async () => {
        // Logic for completing classes
    };

    const handleBackToSyllabus = () => {
        router.push(`/cursos-en-linea/${courseId}`);
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
                    isEnrolled={true} // Replace with  enrollment logic
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
            )
            }
        </div >
    );
};

export default ClassDetail;