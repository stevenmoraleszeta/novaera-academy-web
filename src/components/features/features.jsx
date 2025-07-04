"use client";

import { useAuth } from "@/context/AuthContext";
import styles from "./features.module.css";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useModal } from '../../context/ModalContext';
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

export default function Features({ course, setCourse, courseId }) {
    const { isAdmin } = useAuth();
    const [editingIconIndex, setEditingIconIndex] = useState(null);
    const [newIconUrl, setNewIconUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [features, setFeatures] = useState([]);

    const { showAlert, showConfirm } = useModal();

    const fetchCourseFeatures = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/course-features/by-course/${courseId}`);
            setFeatures(data);
        } catch (error) {
            showAlert("No se pudieron cargar las características del curso.", "Error");
            setFeatures([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseFeatures();
    }, [courseId]);

    const handleIconClick = (index) => {
        setEditingIconIndex(index);
        setNewIconUrl(course.features[index].iconurl);
    };

    const handleIconFeatureChange = (e) => {
        setNewIconUrl(e.target.value);
    };

    // Guardar el nuevo icono (actualiza el feature)
    const saveIconUrl = async (index) => {
        const updatedFeatures = [...features];
        updatedFeatures[index].iconurl = newIconUrl;
        setFeatures(updatedFeatures);
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
            fetchCourseFeatures();
        } catch (error) {
            showAlert("Error al actualizar icono: ", "Error");
        }
    };

    const handleAddFeature = async () => {
        try {
            const newFeature = {
                title: "Nuevo título",
                description: "Nueva descripción",
                iconurl: defaultFeatures[3].iconurl,
            };
            const { data: createdFeature } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/features`,
                newFeature
            );
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/course-features`,
                {
                    courseId: courseId,
                    featureId: createdFeature.featureid || createdFeature.id,
                    order: (features?.length || 0) + 1
                }
            );
            await fetchCourseFeatures();
            showAlert("Característica añadida con éxito.", "Éxito");
        } catch (error) {
            showAlert(`Error al agregar: ${error.message}`, "Error");
        }
    };

    // Eliminar la relación course-feature (no el feature en sí)
    const handleDeleteFeature = (feature) => {
        showConfirm(
            `¿Estás seguro de eliminar la característica "${feature.coursefeatureid}" del curso?`,
            async () => {
                try {
                    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/course-features/${feature.coursefeatureid}`);
                    await fetchCourseFeatures();
                    showAlert("Característica eliminada del curso.", "Éxito");
                } catch (error) {
                    showAlert(`Error al eliminar: ${error.message}`, "Error");
                }
            },
            "Confirmar Eliminación"
        );
    };

    // Cambiar el orden de los features (actualiza la relación)
    const moveFeature = async (index, direction) => {
        const newFeatures = [...features];
        const [movedFeature] = newFeatures.splice(index, 1);
        newFeatures.splice(index + direction, 0, movedFeature);
       
            // Actualiza el campo order localmente
            newFeatures.forEach((feature, i) => {
                feature.order = i + 1;
            });

            setFeatures(newFeatures);

         try {
            await Promise.all(
                newFeatures.map((feature, i) => {
                    if (!feature.coursefeatureid) {
                        console.warn('No coursefeatureid para feature', feature);
                        return null;
                    }
                    return axios.put(
                        `${process.env.NEXT_PUBLIC_API_URL}/course-features/order/${feature.coursefeatureid}`,
                        { order: i + 1 }
                    );
                })
            );
        } catch (error) {
            showAlert("Error al actualizar el orden de las características:", "Error");
        }
    };

    // Editar los datos del feature (title, description, iconurl)
    const handleFieldChange = async (index, field, value) => {
        const updatedFeatures = [...features];
        updatedFeatures[index][field] = value;
        setFeatures(updatedFeatures);

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
            showAlert("Error al actualizar la característica:", "Error");
        }
    };

    if (loading) return <div>Cargando características...</div>;

    const featuresToShow = features.length > 0 ? features : defaultFeatures;

    return (
        <div className={styles.features}>
            {isAdmin && (
                <div className={styles.actionBtnsContainer}>
                    <button onClick={handleAddFeature} className={styles.featuresActionsBtn} type="button">
                        <FaPlus />
                    </button>
                </div>
            )}

            {featuresToShow
                .slice()
                .sort((a, b) => (a.order ?? a.orderFeature ?? 0) - (b.order ?? b.orderFeature ?? 0))
                .map((feature, index) => (
                    <div key={feature.coursefeatureid || feature.featureid || index} className={styles.feature}>
                        {/* Solo renderiza imagen si hay iconurl */}
                        {feature.iconurl ? (
                            <div className={styles.featureIcon} onClick={() => handleIconClick(index)}>
                                <Image
                                    src={feature.iconurl}
                                    alt={`Icono de ${feature.title}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    style={{ objectFit: "contain" }}
                                />
                            </div>
                        ) : null}

                        {editingIconIndex === index && isAdmin && feature.coursefeatureid && (
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
                                    // Quitar disabled para permitir edición visual
                                    />
                                    <textarea
                                        value={feature.description}
                                        onChange={(e) =>
                                            handleFieldChange(index, "description", e.target.value)
                                        }
                                        className={styles.featureDescriptionInput}
                                    // Quitar disabled para permitir edición visual
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

                            {/* Mostrar acciones de mover para todos los features, pero solo permitir si tienen coursefeatureid */}
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
                                            disabled={index === features.length - 1}
                                            className={styles.moveButton}
                                            type="button"
                                        >
                                            <FaArrowDown />
                                        </button>
                                    </div>
                                    {/* Eliminar solo si tiene coursefeatureid */}

                                    {feature.coursefeatureid && (
                                        <button
                                            className={styles.featuresActionsBtn}
                                            onClick={() => handleDeleteFeature(feature)}
                                            type="button"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                    {/* {feature.coursefeatureid && (
                                        <button
                                            className={styles.featuresActionsBtn}
                                            onClick={() => handleDeleteFeature(feature)}
                                            type="button"
                                        >
                                            <FaTrash />
                                        </button>
                                    )} */}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
        </div>
    );
}