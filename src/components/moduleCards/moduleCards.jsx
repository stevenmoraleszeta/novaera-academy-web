"use client";

import React from 'react';
import { FaArrowUp, FaArrowDown, FaPlus, FaTrash, FaCheck, FaLock, FaLockOpen } from 'react-icons/fa';
import styles from './moduleCard.module.css';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { useRouter } from "next/navigation";

const ModuleCard = ({
    moduleData,
    collectionName,
    isAdmin,
    courseId,
    totalModules,
    onModulesUpdate,
}) => {

    const router = useRouter();

    const onTitleChange = async (moduleId, newTitle) => {
        try {
            const moduleRef = doc(db, collectionName, courseId, "modules", moduleId);
            await updateDoc(moduleRef, { title: newTitle });

            onModulesUpdate((prevModules) =>
                prevModules.map((mod) =>
                    mod.id === moduleId ? { ...mod, title: newTitle } : mod
                )
            );
        } catch (error) {
            console.error("Error al actualizar el título del módulo:", error);
        }
    };

    const onDeleteModule = async (moduleId) => {
        if (confirm("¿Estás seguro de que deseas eliminar este módulo?")) {
            await deleteDoc(doc(db, collectionName, courseId, "modules", moduleId));
            onModulesUpdate((prevModules) =>
                prevModules.filter((mod) => mod.id !== moduleId)
            );
        }
    };

    const onMoveModule = async (index, direction) => {
        const newModules = [...totalModules];
        const [movedModule] = newModules.splice(index, 1);
        newModules.splice(index + direction, 0, movedModule);

        try {
            await Promise.all(
                newModules.map((mod, idx) => {
                    const moduleRef = doc(db, collectionName, courseId, "modules", mod.id);
                    return updateDoc(moduleRef, { order: idx });
                })
            );
            onModulesUpdate(newModules);
        } catch (error) {
            console.error("Error actualizando el orden de los módulos:", error);
        }
    };

    const onAddClass = async (moduleId) => {
        const newClass = { title: "Nueva Clase", order: moduleData.classes.length || 0 };
        const classRef = await addDoc(
            collection(db, collectionName, courseId, "modules", moduleId, "classes"),
            newClass
        );

        onModulesUpdate((prevModules) =>
            prevModules.map((mod) =>
                mod.id === moduleId
                    ? {
                        ...mod,
                        classes: [...mod.classes, { id: classRef.id, ...newClass }],
                    }
                    : mod
            )
        );
    };

    const onDeleteClass = async (moduleId, classId) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta clase?")) {
            await deleteDoc(doc(db, collectionName, courseId, "modules", moduleId, "classes", classId));

            onModulesUpdate((prevModules) =>
                prevModules.map((mod) =>
                    mod.id === moduleId
                        ? {
                            ...mod,
                            classes: mod.classes.filter((c) => c.id !== classId),
                        }
                        : mod
                )
            );
        }
    };

    const onMoveClass = async (classIndex, direction) => {
        const newClasses = [...moduleData.classes];
        const [movedClass] = newClasses.splice(classIndex, 1);
        newClasses.splice(classIndex + direction, 0, movedClass);

        try {
            await Promise.all(
                newClasses.map((cls, idx) => {
                    const classRef = doc(db, collectionName, courseId, "modules", moduleData.id, "classes", cls.id);
                    return updateDoc(classRef, { order: idx });
                })
            );

            onModulesUpdate((prevModules) =>
                prevModules.map((mod) =>
                    mod.id === moduleData.id ? { ...mod, classes: newClasses } : mod
                )
            );
        } catch (error) {
            console.error("Error actualizando el orden de las clases:", error);
        }
    };

    const onToggleClassRestriction = async (moduleId, classId, currentStatus) => {
        try {
            const classRef = doc(db, collectionName, courseId, "modules", moduleId, "classes", classId);
            await updateDoc(classRef, { restricted: !currentStatus });

            onModulesUpdate((prevModules) =>
                prevModules.map((mod) =>
                    mod.id === moduleId
                        ? {
                            ...mod,
                            classes: mod.classes.map((cls) =>
                                cls.id === classId ? { ...cls, restricted: !currentStatus } : cls
                            ),
                        }
                        : mod
                )
            );
        } catch (error) {
            console.error("Error cambiando restricción:", error);
        }
    };

    const onClassClick = (moduleId, classId) => {
        router.push(`/cursos-en-linea/${courseId}/${moduleId}/${classId}`);
    };

    return (
        <div className={styles.module}>
            <div className={styles.moduleHeader}>
                {isAdmin ? (
                    <input
                        type="text"
                        value={moduleData.title}
                        onChange={(e) => onTitleChange(moduleData.id, e.target.value)}
                        className={styles.moduleTitle}
                    />
                ) : (
                    <span className={styles.moduleTitle}>{moduleData.title}</span>
                )}
                {isAdmin && (
                    <div className={styles.moduleActions}>
                        <button
                            onClick={() => onMoveModule(moduleData.order, -1)}
                            disabled={moduleData.order === 0}
                            className={styles.moveButton}
                        >
                            <FaArrowUp />
                        </button>
                        <button
                            onClick={() => onMoveModule(moduleData.order, 1)}
                            disabled={moduleData.order === moduleData.totalModules - 1}
                            className={styles.moveButton}
                        >
                            <FaArrowDown />
                        </button>
                        <button
                            onClick={() => onAddClass(moduleData.id)}
                            className={styles.addClassButton}
                        >
                            <FaPlus />
                        </button>
                        <button
                            onClick={() => onDeleteModule(moduleData.id)}
                            className={styles.deleteButton}
                        >
                            <FaTrash />
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.classes}>
                {moduleData.classes?.length > 0 ? (
                    moduleData.classes.map((cls, classIndex) => (
                        <div
                            key={`${moduleData.id}-${cls.id}`}
                            className={`${styles.class} ${cls.completed ? styles.completedClass : ""}`}
                            onClick={() => onClassClick(moduleData.id, cls.id)}
                        >
                            <div className={styles.classCircle}>
                                {cls.completed && <FaCheck />}
                            </div>
                            <span className={styles.classTitle}>{cls.title}</span>

                            {isAdmin && (
                                <div className={styles.moduleActions}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onMoveClass(classIndex, -1);
                                        }}
                                        disabled={classIndex === 0}
                                        className={styles.moveButton}
                                    >
                                        <FaArrowUp />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onMoveClass(classIndex, 1);
                                        }}
                                        disabled={classIndex === moduleData.classes.length - 1}
                                        className={styles.moveButton}
                                    >
                                        <FaArrowDown />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleClassRestriction(moduleData.id, cls.id, cls.restricted);
                                        }}
                                        className={styles.classAction}
                                        title={cls.restricted ? "Desbloquear Clase" : "Bloquear Clase"}
                                    >
                                        {cls.restricted ? <FaLock /> : <FaLockOpen />}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteClass(moduleData.id, cls.id);
                                        }}
                                        className={styles.classAction}
                                        title="Eliminar Clase"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No hay clases en este módulo.</p>
                )}
            </div>
        </div>
    );
};

export default ModuleCard;
