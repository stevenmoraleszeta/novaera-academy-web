"use client";

import React, { useState, useEffect, useRef } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/modal/modal";
import styles from "./page.module.css";

const PaymentPage = () => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = searchParams.get("courseId");
    const [course, setCourse] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
    const [customPayment, setCustomPayment] = useState({
        fullName: "",
        description: "",
        amount: "",
    });
    const [errors, setErrors] = useState([]);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [paymentReceipt, setPaymentReceipt] = useState(null);
    const [noCourse, setNoCourse] = useState(false);
    const customPaymentRef = useRef(customPayment);

    useEffect(() => {
        customPaymentRef.current = customPayment;
    }, [customPayment]);

    useEffect(() => {
        const checkEnrollment = async () => {
            if (!currentUser || !courseId) return;

            try {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const enrolledCourses = userSnap.data().enrolledCourses || [];
                    if (enrolledCourses.includes(courseId)) {
                        setIsAlreadyEnrolled(true);
                    }
                }
            } catch (error) {
                console.error("Error verificando la inscripción:", error);
            }
        };

        checkEnrollment();
    }, [currentUser, courseId]);

    useEffect(() => {
        setShowLoginModal(!currentUser);
    }, [currentUser]);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            if (!courseId) return;

            try {
                const courseRef = doc(db, "onlineCourses", courseId);
                const courseSnap = await getDoc(courseRef);

                if (courseSnap.exists()) {
                    setCourse(courseSnap.data());
                } else {
                    setNoCourse(true);
                    router.push("/payment");
                }
            } catch (error) {
                console.error("Error al cargar detalles del curso:", error);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    const handlePaymentSuccess = async (details) => {
        setPaymentStatus("success");

        try {
            const receiptNumber = `REC-${Date.now()}`;
            const paymentData = {
                fullName: customPaymentRef.current.fullName,
                description: customPaymentRef.current.description,
                amount: courseId ? course.discountedPrice : customPaymentRef.current.amount,
                courseId: courseId || null,
                userId: currentUser ? currentUser.uid : null,
                date: new Date().toISOString(),
                courseName: course?.title,
                receiptNumber,
            };

            if (currentUser && courseId) {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const enrolledCourses = userSnap.data().enrolledCourses || [];
                    if (!enrolledCourses.includes(courseId)) {
                        await updateDoc(userRef, { enrolledCourses: arrayUnion(courseId) });
                    }
                }
            }

            setPaymentReceipt(paymentData);
            router.push(`/cursos-en-linea/${courseId}`);
        } catch (error) {
            console.error("Error al guardar la información del pago:", error);
        }
    };

    const handlePaymentError = (error) => {
        console.error("Error al procesar el pago:", error);
        setPaymentStatus("error");
    };

    const validateAndCreateOrder = async () => {
        const { fullName, description, amount } = customPaymentRef.current;
        const newErrors = [];

        if (!courseId) {
            if (!fullName) newErrors.push("El nombre completo es obligatorio.");
            if (!description) newErrors.push("La descripción es obligatoria.");
            if (!amount || isNaN(amount) || Number(amount) <= 0) {
                newErrors.push("El monto debe ser un número mayor a 0.");
            }
        }

        setErrors(newErrors);

        if (newErrors.length > 0) {
            setShowErrorModal(true);
            return null;
        }

        try {
            const finalAmount = courseId ? course.discountedPrice : Number(amount);
            const response = await fetch("/api/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: finalAmount }),
            });

            if (!response.ok) throw new Error("Error al crear la orden");

            const data = await response.json();
            return data.id;
        } catch (error) {
            console.error("Error al crear la orden:", error);
            return null;
        }
    };

    return (
        <div>
            {isAlreadyEnrolled ? (
                <Modal
                    modalType="alert"
                    isOpen={true}
                    title="Ya estás inscrito en este curso"
                    description="Puedes acceder al contenido del curso directamente."
                    onClose={() => router.push(`/cursos-en-linea`)}
                >
                    <button
                        className={styles.modalButton}
                        onClick={() => router.push(`/cursos-en-linea`)}
                    >
                        Ir al curso
                    </button>
                </Modal>
            ) : (
                <>
                    <Modal
                        modalType="alert"
                        isOpen={showLoginModal}
                        title="Iniciar sesión requerido"
                        description="Debe iniciar sesión antes de realizar cualquier pago."
                        onClose={() => (window.location.href = "/login")}
                    >
                        <button
                            className={styles.modalButton}
                            onClick={() => (window.location.href = "/login")}
                        >
                            Iniciar sesión
                        </button>
                    </Modal>

                    <Modal
                        modalType="alert"
                        isOpen={showErrorModal}
                        title="Errores de Validación"
                        onClose={() => setShowErrorModal(false)}
                    >
                        <ul className={styles.errorList}>
                            {errors.map((error, index) => (
                                <li key={index} className={styles.errorItem}>
                                    {error}
                                </li>
                            ))}
                        </ul>
                    </Modal>

                    {course ? (
                        <div className={styles.paymentContainer}>
                            <h1 className={styles.paymentTitle}>{course.title}</h1>
                            <p className={styles.paymentDetails}>{course.description}</p>
                            <p className={styles.paymentAmount}>
                                Monto a pagar (USD): ${course.discountedPrice?.toFixed(2)}
                            </p>
                            <div className={styles.paypalButton}>
                                <PayPalScriptProvider
                                    options={{
                                        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                                        currency: "USD",
                                    }}
                                >
                                    <PayPalButtons
                                        createOrder={validateAndCreateOrder}
                                        onApprove={(data, actions) =>
                                            actions.order
                                                .capture()
                                                .then(handlePaymentSuccess)
                                                .catch(handlePaymentError)
                                        }
                                        onError={handlePaymentError}
                                    />
                                </PayPalScriptProvider>
                            </div>
                        </div>
                    ) : (
                        <p>Cargando detalles del curso...</p>
                    )}
                </>
            )}
        </div>
    );
};

export default PaymentPage;