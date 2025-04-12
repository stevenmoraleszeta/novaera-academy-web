import React from 'react';
import { FaArrowUp, FaArrowDown, FaPlus, FaTrash, FaCheck, FaLock, FaLockOpen } from 'react-icons/fa';
import styles from './moduleCard.module.css';

const ModuleCard = ({
    moduleData,
    collection,
    isAdmin
}) => {


    const onTitleChange = (moduleId, newTitle) => {
        setModules((prevModules) =>
            prevModules.map((classModule) =>
                classModule.id === moduleId ? { ...classModule, title: newTitle } : classModule
            )
        );
        debouncedUpdateModuleTitle(moduleId, newTitle);
    };

    const onMoveModule = async (index, direction) => {
        setModules((prevModules) => {
            const newModules = [...prevModules];
            const [movedModule] = newModules.splice(index, 1);
            newModules.splice(index + direction, 0, movedModule);

            // Update the order in the database
            newModules.forEach(async (classModule, newIndex) => {
                try {
                    const moduleRef = doc(
                        db,
                        "onlineCourses",
                        courseId,
                        "modules",
                        classModule.id
                    );
                    await updateDoc(moduleRef, { order: newIndex });
                } catch (error) {
                    console.error("Error updating module order:", error);
                }
            });

            return newModules;
        });
    };

    const onDeleteModule = async (moduleId) => {
        if (confirm("¿Estás seguro de que deseas eliminar este módulo?")) {
            await deleteDoc(doc(db, "onlineCourses", courseId, "modules", moduleId));
            setModules(modules.filter((classModule) => classModule.id !== moduleId));
        }
    };

    const onAddClass = async (moduleId) => {
        const classModule = modules.find((mod) => mod.id === moduleId);
        const nextOrder = classModule ? classModule.classes.length : 0; // Get the next order based on existing classes

        const newClass = { title: "Nueva Clase", order: nextOrder }; // Set the default order attribute
        const classRef = await addDoc(
            collection(db, "onlineCourses", courseId, "modules", moduleId, "classes"),
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

    const onMoveClass = async (moduleId, classIndex, direction) => {
        setModules((prevModules) =>
            prevModules.map((classModule) => {
                if (classModule.id === moduleId) {
                    const newClasses = [...classModule.classes];
                    const [movedClass] = newClasses.splice(classIndex, 1);
                    newClasses.splice(classIndex + direction, 0, movedClass);

                    // Update the order in the database
                    newClasses.forEach(async (cls, newIndex) => {
                        try {
                            const classRef = doc(
                                db,
                                "onlineCourses",
                                courseId,
                                "modules",
                                moduleId,
                                "classes",
                                cls.id
                            );
                            await updateDoc(classRef, { order: newIndex });
                        } catch (error) {
                            console.error("Error updating class order:", error);
                        }
                    });

                    return { ...classModule, classes: newClasses };
                }
                return classModule;
            })
        );
    };

    const onToggleClassRestriction = async (moduleId, classId, currentStatus) => {
        try {
            const classRef = doc(
                db,
                "onlineCourses",
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
                                            onMoveClass(moduleData.id, classIndex, -1);
                                        }}
                                        disabled={classIndex === 0}
                                        className={styles.moveButton}
                                    >
                                        <FaArrowUp />
                                    </button>
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onMoveClass(moduleData.id, classIndex, 1);
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