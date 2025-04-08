import React from 'react';
import { FaArrowUp, FaArrowDown, FaPlus, FaTrash, FaCheck, FaLock, FaLockOpen } from 'react-icons/fa';
import styles from './moduleCard.module.css';

const ModuleCard = ({
    moduleData,
    isAdmin,
    onTitleChange,
    onMoveModule,
    onAddClass,
    onDeleteModule,
    onMoveClass,
    onToggleClassRestriction,
    onDeleteClass,
    onClassClick,
}) => {
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