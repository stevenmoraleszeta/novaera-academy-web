"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Head from "next/head"; // Para mejorar el SEO
import styles from "./page.module.css";

function CreateUser() {
    const { registerWithEmailAndPassword } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setProfilePicture(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            setIsSubmitting(false);
            return;
        }

        try {
            await registerWithEmailAndPassword(
                formData.email,
                formData.password,
                formData.name,
                profilePicture
            );
            router.push("/");
        } catch (err) {
            setError(err.message || "Error al registrarse");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Crear Cuenta - ZETA</title>
                <meta
                    name="description"
                    content="Crea tu cuenta en ZETA para acceder a más funcionalidades y recursos educativos."
                />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <section>
                <div className={styles.loginMainContainer}>
                    <div className={styles.loginContainer}>
                        <div className={styles.imgContainer}>
                            <Image
                                width={500}
                                height={500}
                                alt="Logo de ZETA"
                                src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogoCp.PNG?alt=media&token=4ab20b3d-09e0-403c-851a-154d51af90b6"
                                className={styles.zetaLogo}
                                priority // Optimiza la carga de la imagen
                            />
                        </div>
                        <div className={styles.textContainer}>
                            <p className={styles.loginText}>
                                ¡Crea tu cuenta para acceder a más funcionalidades!
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.formContainer}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nombre completo"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={styles.input}
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Correo electrónico"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={styles.input}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={styles.input}
                                required
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirmar contraseña"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={styles.input}
                                required
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className={styles.fileInput}
                            />
                            {error && <p className={styles.errorText}>{error}</p>}
                            <div className={styles.buttonContainer}>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={styles.submitButton}
                                >
                                    {isSubmitting ? "Registrando..." : "Crear cuenta"}
                                </button>
                            </div>
                            <p className={styles.loginPrompt}>
                                ¿Tienes una cuenta?{" "}
                                <button
                                    type="button"
                                    onClick={() => router.push("/login")}
                                    className={styles.backButton}
                                >
                                    Iniciar sesión
                                </button>
                            </p>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}

export default CreateUser;