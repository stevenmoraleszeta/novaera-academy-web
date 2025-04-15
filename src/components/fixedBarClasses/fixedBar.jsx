import React from "react";
import { FaBook, FaCheck, FaWhatsapp } from "react-icons/fa";
import styles from "./FixedBar.module.css";

const FixedBar = ({
    classesInModule,
    classId,
    isCompleted,
    isPreviousClassCompleted,
    handleCompleteClass,
    handleBackToSyllabus,
    handleConsultMentor,
}) => {
    return (
        <div className={styles.fixedBar}>
            <button onClick={handleBackToSyllabus}>
                <FaBook /> Volver al temario
            </button>
            <button onClick={handleCompleteClass} disabled={!isPreviousClassCompleted}>
                <FaCheck /> {isCompleted ? "Clase completada" : "Completar clase"}
            </button>
            <button onClick={handleConsultMentor}>
                <FaWhatsapp /> Consultar mentor
            </button>
        </div>
    );
};

export default FixedBar;