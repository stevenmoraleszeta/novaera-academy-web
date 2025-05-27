"use client";

import { useAuth } from "@/context/AuthContext";
import styles from "./features.module.css";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
    FaTrash,
    FaPlus,
    FaArrowUp,
    FaArrowDown,
} from "react-icons/fa";
import axios from "axios";

const defaultFeatures = [
    {
        iconurl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FReloj%20Icon.png?alt=media&token=d323e959-9e9a-493c-a697-3b40799f94de",
        title: "Curso asincrónico",
        description: "Aprende cualquier día y hora.",
    },
    {
        iconurl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FIdea%20Icon.png?alt=media&token=38c0b934-1b7c-45ac-b665-26205af181a7",
        title: "Aprendizaje práctico",
        description: "Aprende con problemas reales.",
    },
    {
        iconurl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPerson%20Notify%20Icon.png?alt=media&token=c37120e9-371b-45c9-b24e-5bc891fbfde3",
        title: "Atención personalizada",
        description: "Consulta al mentor en cualquier momento.",
    },
    {
        iconurl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificado%20Icon.png?alt=media&token=608dc368-d510-4276-a551-f50cdcb4b7e6",
        title: "Certificado de finalización",
        description: "Incrementa tu conocimiento.",
    },
];

export default function Features({ course, setCourse, courseId, collectionName }) {
    const { isAdmin } = useAuth();
    const [editingIconIndex, setEditingIconIndex] = useState(null);
    const [newIconUrl, setNewIconUrl] = useState("");

    const fetchFeatures = async () => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/features`);
            setCourse((prev) => ({ ...prev, features: data }));
        } catch (error) {
            console.error("Error al cargar features:", error);
        }
    };
    const handleIconClick = (index) => {
        setEditingIconIndex(index);
        setNewIconUrl(course.features[index].iconurl);
    };

    const handleIconFeatureChange = (e) => {
        setNewIconUrl(e.target.value);
    };

    const saveIconUrl = async (index) => {
        const updatedFeatures = [...course.features];
        updatedFeatures[index].iconurl = newIconUrl;
        setCourse((prev) => ({ ...prev, features: updatedFeatures }));
        setEditingIconIndex(null);

        const feature = updatedFeatures[index];
        if (!feature.featureid) return;

        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/features/${feature.featureid}`,
                {
                    title: feature.title,
                    description: feature.description,
                    iconurl: feature.iconurl,
                }
            );
        } catch (error) {
            console.error("Error al actualizar icono:", error);
        }
    };

    const handleAddFeature = async () => {
        const newFeature = {
            title: "Nuevo título",
            description: "Nueva descripción",
            iconurl: defaultFeatures[3].iconurl,
        };

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/features`,
                newFeature
            );
            fetchFeatures();
        } catch (error) {
            console.error("Error al agregar feature:", error);
        }
    };

    const handleDeleteFeature = async (index) => {
        const feature = course.features[index];
        if (!feature.featureid) {
            const updatedFeatures = [...course.features];
            updatedFeatures.splice(index, 1);
            setCourse((prev) => ({ ...prev, features: updatedFeatures }));
            return;
        }
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/features/${feature.featureid}`
            );
            fetchFeatures();
        } catch (error) {
            console.error("Error al eliminar feature:", error);
        }
    };

    const moveFeature = (index, direction) => {
        const newFeatures = [...course.features];
        const [movedFeature] = newFeatures.splice(index, 1);
        newFeatures.splice(index + direction, 0, movedFeature);
        setCourse((prev) => ({ ...prev, features: newFeatures }));
    };

    const handleFieldChange = async (index, field, value) => {
        const updatedFeatures = [...course.features];
        updatedFeatures[index][field] = value;
        setCourse((prev) => ({ ...prev, features: updatedFeatures }));

        const feature = updatedFeatures[index];
        if (!feature.featureid) return;

        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/features/${feature.featureid}`,
                {
                    title: feature.title,
                    description: feature.description,
                    iconurl: feature.iconurl,
                }
            );
        } catch (error) {
            console.error("Error al actualizar feature:", error);
        }
    };

    return (
        <div className={styles.features}>
            {isAdmin && (
                <div className={styles.actionBtnsContainer}>
                    <button onClick={handleAddFeature} className={styles.featuresActionsBtn} type="button">
                        <FaPlus />
                    </button>
                </div>
            )}

            {(course.features || defaultFeatures).map((feature, index) => (
                <div key={feature.featureid || index} className={styles.feature}>
                    <div className={styles.featureIcon} onClick={() => handleIconClick(index)}>
                        <Image
                            src={feature.iconurl}
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
                            <button onClick={() => saveIconUrl(index)} className={styles.saveButton} type="button">
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
                                        type="button"
                                    >
                                        <FaArrowUp />
                                    </button>
                                    <button
                                        onClick={() => moveFeature(index, 1)}
                                        disabled={index === course.features.length - 1}
                                        className={styles.moveButton}
                                        type="button"
                                    >
                                        <FaArrowDown />
                                    </button>
                                </div>
                                <button
                                    className={styles.featuresActionsBtn}
                                    onClick={() => handleDeleteFeature(index)}
                                    type="button"
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