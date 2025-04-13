import React, { useState } from 'react';
import { FaArrowUp, FaArrowDown, FaPlus, FaTrash, FaCheck, FaLock, FaLockOpen } from 'react-icons/fa';
import styles from './moduleCard.module.css';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

const ModuleCard = ({
    moduleData,
    collectionName,
    isAdmin,
    courseId,
    totalModules,
    onModulesUpdate,
}) => {

    const [modules, setModules] = useState([]);


    const onTitleChange = (moduleId, newTitle) => {
        setModules((prevModules) =>
            prevModules.map((classModule) =>
                classModule.id === moduleId ? { ...classModule, title: newTitle } : classModule
            )
        );
        debouncedUpdateModuleTitle(moduleId, newTitle);
    };

    const onDeleteModule = async (moduleId) => {
        if (confirm("¿Estás seguro de que deseas eliminar este módulo?")) {
            await deleteDoc(doc(db, collectionName, courseId, "modules", moduleId));
            setModules(modules.filter((classModule) => classModule.id !== moduleId));
        }
    };

    const onMoveModule = async (index, direction) => {
        const newModules = [...totalModules];
        const [movedModule] = newModules.splice(index, 1);
        newModules.splice(index + direction, 0, movedModule);

        // Update the order in the database
        try {
            await Promise.all(
                newModules.map((classModule, newIndex) => {
                    const moduleRef = doc(db, collectionName, courseId, "modules", classModule.id);
                    return updateDoc(moduleRef, { order: newIndex });
                })
            );
            onModulesUpdate(newModules); // Update modules in the parent component
        } catch (error) {
            console.error("Error updating module order:", error);
        }
    };

    const onAddClass = async (moduleId) => {
        const classModule = modules.find((mod) => mod.id === moduleId);
        const nextOrder = classModule ? classModule.classes.length : 0; // Get the next order based on existing classes

        const newClass = { title: "Nueva Clase", order: nextOrder }; // Set the default order attribute
        const classRef = await addDoc(
            collection(db, collectionName, courseId, "modules", moduleId, "classes"),
            newClass
        );

        setModules((prevModules) =>
            prevModules.map((classModule) => {
                if (classModule.id === moduleId) {
                    return {
                        ...classModule,
                        classes: [...classModule.classes, { id: classRef.id, ...newClass }],
                    };
                }
                return classModule;
            })
        );
    };

    const onDeleteClass = async (moduleId, classId) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta clase?")) {
            await deleteDoc(
                doc(
                    db,
                    collectionName,
                    courseId,
                    "modules",
                    moduleId,
                    "classes",
                    classId
                )
            );
            setModules(
                modules.map((classModule) => {
                    if (classModule.id === moduleId) {
                        return {
                            ...classModule,
                            classes: classModule.classes.filter((c) => c.id !== classId),
                        };
                    }
                    return classModule;
                })
            );
        }
    };

    const onMoveClass = async (classIndex, direction) => {
        const newClasses = [...moduleData.classes];
        const [movedClass] = newClasses.splice(classIndex, 1);
        newClasses.splice(classIndex + direction, 0, movedClass);

        // Actualizar el orden en la base de datos
        try {
            await Promise.all(
                newClasses.map((cls, newIndex) => {
                    const classRef = doc(
                        db,
                        collectionName,
                        courseId,
                        "modules",
                        moduleData.id,
                        "classes",
                        cls.id
                    );
                    return updateDoc(classRef, { order: newIndex });
                })
            );

            // Llamar a onModulesUpdate para actualizar el estado global
            onModulesUpdate((prevModules) =>
                prevModules.map((mod) =>
                    mod.id === moduleData.id ? { ...mod, classes: newClasses } : mod
                )
            );
        } catch (error) {
            console.error("Error updating class order:", error);
        }
    };

    const onToggleClassRestriction = async (moduleId, classId, currentStatus) => {
        try {
            const classRef = doc(
                db,
                collectionName,
                courseId,
                "modules",
                moduleId,
                "classes",
                classId
            );
            await updateDoc(classRef, { restricted: !currentStatus });

            // Update local state
            setModules((prevModules) =>
                prevModules.map((classModule) => {
                    if (classModule.id === moduleId) {
                        return {
                            ...classModule,
                            classes: classModule.classes.map((cls) =>
                                cls.id === classId
                                    ? { ...cls, restricted: !currentStatus }
                                    : cls
                            ),
                        };
                    }
                    return classModule;
                })
            );
        } catch (error) {
            console.error("Error updating restriction status:", error);
        }
    };

    const onClassClick = (moduleId, classId) => {
        router.push(`/cursos-en-linea/${courseId}/${moduleId}/${classId}`);
    };


    return (
        <div className={styles.module}>
            {/* Header del módulo */}
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
                            title="Añadir Clase"
                            className={styles.addClassButton}
                        >
                            <FaPlus />
                        </button>
                        <button
                            onClick={() => onDeleteModule(moduleData.id)}
                            title="Eliminar Módulo"
                            className={styles.deleteButton}
                        >
                            <FaTrash />
                        </button>
                    </div>
                )}
            </div>

            {/* Clases dentro del módulo */}
            <div className={styles.classes}>
                {moduleData.classes && moduleData.classes.length > 0 ? (
                    moduleData.classes.map((cls, classIndex) => (
                        <div
                            key={`${moduleData.id}-${cls.id}`}
                            className={`${styles.class} ${cls.completed ? styles.completedClass : ''} ${cls.highlight ? styles.highlightClass : ''
                                }`}
                            onClick={() => onClassClick(moduleData.id, cls.id)}
                        >
                            <div className={styles.classCircle}>
                                {cls.completed && <FaCheck />}
                            </div>
                            <span className={styles.classTitle}>{cls.title}</span>
                            {isAdmin && (
                                <div className={styles.moduleActions}>
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onMoveClass(classIndex, -1);
                                        }}
                                        disabled={classIndex === 0}
                                        className={styles.moveButton}
                                    >
                                        <FaArrowUp />
                                    </button>
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onMoveClass(classIndex, 1);
                                        }}
                                        disabled={classIndex === moduleData.classes.length - 1}
                                        className={styles.moveButton}
                                    >
                                        <FaArrowDown />
                                    </button>
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onToggleClassRestriction(moduleData.id, cls.id, cls.restricted);
                                        }}
                                        className={styles.classAction}
                                        title={cls.restricted ? 'Desbloquear Clase' : 'Bloquear Clase'}
                                    >
                                        {cls.restricted ? <FaLock /> : <FaLockOpen />}
                                    </button>
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
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


{/* <div className={styles.modules}>
    {modules.length > 0 ? (
        modules.map((classModule, moduleIndex) => (
            <ModuleCard
                key={classModule.id}
                moduleData={{
                    ...classModule,
                    order: moduleIndex,
                    totalModules: modules.length,
                }}
                isAdmin={isAdmin}
                onTitleChange={handleModuleTitleChange}
                onMoveModule={moveModule}
                onAddClass={addClass}
                onDeleteModule={deleteModule}
                onMoveClass={moveClass}
                onToggleClassRestriction={toggleClassRestriction}
                onDeleteClass={deleteItem}
                onClassClick={handleClassClick}
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
</div>; */}