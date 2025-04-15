import React, { useState } from "react";
import { FaRegImage, FaPencilAlt } from "react-icons/fa";
import styles from "./CourseDetails.module.css";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";



const CourseDetails = ({
    course,
    isAdmin,
    isEnrolled,
    handleFieldChange,
    handleContactClick,
    openModal,
    openVideoModal,
}) => {

    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const handleEnrollClick = async () => {
        try {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                const enrolledCourses = userData.enrolledCourses || [];

                if (!enrolledCourses.includes(course.id)) {
                    const paymentUrl = `/payment?courseId=${encodeURIComponent(course.id)}`;
                    router.push(paymentUrl);
                } else {
                    setIsEnrolled(true);
                }
            } else {
                const paymentUrl = `/payment?courseId=${encodeURIComponent(course.id)}`;
                router.push(paymentUrl);
            }
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

            <div
                className={`${styles.priceContainer} ${isEnrolled ? styles.enrolledPrice : ""
                    }`}
            >
                <span className={styles.discountedPrice}>
                    $
                    {isAdmin ? (
                        <input
                            type="number"
                            value={course.discountedPrice || ""}
                            onChange={(e) =>
                                handleFieldChange("discountedPrice", +e.target.value)
                            }
                            className={styles.discountedPriceInput}
                        />
                    ) : (
                        <span className={styles.discountedPriceInput}>
                            {course.discountedPrice || "No disponible"}
                        </span>
                    )}
                </span>
                <span className={styles.originalPrice}>
                    $
                    {isAdmin ? (
                        <input
                            type="number"
                            value={course.originalPrice || ""}
                            onChange={(e) =>
                                handleFieldChange("originalPrice", +e.target.value)
                            }
                            className={styles.originalPriceInput}
                        />
                    ) : (
                        <span className={styles.originalPriceInput}>
                            {course.originalPrice || "No disponible"}
                        </span>
                    )}
                </span>
            </div>

            <div className={styles.buttonContainer}>
                <button
                    className={`${styles.enrollButton} ${isEnrolled ? styles.enrolledButton : ""
                        }`}
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