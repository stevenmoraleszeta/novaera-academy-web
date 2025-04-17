import React from "react";
import ResourceItem from "./resourceItem";
import styles from "./ResourceList.module.css";

const ResourceList = ({ resources, isAdmin, setResources, setIsModalOpen }) => {
    return (
        <div className={styles.resourcesContainer}>
            {resources.map((resource, index) => (
                <ResourceItem
                    key={index}
                    resource={resource}
                    index={index}
                    isAdmin={isAdmin}
                    setResources={setResources}
                    setIsModalOpen={setIsModalOpen}
                />
            ))}
        </div>
    );
};

export default ResourceList;