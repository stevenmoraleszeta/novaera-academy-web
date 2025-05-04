"use client";

import React, { useState } from "react";
import { FaRegImage } from "react-icons/fa";
import styles from "./CourseDetails.module.css";
import { useRouter } from "next/navigation";

const CourseDetails = ({
    
    course,
    isAdmin,
    isEnrolled,
    handleFieldChange,
    handleContactClick,
    openModal,
    openVideoModal,
}) => {
    const router = useRouter();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    console.log("hola",course)
    const handleEnrollClick = async () => {
        try {
            const paymentUrl = `/payment?courseId=${encodeURIComponent(course.courseid || course.id)}`;
            router.push(paymentUrl);
        } catch (error) {
            setIsAlertOpen(true);
            console.error("Error verificando la inscripción del curso:", error);
        }
    };

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
                                handleFieldChange("discountedPrice", +e.target.value)
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
                <button
                    className={`${styles.enrollButton} ${isEnrolled ? styles.enrolledButton : ""}`}
                    onClick={handleEnrollClick}
                >
                    {isEnrolled ? "Inscrito" : "Inscríbete"}
                </button>
                <button className={styles.contactButton} onClick={handleContactClick}>
                    Contáctanos
                </button>
                {isAdmin && (
                    <div className={styles.iconWrapper} onClick={openModal}>
                        <FaRegImage className={styles.editIcon} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDetails;
