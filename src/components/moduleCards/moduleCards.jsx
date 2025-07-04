"use client";

import React, { useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaPlus, FaTrash, FaCheck, FaLock, FaLockOpen } from 'react-icons/fa';
import styles from './moduleCard.module.css';
import axios from 'axios';
import { useRouter } from "next/navigation";
import { useCompletedClasses } from "@/hooks/useCompletedClasses/useCompletedClasses";
import { useModal } from '../../context/ModalContext';

const ModuleCard = ({
    moduleData,
    isAdmin,
    courseId,
    totalModules,
    onModulesUpdate,
    onClassClick,
    currentUser,
    highlightedClassId, 
}) => {

    const { showAlert, showConfirm } = useModal();

    const { completedClasses, fetchCompletedStatus } = useCompletedClasses({
        userId: currentUser?.userid,
    });

    useEffect(() => {
        if (currentUser?.userid) {
            fetchCompletedStatus();
        }
    }, [currentUser?.userid]);

    const router = useRouter();

    const getModuleId = (mod) => mod.moduleid || mod.id;
    const getClassId = (cls) => cls.classid || cls.id;

    const onTitleChange = async (moduleId, newTitle) => {
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/modules/${moduleId}`,
                {
                    title: newTitle,
                    orderModule: moduleData.orderModule,
                    courseId
                }
            );
            onModulesUpdate((prevModules) =>
                prevModules.map((mod) =>
                    getModuleId(mod) === moduleId ? { ...mod, title: newTitle } : mod
                )
            );
        } catch (error) {
            showAlert(`Error al actualizar el título: ${error.message}`, "Error");
        }
    };

     const onDeleteModule = async (moduleId, moduleTitle) => {
        showConfirm(
            `¿Estás seguro de que deseas eliminar el módulo "${moduleTitle}"?`,
            async () => {
                try {
                    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/modules/${moduleId}`);
                    onModulesUpdate(prev => prev.filter(mod => getModuleId(mod) !== moduleId));
                    showAlert("Módulo eliminado con éxito.", "Eliminado");
                } catch (error) {
                    showAlert(`Error al eliminar el módulo: ${error.message}`, "Error");
                }
            },
            "Confirmar Eliminación"
        );
    };

    const onMoveModule = async (index, direction) => {
        const newModules = [...totalModules];
        const [movedModule] = newModules.splice(index, 1);
        newModules.splice(index + direction, 0, movedModule);

        try {
            await Promise.all(
                newModules.map((mod, idx) =>
                    axios.put(
                        `${process.env.NEXT_PUBLIC_API_URL}/modules/${getModuleId(mod)}`,
                        {
                            title: mod.title,
                            orderModule: idx,
                            courseId
                        }
                    )
                )
            );
            onModulesUpdate(newModules.map((mod, idx) => ({
                ...mod,
                orderModule: idx
            })));
        } catch (error) {
            showAlert(`Error al mover el módulo: ${error.message}`, "Error");
        }
    };

    const onAddClass = async (moduleId) => {
        try {
            const newClass = {
                courseId,
                moduleId,
                title: "Nueva Clase",
                orderClass: moduleData.classes.length + 1,
                restricted: false
            };
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/classes`,
                newClass
            );
            const createdClass = res.data.class || res.data || newClass;
            const classId = createdClass.classid || createdClass.id || createdClass._id;
            if (!classId){
                showAlert("No se pudo obtener el ID de la nueva clase.", "Error");
                return;
            }
            onModulesUpdate((prevModules) =>
                prevModules.map((mod) =>
                    getModuleId(mod) === moduleId
                        ? {
                            ...mod,
                            classes: [...mod.classes, { ...createdClass }]
                        }
                        : mod
                )
            );
            onClassClick(moduleId, classId);
        } catch (error) {
            showAlert(`Error al añadir clase: ${error.message}`, "Error");
        }
    };

   const onDeleteClass = async (moduleId, classId, classTitle) => {
        showConfirm(
            `¿Estás seguro de que deseas eliminar la clase "${classTitle}"?`,
            async () => {
                try {
                    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`);
                    onModulesUpdate(/* ... tu lógica de filter ... */);
                    showAlert("Clase eliminada con éxito.", "Eliminada");
                } catch (error) {
                    showAlert(`Error al eliminar la clase: ${error.message}`, "Error");
                }
            },
            "Confirmar Eliminación"
        );
    };

    const onMoveClass = async (classIndex, direction) => {
        const newClasses = [...moduleData.classes];
        const [movedClass] = newClasses.splice(classIndex, 1);
        newClasses.splice(classIndex + direction, 0, movedClass);

        try {
            await Promise.all(
                newClasses.map((cls, idx) =>
                    axios.put(
                        `${process.env.NEXT_PUBLIC_API_URL}/classes/${getClassId(cls)}`,
                        {
                            ...cls,
                            orderClass: idx,
                            courseId,
                            moduleId: getModuleId(moduleData)
                        }
                    )
                )
            );
            onModulesUpdate((prevModules) =>
                prevModules.map((mod) =>
                    getModuleId(mod) === getModuleId(moduleData)
                        ? { ...mod, classes: newClasses.map((cls, idx) => ({ ...cls, orderClass: idx })) }
                        : mod
                )
            );
        } catch (error) {
            showAlert(`Error actualizando el orden de las clases: ${error.message}`, "Error");
            // console.error("Error actualizando el orden de las clases:", error);
        }
    };

    const onToggleClassRestriction = async (moduleId, classId, currentStatus) => {
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`,
                {
                    restricted: !currentStatus,
                    courseId,
                    moduleId
                }
            );
            onModulesUpdate((prevModules) =>
                prevModules.map((mod) =>
                    getModuleId(mod) === moduleId
                        ? {
                            ...mod,
                            classes: mod.classes.map((cls) =>
                                getClassId(cls) === classId ? { ...cls, restricted: !currentStatus } : cls
                            ),
                        }
                        : mod
                )
            );
        } catch (error) {
            showAlert(`Error cambiando restricción: ${error.message}`, "Error");
           // console.error("Error cambiando restricción:", error);
        }
    };

    return (
        <div className={styles.module}>
            <div className={styles.moduleHeader}>
                {isAdmin ? (
                    <input
                        type="text"
                        value={moduleData.title}
                        onChange={(e) => onTitleChange(getModuleId(moduleData), e.target.value)}
                        className={styles.moduleTitle}
                    />
                ) : (
                    <span className={styles.moduleTitle}>{moduleData.title}</span>
                )}
                {isAdmin && (
                    <div className={styles.moduleActions}>
                        <button
                            onClick={() => onMoveModule(moduleData.orderModule, -1)}
                            disabled={moduleData.orderModule === 0}
                            className={styles.moveButton}
                        >
                            <FaArrowUp />
                        </button>
                        <button
                            onClick={() => onMoveModule(moduleData.orderModule, 1)}
                            disabled={moduleData.orderModule === totalModules - 1}
                            className={styles.moveButton}
                        >
                            <FaArrowDown />
                        </button>
                        <button
                            onClick={() => onAddClass(getModuleId(moduleData))}
                            className={styles.addClassButton}
                        >
                            <FaPlus />
                        </button>
                        <button
                            onClick={() => onDeleteModule(getModuleId(moduleData), moduleData.title)}
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
                            key={`${getModuleId(moduleData)}-${getClassId(cls)}`}
                            className={
                                `${styles.class} ` +
                                (completedClasses.includes(Number(getClassId(cls))) ? styles.completedClass : "") +
                                (getClassId(cls) === highlightedClassId ? ` ${styles.highlightClass}` : "")
                            }
                            onClick={() => onClassClick(getModuleId(moduleData), getClassId(cls))}
                        >
                            <div className={styles.classCircle}>
                                {completedClasses.includes(Number(getClassId(cls))) && <FaCheck />}
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
                                            onToggleClassRestriction(getModuleId(moduleData), getClassId(cls), cls.restricted);
                                        }}
                                        className={styles.classAction}
                                        title={cls.restricted ? "Desbloquear Clase" : "Bloquear Clase"}
                                    >
                                        {cls.restricted ? <FaLock /> : <FaLockOpen />}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteClass(getModuleId(moduleData), getClassId(cls), cls.title);
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