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

    const [orderClass, setOrderClass] = useState(1);
    const [restricted, setRestricted] = useState(false);

    const [newResourceType, setNewResourceType] = useState("");
    const [newResourceContent, setNewResourceContent] = useState("");
    const [newResourceTitle, setNewResourceTitle] = useState("");
    const [videoStart, setVideoStart] = useState("");
    const [videoEnd, setVideoEnd] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [newResourceWidth, setNewResourceWidth] = useState("");
    const [newResourceHeight, setNewResourceHeight] = useState("");
    const [historyIndex, setHistoryIndex] = useState(0);
    const [history, setHistory] = useState([""]);

    useEffect(() => {
        const fetchData = async () => {
            if (!classId || !courseId || !moduleId) return;
            try {
                const url = `${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error("No se pudo obtener la clase");
                const data = await res.json();
                setClassTitle(data.title || "");
                setOrderClass(Number(data.orderClass || data.orderclass));
                setRestricted(data.restricted ?? false);

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

    const openModal = (
        type = "",
        content = "",
        title = "",
        start = "",
        end = "",
        index = null,
        width = "",
        height = ""
    ) => {
        setIsModalOpen(true);
        setNewResourceType(type || "");
        setNewResourceTitle(title || "");
        setNewResourceContent(content || "");
        setVideoStart(start || "");
        setVideoEnd(end || "");
        setEditingIndex(index);
        setNewResourceWidth(width || "");
        setNewResourceHeight(height || "");
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingIndex(null);
    };

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

    const handleSaveTitle = async () => {
        const payload = {
            title: classTitle,
            courseId,
            moduleId,
            orderClass,
            restricted
        };
        console.log("Payload enviado al backend:", payload);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.log("Respuesta del backend:", errorData);
                throw new Error("No se pudo actualizar el título");
            }
        } catch (error) {
            console.error("Error al actualizar el título:", error);
        }
    };

    const handleSaveResource = async () => {
        const typeMap = {
            text: "documento",
            code: "documento",
            title: "documento",
            pdfUrl: "documento",
            videoUrl: "video",
            imageUrl: "imagen",
            link: "enlace",
            sendProject: "quiz"
        };

        const toTimeString = (seconds) => {
            if (!seconds && seconds !== 0) return undefined;
            const sec = parseInt(seconds, 10);
            if (isNaN(sec)) return undefined;
            const h = String(Math.floor(sec / 3600)).padStart(2, "0");
            const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
            const s = String(sec % 60).padStart(2, "0");
            return `${h}:${m}:${s}`;
        };

        const getNextOrderResource = () => {
            if (!resources || resources.length === 0) return 1;
            const maxOrder = Math.max(...resources.map(r => Number(r.orderresource || r.orderResource || 0)));
            return maxOrder + 1;
        };


        const payload = {
            classId: Number(classId),
            contentResource: newResourceContent,
            typeResource: typeMap[newResourceType] || "documento",
            ...(newResourceType === "videoUrl" && toTimeString(videoStart) && { startTime: toTimeString(videoStart) }),
            ...(newResourceType === "videoUrl" && toTimeString(videoEnd) && { endTime: toTimeString(videoEnd) }),
            ...(newResourceType === "imageUrl" && newResourceWidth !== "" && Number(newResourceWidth) > 0 && { width: Number(newResourceWidth) }),
            ...(newResourceType === "imageUrl" && newResourceHeight !== "" && Number(newResourceHeight) > 0 && { height: Number(newResourceHeight) }),
        };

        if (["link", "pdfUrl"].includes(newResourceType) && newResourceTitle) {
            payload.contentResource = `${newResourceTitle}||${newResourceContent}`;
        }

        try {
            if (editingIndex !== null) {
                console.log('Con editingIndex')
                const resourceToEdit = resources[editingIndex];
                const id = resourceToEdit.id || resourceToEdit.resourceId || resourceToEdit.resourceid;
                payload.orderResource = resourceToEdit.orderresource || resourceToEdit.orderResource || (editingIndex + 1);

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/class-resources/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.error || (data.errors && data.errors[0]?.msg) || "Error al actualizar el recurso");
                    return;
                }

                setResources(resources.map((r, i) => i === editingIndex ? data.resource : r));
                setIsModalOpen(false);
                setEditingIndex(null);
            } else {
                console.log('Sin editingIndex')

                payload.orderResource = getNextOrderResource();

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/class-resources`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.error || (data.errors && data.errors[0]?.msg) || "Error al guardar el recurso");
                    return;
                }

                setResources([...resources, data.resource]);
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("Error al guardar el recurso:", error);
            alert("Error al guardar el recurso");
        }
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
                                onBlur={handleSaveTitle}
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
                        setIsModalOpen={openModal}
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
                            onClose={closeModal}
                            resources={resources}
                            setResources={setResources}
                            title={editingIndex !== null ? "Modify Resource" : "Add New Resource"}
                            modalType="customContent"
                            customContent={
                                <>
                                    <div>
                                        Select Resource Type:
                                        <select
                                            value={newResourceType}
                                            onChange={(e) => setNewResourceType(e.target.value)}
                                            className={styles.modalSelect}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="title">Title</option>
                                            <option value="text">Text</option>
                                            <option value="code">Code</option>
                                            <option value="videoUrl">Video URL</option>
                                            <option value="imageUrl">Image URL</option>
                                            <option value="link">Link</option>
                                            <option value="pdfUrl">PDF URL</option>
                                            <option value="sendProject">Send Project</option>
                                        </select>
                                    </div>

                                    {(newResourceType === "link" || newResourceType === "pdfUrl") && (
                                        <div>
                                            Enter Title:
                                            <input
                                                type="text"
                                                value={newResourceTitle}
                                                onChange={(e) => setNewResourceTitle(e.target.value)}
                                                className={styles.modalInput}
                                                placeholder="Enter title"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        Enter Content:
                                        <textarea
                                            type="text"
                                            value={newResourceContent}
                                            onChange={(e) => setNewResourceContent(e.target.value)}
                                            className={styles.modalInput}
                                            placeholder="Enter content"
                                        />
                                    </div>

                                    {newResourceType === "videoUrl" && (
                                        <>
                                            <label>
                                                Start Time (seconds):
                                                <input
                                                    type="number"
                                                    value={videoStart}
                                                    onChange={(e) => setVideoStart(e.target.value)}
                                                    className={styles.modalInput}
                                                />
                                            </label>
                                            <label>
                                                End Time (seconds):
                                                <input
                                                    type="number"
                                                    value={videoEnd}
                                                    onChange={(e) => setVideoEnd(e.target.value)}
                                                    className={styles.modalInput}
                                                />
                                            </label>
                                        </>
                                    )}
                                    {newResourceType === "imageUrl" && (
                                        <>
                                            <label>
                                                Ancho de la imagen (px):
                                                <input
                                                    type="number"
                                                    value={newResourceWidth}
                                                    onChange={(e) => setNewResourceWidth(e.target.value)}
                                                    className={styles.modalInput}
                                                    placeholder="Ancho de la imagen"
                                                />
                                            </label>
                                            <label>
                                                Alto de la imagen (px):
                                                <input
                                                    type="number"
                                                    value={newResourceHeight}
                                                    onChange={(e) => setNewResourceHeight(e.target.value)}
                                                    className={styles.modalInput}
                                                    placeholder="Alto de la imagen"
                                                />
                                            </label>
                                        </>
                                    )}
                                    <div className={styles.modalActions}>
                                        {newResourceType !== "" && (
                                            <button onClick={handleSaveResource}>
                                                {editingIndex !== null ? "Save Changes" : "Add"}
                                            </button>
                                        )}
                                        <button onClick={closeModal}>Cancel</button>
                                    </div>
                                </>
                            }
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