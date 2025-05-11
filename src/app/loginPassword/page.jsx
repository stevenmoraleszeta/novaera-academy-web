"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Head from "next/head";
import styles from "./page.module.css";
import { Modal } from "@/components/modal/modal";
import { useAuthenticate } from "@/hooks/useAuth/useAuth";


function UserAndPassword() {
    const { login } = useAuthenticate()
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsAlertOpen(false);

        try {
            await login(email, password);
            router.push("/");
        } catch (err) {
            const errorMessage = checkError(err.code, err.message);
            setError(errorMessage);
            setIsAlertOpen(true);
        }
    };

    const checkError = (errorType, defaultMessage) => {
        switch (errorType) {
            case "auth/invalid-credential":
                return "Las credenciales proporcionadas no son válidas. Por favor, verifica tu correo electrónico y contraseña.";
            case "auth/user-not-found":
                return "No se encontró una cuenta con este correo electrónico.";
            case "auth/wrong-password":
                return "La contraseña es incorrecta. Por favor, intenta de nuevo.";
            default:
                return defaultMessage || "Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.";
        }
    };

    return (
        <>
            <Head>
                <title>Iniciar Sesión - ZETA</title>
                <meta
                    name="description"
                    content="Inicia sesión con tu correo electrónico y contraseña para acceder a más funcionalidades y recursos educativos."
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
                                priority
                            />
                        </div>
                        <div className={styles.textContainer}>
                            <p className={styles.loginText}>
                                Inicia sesión o crea tu cuenta para acceder a más funcionalidades.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.formContainer}>
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                required
                            />
                            <p className={styles.forgetPassword}>
                                <a href="https://wa.link/9vy9v9" className={styles.link}>
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </p>
                            <button type="submit" className={styles.submitBtn}>
                                Iniciar Sesión
                            </button>
                            <p className={styles.smallText}>
                                ¿No tienes una cuenta?{" "}
                                <a href="/createUser" className={styles.link}>
                                    Regístrate aquí
                                </a>
                            </p>
                            <a href="/login" className={styles.link}>
                                Volver
                            </a>
                        </form>
                        {error && <p className={styles.errorText}>{error}</p>}
                    </div>
                </div>
                {isAlertOpen && (
                    <Modal modalType="alert" onClose={onClose} title="Error" description="Algo salió mal!"></Modal>
                )}
            </section>
        </>
    );
}

export default UserAndPassword;