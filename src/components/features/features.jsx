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

const defaultFeatures = [
    {
        iconUrl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FReloj%20Icon.png?alt=media&token=d323e959-9e9a-493c-a697-3b40799f94de",
        title: "Curso asincrónico",
        description: "Aprende cualquier día y hora.",
    },
    {
        iconUrl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FIdea%20Icon.png?alt=media&token=38c0b934-1b7c-45ac-b665-26205af181a7",
        title: "Aprendizaje práctico",
        description: "Aprende con problemas reales.",
    },
    {
        iconUrl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPerson%20Notify%20Icon.png?alt=media&token=c37120e9-371b-45c9-b24e-5bc891fbfde3",
        title: "Atención personalizada",
        description: "Consulta al mentor en cualquier momento.",
    },
    {
        iconUrl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificado%20Icon.png?alt=media&token=608dc368-d510-4276-a551-f50cdcb4b7e6",
        title: "Certificado de finalización",
        description: "Incrementa tu conocimiento.",
    },
];

export default function Features({ course, setCourse, courseId, collectionName }) {
    const { isAdmin } = useAuth();
    const [editingIconIndex, setEditingIconIndex] = useState(null);
    const [newIconUrl, setNewIconUrl] = useState("");

    const handleIconClick = (index) => {
        setEditingIconIndex(index);
        setNewIconUrl(course.features[index].iconUrl);
    };

    const handleIconFeatureChange = (e) => {
        setNewIconUrl(e.target.value);
    };

    const saveIconUrl = (index) => {
        const updatedFeatures = [...course.features];
        updatedFeatures[index].iconUrl = newIconUrl;

        setCourse((prev) => ({ ...prev, features: updatedFeatures }));
        setEditingIconIndex(null);

        // Aquí podrías hacer una petición a tu API (POST/PUT)
    };

    const handleAddFeature = () => {
        const newFeature = {
            title: "Nuevo título",
            description: "Nueva descripción",
            iconUrl: defaultFeatures[3].iconUrl,
        };

        const updatedFeatures = [...(course.features || []), newFeature];
        setCourse((prev) => ({ ...prev, features: updatedFeatures }));

        // POST a tu API si es necesario
    };

    const handleDeleteFeature = (index) => {
        const updatedFeatures = [...course.features];
        updatedFeatures.splice(index, 1);

        setCourse((prev) => ({ ...prev, features: updatedFeatures }));

        // DELETE a tu API si es necesario
    };

    const moveFeature = (index, direction) => {
        const newFeatures = [...course.features];
        const [movedFeature] = newFeatures.splice(index, 1);
        newFeatures.splice(index + direction, 0, movedFeature);

        setCourse((prev) => ({ ...prev, features: newFeatures }));

        // PUT a tu API si es necesario
    };

    const handleFieldChange = (index, field, value) => {
        const updatedFeatures = [...course.features];
        updatedFeatures[index][field] = value;
        setCourse((prev) => ({ ...prev, features: updatedFeatures }));

        // PUT a tu API si es necesario
    };

    return (
        <div className={styles.features}>
            {isAdmin && (
                <div className={styles.actionBtnsContainer}>
                    <button onClick={handleAddFeature} className={styles.featuresActionsBtn}>
                        <FaPlus />
                    </button>
                </div>
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
                                    onChange={(e) =>
                                        handleFieldChange(index, "title", e.target.value)
                                    }
                                    className={styles.featureTitleInput}
                                />
                                <textarea
                                    value={feature.description}
                                    onChange={(e) =>
                                        handleFieldChange(index, "description", e.target.value)
                                    }
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
                                <button
                                    className={styles.featuresActionsBtn}
                                    onClick={() => handleDeleteFeature(index)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
