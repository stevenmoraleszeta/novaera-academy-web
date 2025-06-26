// Archivo: ItemCard.jsx (MODIFICADO)

import React from 'react';
import styles from './CrudMenu.module.css';
import { FaTrash } from 'react-icons/fa';

const ItemCard = ({ item, displayFields, onEdit, onDelete }) => {
    return (
        <div className={styles.itemCard}>
            <div className={styles.cardContent} onClick={onEdit}>
                {displayFields.map((fieldConfig) => (
                    <div key={fieldConfig.label} className={styles.fieldRow}>
                        <span>{fieldConfig.render ? fieldConfig.render(item) : item[fieldConfig.field]}</span>
                    </div>
                ))}
            </div>
            <div className={styles.iconButtons}>
                <button className={styles.iconButton} onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Eliminar">
                    <FaTrash size={20} />
                </button>
            </div>
        </div>
    );
};

export default ItemCard;