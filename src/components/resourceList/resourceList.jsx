import React, { useEffect } from "react";
import ResourceItem from "./ResourceItem";
import styles from "./ResourceList.module.css";

const ResourceList = ({ resources, setResources, isAdmin, setIsModalOpen, courseId, moduleId, classId }) => {
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await fetch(`/api/class-resources/by-course-module-class/${courseId}/${moduleId}/${classId}`);
                const data = await res.json();
                setResources(data);
            } catch (error) {
                console.error("Error fetching resources:", error);
            }
        };

        if (courseId && moduleId && classId) {
            fetchResources();
        }
    }, [courseId, moduleId, classId]);

    return (
        <div className={styles.resourcesContainer}>
            {resources.map((resource, index) => (
                <ResourceItem
                    key={resource.id || resource.resourceId || index}
                    resource={resource}
                    index={index}
                    isAdmin={isAdmin}
                    setResources={setResources}
                    setIsModalOpen={setIsModalOpen}
                    resources={resources}
                />
            ))}

            {isAdmin ? (
                <button onClick={setIsModalOpen} className={styles.addButton}>
                    Add Resource
                </button>
            ) : null}
        </div>
    );
};

export default ResourceList;