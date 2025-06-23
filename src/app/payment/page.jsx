"use client";

import React, { useState, useEffect, useRef } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/modal/modal";
import styles from "./page.module.css";
import axios from "axios";
import useFetchCourse from "@/hooks/fetchCourses/useFetchCourse";

const PaymentPage = () => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = searchParams.get("courseId");
    const { course, setCourse } = useFetchCourse(courseId);
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
        setShowLoginModal(!currentUser);
    }, [currentUser]);

    // Verificar si el usuario ya está inscrito
    useEffect(() => {
        const checkEnrollment = async () => {
            if (!currentUser || !courseId) return;
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/student-courses/${courseId}/${currentUser.userid}`
                );
                if (data && data.length > 0) {
                    setIsAlreadyEnrolled(true);
                }
            } catch (error) {
                // Solo loguea si el error NO es 404
                if (!error.response || error.response.status !== 404) {
                    console.error("Error al verificar inscripción:", error);
                }
            }
        };
        checkEnrollment();
    }, [currentUser, courseId]);

    const handlePaymentSuccess = async (details) => {
        setPaymentStatus("success");
        try {
            const receiptNumber = `REC-${Date.now()}`;
            const paymentData = {
                fullName: customPaymentRef.current.fullName,
                description: customPaymentRef.current.description,
                amount: courseId ? course.discountedprice : customPaymentRef.current.amount,
                courseId: courseId || null,
                userId: currentUser ? currentUser.userid : null,
                courseName: course?.title,
                receiptNumber,
            };

            // Registrar pago en backend
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments`, paymentData);

            // Si es pago de curso, registrar inscripción
            if (currentUser && courseId) {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/student-courses`, {
                    userId: currentUser.userid,
                    courseId,
                    enrollmentDate: new Date().toISOString(),
                });
            }

            setPaymentReceipt(paymentData);

            if (courseId) {
                router.push(`/cursos-en-linea/${courseId}`);
            }
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
            const finalAmount = courseId ? course.discountedprice : Number(amount);
            const { data } = await axios.post("/api/create-order", { amount: finalAmount });
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
                            <div className={styles.paymentBox}>
                                <h1 className={styles.paymentTitle}>{course.title}</h1>
                                <p className={styles.paymentDetails}>{course.description}</p>
                                <p className={styles.paymentAmount}>
                                    Monto a pagar (USD): $
                                    {course.discountedprice && !isNaN(Number(course.discountedprice))
                                        ? Number(course.discountedprice).toFixed(2)
                                        : "No disponible"}
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
                        </div>
                    ) : !courseId ? (
                        <div className={styles.paymentContainer}>
                            <div className={styles.paymentBox}>
                                <h1 className={styles.paymentTitle}>Centro de Pago Personalizado</h1>
                                <p className={styles.paymentDetails}>Ingrese todos los datos para poder realizar un pago.</p>
                                <div>
                                    <label htmlFor="fullName" className={styles.paymentDetails}>
                                        Nombre Completo:
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        className={styles.paymentInput}
                                        value={customPayment.fullName}
                                        onChange={e => setCustomPayment({ ...customPayment, fullName: e.target.value })}
                                        placeholder="Tu nombre completo"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="description" className={styles.paymentDetails}>
                                        Descripción del Pago:
                                    </label>
                                    <input
                                        type="text"
                                        id="description"
                                        className={styles.paymentInput}
                                        value={customPayment.description}
                                        onChange={e => setCustomPayment({ ...customPayment, description: e.target.value })}
                                        placeholder="Escribe una descripción breve del pago..."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="amount" className={styles.paymentDetails}>
                                        Monto del Pago (USD):
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        className={styles.paymentInput}
                                        value={customPayment.amount}
                                        onChange={e => setCustomPayment({ ...customPayment, amount: e.target.value })}
                                        placeholder="Ejemplo: 25.00"
                                    />
                                </div>
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
                        </div>
                    ) : (
                        <p>Cargando detalles del curso...</p>
                    )}
                    {paymentStatus === "success" && paymentReceipt && (
                        <div className={styles.paymentReceipt}>
                            <h2>¡Pago realizado exitosamente!</h2>
                            <p>Razón de pago: {paymentReceipt.courseName || paymentReceipt.description}</p>
                            <p>Nombre del usuario: {paymentReceipt.fullName}</p>
                            <p>Número de comprobante: {paymentReceipt.receiptNumber}</p>
                            <p>¡Toma una captura de pantalla!</p>
                        </div>
                    )}
                    {paymentStatus === "error" && (
                        <div className={styles.paymentError}>
                            <h2>Hubo un error al realizar el pago</h2>
                            <button onClick={() => setPaymentStatus(null)} className={styles.retryButton}>
                                Volver a Intentarlo
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PaymentPage;