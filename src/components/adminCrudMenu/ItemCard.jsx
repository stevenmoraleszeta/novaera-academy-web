import React from 'react';
import styles from './CrudMenu.module.css';
import { FaTrash, FaEdit } from 'react-icons/fa';

const ItemCard = ({ item, displayFields, onEdit, onDelete }) => {
    return (
        <div className={styles.itemCard}>
            <div className={styles.cardContent} onClick={onEdit}>
                {displayFields.map(({ label, field }) => (
                    <div key={field} className={styles.fieldRow}>
                        <span>{item[field]}</span>
                    </div>
                ))}
            </div>
            <div className={styles.iconButtons}>
                <button className={styles.iconButton} onClick={onDelete} title="Eliminar">
                    <FaTrash size={20} />
                </button>
                <button className={styles.iconButton} onClick={onEdit} title="Editar">
                    <FaEdit size={20} />
                </button>
            </div>
        </div>
    );
};

export default ItemCard;