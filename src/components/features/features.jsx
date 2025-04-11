"use client";

import { useAuth } from "@/context/AuthContext";
import styles from "./features.module.css";
import { useState } from "react";
import Image from "next/image";
import {
    FaTrash,
    FaPlus,
    FaArrowUp,
    FaArrowDown,
} from "react-icons/fa";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

const FeaturesProps = {
    course: '',
    setCourse: '',
    courseId: '',
    collectionName: '',
}

export default function Features(featuresProps = props) {

    const { course, setCourse, courseId, collectionName } = featuresProps;
    const { currentUser, isAdmin } = useAuth();
    const [editingIconIndex, setEditingIconIndex] = useState(null);
    const [newIconUrl, setNewIconUrl] = useState("");

    const handleIconClick = (index) => {
        setEditingIconIndex(index);
        setNewIconUrl(course.features[index].iconUrl);
    };

    const handleIconFeatureChange = (e) => {
        setNewIconUrl(e.target.value);
    };

    const saveIconUrl = async (index) => {
        const updatedFeatures = [...course.features];
        updatedFeatures[index].iconUrl = newIconUrl;

        try {
            const courseRef = doc(db, collectionName, courseId);
            await updateDoc(courseRef, { features: updatedFeatures });
            setCourse((prev) => ({ ...prev, features: updatedFeatures }));
            setEditingIconIndex(null);
        } catch (error) {
            console.error("Error updating icon URL:", error);
        }
    };

    const handleAddFeature = async () => {
        const newFeature = { title: "test", description: "test", iconUrl: 'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificado%20Icon.png?alt=media&token=608dc368-d510-4276-a551-f50cdcb4b7e6' };
        try {
            const courseRef = doc(db, collectionName, courseId);
            await updateDoc(courseRef, {
                features: arrayUnion(newFeature),
            });

            setCourse((prev) => ({
                ...prev,
                features: [...(prev.features || []), newFeature],
            }));

            console.log("Característica añadida exitosamente");
        } catch (error) {
            console.error("Error al agregar la característica:", error);
        }
    };

    const handleDeleteFeature = async (index) => {
        try {
            const updatedFeatures = [...course.features];

            updatedFeatures.splice(index, 1);

            const courseRef = doc(db, collectionName, courseId);
            await updateDoc(courseRef, { features: updatedFeatures });

            setCourse((prev) => ({
                ...prev,
                features: updatedFeatures,
            }));

            console.log("Característica eliminada exitosamente");
        } catch (error) {
            console.error("Error al eliminar la característica:", error);
        }
    };

    const moveFeature = async (index, direction) => {
        setCourse((prevCourse) => {
            const newFeatures = [...prevCourse.features];
            const [movedFeature] = newFeatures.splice(index, 1);
            newFeatures.splice(index + direction, 0, movedFeature);

            // Update the order in the database
            newFeatures.forEach(async (feature, newIndex) => {
                try {
                    const courseRef = doc(db, collectionName, courseId);
                    await updateDoc(courseRef, { features: newFeatures });
                } catch (error) {
                    console.error("Error updating feature order:", error);
                }
            });

            return { ...prevCourse, features: newFeatures };
        });
    };

    const handleFieldChange = async (field, value) => {
        const updatedCourse = { ...course, [field]: value };
        setCourse(updatedCourse);
        const docRef = doc(db, collectionName, courseId);
        await updateDoc(docRef, { [field]: value });
    };

    return (
        <div className={styles.features}>
            {isAdmin && (
                <>
                    <div className={styles.actionBtnsContainer}>
                        <button onClick={handleAddFeature} className={styles.featuresActionsBtn}>
                            <FaPlus />
                        </button>
                    </div>
                    <div></div>
                </>
            )}
            {(course.features || defaultFeatures).map((feature, index) => (
                <div key={index} className={styles.feature}>
                    <div className={styles.featureIcon} onClick={() => handleIconClick(index)}>
                        <Image
                            src={feature.iconUrl}
                            alt={`Icono de ${feature.title}`}
                            fill
                            style={{ objectFit: "contain" }}
                        />
                    </div>
                    {editingIconIndex === index && isAdmin && (
                        <div className={styles.iconUrlInputContainer}>
                            <input
                                type="text"
                                value={newIconUrl}
                                onChange={handleIconFeatureChange}
                                className={styles.iconUrlInput}
                            />
                            <button onClick={() => saveIconUrl(index)} className={styles.saveButton}>
                                Guardar
                            </button>
                        </div>
                    )}
                    <div>
                        {isAdmin ? (
                            <>
                                <input
                                    type="text"
                                    value={feature.title}
                                    onChange={(e) => {
                                        const updatedFeatures = [...course.features];
                                        updatedFeatures[index].title = e.target.value;
                                        handleFieldChange("features", updatedFeatures);
                                    }}
                                    className={styles.featureTitleInput}
                                />
                                <textarea
                                    value={feature.description}
                                    onChange={(e) => {
                                        const updatedFeatures = [...course.features];
                                        updatedFeatures[index].description = e.target.value;
                                        handleFieldChange("features", updatedFeatures);
                                    }}
                                    className={styles.featureDescriptionInput}
                                />
                            </>
                        ) : (
                            <>
                                <div className={styles.featureTitleInput}>
                                    {feature.title || "Título no disponible"}
                                </div>
                                <div className={styles.featureDescriptionInput}>
                                    {feature.description || "Descripción no disponible"}
                                </div>
                            </>
                        )}
                        {isAdmin && (
                            <>
                                <div className={styles.featuresActionsContainer}>
                                    <div className={styles.featureActions}>
                                        <button
                                            onClick={() => moveFeature(index, -1)}
                                            disabled={index === 0}
                                            className={styles.moveButton}
                                        >
                                            <FaArrowUp />
                                        </button>
                                        <button
                                            onClick={() => moveFeature(index, 1)}
                                            disabled={index === course.features.length - 1}
                                            className={styles.moveButton}
                                        >
                                            <FaArrowDown />
                                        </button>
                                    </div>
                                    <div>
                                        <button
                                            className={styles.featuresActionsBtn}
                                            onClick={() => handleDeleteFeature(index)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}