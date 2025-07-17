import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ size = 'medium', message = 'Cargando...' }) => {
    const sizeClass = styles[size] || styles.medium;

    return (
        <div className={styles.spinnerContainer}>
            <div className={`${styles.spinner} ${sizeClass}`}></div>
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
