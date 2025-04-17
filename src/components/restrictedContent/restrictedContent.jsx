import React from "react";
import styles from "./RestrictedContent.module.css";

const RestrictedContent = ({ isAdmin, isEnrolled, courseId }) => {
    return (
        <div className={styles.restrictedContent}>
            {!isAdmin && !isEnrolled ? (
                <div>
                    <h2>Acceso restringido</h2>
                    <p>Debes matricularte en este curso primero.</p>
                    <button onClick={() => window.location.href = `/payment?courseId=${courseId}`}>
                        Matricularse
                    </button>
                </div>
            ) : (
                <p>Acceso denegado.</p>
            )}
        </div>
    );
};

export default RestrictedContent;