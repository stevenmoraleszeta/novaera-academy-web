"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from 'react-icons/ai';
import styles from './AdminButton.module.css';

const AdminButton = ({ iconName, text, path }) => {
    const router = useRouter();

    const handleNavigation = () => {
        router.push(path);
    };

    const IconComponent = Icons[iconName];

    return (
        <button className={styles.adminButton} onClick={handleNavigation}>
            {IconComponent && <IconComponent className={styles.buttonIcon} />}
            <span>{text}</span>
        </button>
    );
};

export default AdminButton;