import React from "react";
import styles from "./ResourceItem.module.css";

const ResourceItem = ({ resource, index, isAdmin, setResources, setIsModalOpen }) => {
    const handleEdit = () => {
        setIsModalOpen(true);
        // Logic to edit resource
    };

    const handleDelete = () => {
        // Logic to delete resource
    };

    return (
        <div className={styles.resourceItem}>
            {isAdmin && (
                <div className={styles.actions}>
                    <button onClick={handleEdit}>Edit</button>
                    <button onClick={handleDelete}>Delete</button>
                </div>
            )}
            {/* Render resource content based on type */}
            {resource.type === "text" && <p>{resource.content}</p>}
            {/* Add other resource types here */}
        </div>
    );
};

export default ResourceItem;