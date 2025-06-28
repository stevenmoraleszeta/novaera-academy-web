"use client";

import React, { useEffect, useState } from "react";
import styles from "./ClassDetail.module.css";
import ResourceList from "@/components/resourceList/resourceList";
import FixedBar from "@/components/fixedBarClasses/fixedBar";
import RestrictedContent from "@/components/restrictedContent/restrictedContent";
import { Modal } from "@/components/modal/modal";
import { useCompletedClasses } from "@/hooks/useCompletedClasses/useCompletedClasses";
import { useRouter } from "next/navigation";

const ClassDetail = ({
    courseId,
    moduleId,
    classId,
    currentUser,
    isAdmin,
    onBackToSyllabus,
}) => {
    const [classTitle, setClassTitle] = useState("");
    const [resources, setResources] = useState([]);
    const [classesInModule, setClassesInModule] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
    const {
        completedClasses,
        isCompleted,
        fetchCompletedStatus,
        setCompletedClasses,
        setIsCompleted,
    } = useCompletedClasses({
        userId: currentUser?.userid,
        classId,
    });

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isEnrolledState, setIsEnrolledState] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!currentUser || !currentUser.userid) {
            setShowLoginModal(true);
        }
    }, [currentUser]);

    useEffect(() => {
        const checkEnrollment = async () => {
            if (!currentUser || !currentUser.userid) return;
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/student-courses/${courseId}/${currentUser.userid}`
                );
                if (res.status === 200) {
                    setIsEnrolledState(true);
                } else {
                    setIsEnrolledState(false);
                }
            } catch (error) {
                setIsEnrolledState(false);
            }
        };
        if (currentUser && currentUser.userid) {
            checkEnrollment();
        }
    }, [currentUser, courseId]);

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

    useEffect(() => {
        fetchCompletedStatus();
    }, [currentUser, classId, moduleId, isModalOpen]);

    useEffect(() => {
        if (!courseId || !moduleId) return;
        const fetchClassesInModule = async () => {
            try {
                const url = `${process.env.NEXT_PUBLIC_API_URL}/classes/by-course-module/${courseId}/${moduleId}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error("No se pudieron obtener las clases del módulo");
                const data = await res.json();
                setClassesInModule(data || []);
            } catch (error) {
                console.error("Error al obtener las clases del módulo:", error);
            }
        };
        fetchClassesInModule();
    }, [courseId, moduleId]);

    useEffect(() => {
        if (!classesInModule.length || !classId) return;

        const idx = classesInModule.findIndex(
            c => Number(c.id ?? c.classid ?? c.classId) === Number(classId)
        );
        if (idx === -1) return;

        if (idx === 0) {
            setIsPreviousClassCompleted(true);
            return;
        }
        const prevClassId = Number(classesInModule[idx - 1].id ?? classesInModule[idx - 1].classid ?? classesInModule[idx - 1].classId);
        const completed = completedClasses.includes(prevClassId);
        setIsPreviousClassCompleted(completed);
    }, [classesInModule, classId, completedClasses]);

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
        let resourceType = type || "";
        let resourceTitle = title || "";
        let resourceContent = content || "";
        if ((resourceType === "link" || resourceType === "pdfUrl") && resourceContent.includes("||")) {
            const [titlePart, contentPart] = resourceContent.split("||");
            resourceTitle = titlePart;
            resourceContent = contentPart;
        }
        setIsModalOpen(true);
        setNewResourceType(resourceType);
        setNewResourceTitle(resourceTitle);
        setNewResourceContent(resourceContent);
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
            if (!currentUser || !currentUser.userid) {
                console.error("Usuario no autenticado.");
                return;
            }

            const getClassId = (cls) => cls.id ?? cls.classid ?? cls.classId;
            const currentClassIndex = classesInModule.findIndex(
                cls => Number(getClassId(cls)) === Number(classId)
            );

            // Si no es la primera clase, verifica que la anterior esté completada
            if (currentClassIndex > 0) {
                const previousClassId = Number(getClassId(classesInModule[currentClassIndex - 1]));
                if (!completedClasses.includes(previousClassId)) {
                    setIsAlertOpen(true);
                    console.error("La clase anterior no está completada. No puedes completar esta clase.");
                    return;
                }
            }

            // Si pasa la validación, completa o descompleta la clase
            const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${currentUser.userid}/completed-classes`;
            const completedRes = await fetch(url);
            if (!completedRes.ok) {
                const errorText = await completedRes.text();
                console.error("No se pudo obtener el progreso del usuario. Status:", completedRes.status, "Respuesta:", errorText);
                return;
            }
            const completedData = await completedRes.json();
            const completedClassesFromApi = (completedData.completedClasses || []).map(Number);

            const isCompleted = completedClassesFromApi.includes(Number(classId));
            const newCompletedStatus = !isCompleted;
            let updatedClasses;
            if (newCompletedStatus) {
                updatedClasses = Array.from(new Set([...completedClassesFromApi, Number(classId)]));
            } else {
                updatedClasses = completedClassesFromApi.filter(id => id !== Number(classId));
            }

            const sanitizedClasses = updatedClasses
                .map(id => Number(id))
                .filter(id => !isNaN(id) && id !== 0)

            const updateRes = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completedClasses: sanitizedClasses }),
            });
            if (!updateRes.ok) {
                throw new Error("No se pudo actualizar el progreso de la clase.");
            }

            // Refresca el estado tras actualizar
            const refreshedRes = await fetch(url);
            if (refreshedRes.ok) {
                const refreshedData = await refreshedRes.json();
                setIsCompleted((refreshedData.completedClasses || []).map(Number).includes(Number(classId)));
            }

            await fetchCompletedStatus();
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
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorData = await res.json();
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

    const applyStyleToText = (style) => {
        if (newResourceType !== "text") return;

        const textarea = document.querySelector(`.${styles.modalInput}`);
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;

        let updatedContent = newResourceContent;

        // Extrae las partes del texto seleccionadas y no seleccionadas
        const before = updatedContent.substring(0, selectionStart);
        const selected = updatedContent.substring(selectionStart, selectionEnd);
        const after = updatedContent.substring(selectionEnd);

        switch (style) {
            case "bold":
                updatedContent = `${before}*${selected}*${after}`;
                break;
            case "bullet":
                // Agrega `-` a cada línea seleccionada
                updatedContent = `${before}${selected
                    .split("\n")
                    .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
                    .join("\n")}${after}`;
                break;
            case "delimitedList":
                // Envuelve el bloque seleccionado con `+`
                updatedContent = `${before}+\n${selected
                    .split("\n")
                    .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
                    .join("\n")}\n+${after}`;
                break;
            default:
                break;
        }

        setNewResourceContent(updatedContent);

        // Restaura el foco y la selección
        setTimeout(() => {
            textarea.focus();
            const newSelectionStart = selectionStart + (style === "bold" ? 1 : 0);
            const newSelectionEnd = newSelectionEnd || newSelectionStart + selected.length;
            textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
        }, 0);
    };

    const isFirstClass = React.useMemo(() => {
        if (!classesInModule.length || !classId) return false;
        const sorted = [...classesInModule].sort(
            (a, b) =>
                Number(a.orderClass ?? a.orderclass ?? a.order) -
                Number(b.orderClass ?? b.orderclass ?? b.order)
        );
        const first = sorted[0];
        const firstId = first?.id ?? first?.classid ?? first?.classId;
        return String(firstId) === String(classId);
    }, [classesInModule, classId]);

    if (showLoginModal && !isFirstClass) {
        return (
            <Modal
                isOpen={showLoginModal}
                onClose={() => router.push("/login")}
                title="Inicia sesión"
                description="Debes iniciar sesión para acceder a las clases."
                modalType="alert"
            >
                <button onClick={() => router.push("/login")}>Ir a login</button>
            </Modal>
        );
    }

    if (!isEnrolledState && currentUser && currentUser.userid && !isFirstClass && !isAdmin) {
        return (
            <Modal
                isOpen={true}
                onClose={() => router.push(`/cursos-en-linea/${courseId}`)}
                title="No inscrito"
                description="Debes inscribirte en el curso para acceder a las clases."
                modalType="alert"
            >
                <button onClick={() => router.push(`/cursos-en-linea/${courseId}`)}>
                    Volver al curso
                </button>
            </Modal>
        );
    }

    return (
        <div>
            {isRestricted ? (
                <RestrictedContent
                    isAdmin={isAdmin}
                    isEnrolled={isEnrolledState}
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
                        >
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
                                {newResourceType === "text" && (
                                    <div className={styles.textEditorButtons}>
                                        <button onClick={() => applyStyleToText("bold")} className={styles.styleButton}>Bold</button>
                                        <button onClick={() => applyStyleToText("bullet")} className={styles.styleButton}>Bullet List</button>
                                        <button onClick={() => applyStyleToText("delimitedList")} className={styles.styleButton}>Delimited List</button>
                                    </div>
                                )}
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
                        </Modal>
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