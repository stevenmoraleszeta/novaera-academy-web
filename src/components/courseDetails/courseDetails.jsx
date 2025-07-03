"use client";

import React, { useState } from "react";
import { FaRegImage, FaUser } from "react-icons/fa";
import styles from "./CourseDetails.module.css";
import { useRouter } from "next/navigation";


const CourseDetails = ({
    course,
    isAdmin,
    isEnrolled,
    handleFieldChange,
    handleContactClick,
    openGroupModal,
    isLiveCourse,
    openImageModal
}) => {
    const router = useRouter();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    // const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    // const [selectedImageFile, setSelectedImageFile] = useState(null);
    

    const handleEnrollClick = async () => {
        if (isLiveCourse) {
            const phoneNumber = "+50661304830";
            const message = `Hola, estoy interesado/a en inscribirme al curso en vivo ${course.title}.`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank");
        } else {
            try {
                const paymentUrl = `/payment?courseId=${encodeURIComponent(course.courseid || course.id)}`;
                router.push(paymentUrl);
            } catch (error) {
                setIsAlertOpen(true);
                console.error("Error verificando la inscripción del curso:", error);
            }
        }
    };

    if (!course) {
        return <div className={styles.loading}>Cargando...</div>;
    }

    return (
        <div className={styles.courseInfo}>
            {isAdmin ? (
                <textarea
                    value={course.description || ""}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    className={styles.descriptionInput}
                />
            ) : (
                <p className={styles.descriptionText}>
                    {course.description || "Descripción no disponible"}
                </p>
            )}

            <div className={`${styles.priceContainer} ${isEnrolled ? styles.enrolledPrice : ""}`}>
                <span className={styles.discountedPrice}>
                    $
                    {isAdmin ? (
                        <input
                            type="number"
                            value={course.discountedprice || ""}
                            onChange={(e) =>
                                handleFieldChange("discountedprice", +e.target.value)
                            }
                            className={styles.discountedPriceInput}
                        />
                    ) : (
                        <span className={styles.discountedPriceInput}>
                            {course.discountedprice || "No disponible"}
                        </span>
                    )}
                </span>
                <span className={styles.originalPrice}>
                    $
                    {isAdmin ? (
                        <input
                            type="number"
                            value={course.originalprice || ""}
                            onChange={(e) =>
                                handleFieldChange("originalprice", +e.target.value)
                            }
                            className={styles.originalPriceInput}
                        />
                    ) : (
                        <span className={styles.originalPriceInput}>
                            {course.originalprice || "No disponible"}
                        </span>
                    )}
                </span>
            </div>

            <div className={styles.buttonContainer}>
                {!isAdmin && (
                    <button
                        className={`${styles.enrollButton} ${isEnrolled ? styles.enrolledButton : ""}`}
                        onClick={handleEnrollClick}
                        disabled={isEnrolled}
                    >
                        {isEnrolled ? "Inscrito" : "Inscríbete"}
                    </button>
                )}
                <button className={styles.contactButton} onClick={handleContactClick}>
                    Contáctanos
                </button>
                {isAdmin && (
                    <div className={styles.iconWrapper} 
                    // onClick={isImageModalOpen}
                    onClick={openImageModal}
                    >
                        <FaRegImage className={styles.editIcon} />
                    </div>
                )}

                {isAdmin && isLiveCourse && (
                    <div className={styles.iconWrapper} onClick={openGroupModal} title="Asignar Mentor y Estudiantes">
                        <FaUser className={styles.editIcon} />
                    </div>
                )}
            </div>
            {/* {isImageModalOpen && (
            <Modal 
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                title="Subir nueva imagen"
                modalType="customContent"
            >
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <p>Selecciona la imagen que deseas subir.</p>
                    
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={e => setSelectedImageFile(e.target.files[0])}
                    />

                    {selectedImageFile && (
                        <p style={{ fontSize: '14px', color: '#888' }}>
                            Archivo: {selectedImageFile.name}
                        </p>
                    )}

                    <div className="formActions">
                        <button 
                            className="saveButton" 
                            onClick={handleSaveImage}
                            disabled={!selectedImageFile} 
                        >
                            Guardar Imagen
                        </button>
                        <button 
                            className="cancelButton" 
                            onClick={() => setIsImageModalOpen(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </Modal>
        )} */}
        </div>
    );
};

export default CourseDetails;