"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Head from "next/head";
import { useModal } from "@/context/ModalContext";
import Link from 'next/link';

function UserAndPassword() {
    const { loginWithEmailAndPassword } = useAuth();
    const { showAlert } = useModal();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await loginWithEmailAndPassword(email, password);
            const infoIsMissing = !user.firstname ||
                                  !user.lastname1 ||
                                  !user.country ||
                                  !user.phone ||
                                  (user.age === null || user.age === undefined);
            if (infoIsMissing) {
                router.push('/completeInfo');
            } else {
                router.push('/'); // Redirige al main solo si la info está completa
            }
        } catch (err) {
            showAlert("Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.", "Error de Autenticación");
        } finally{
            setLoading(false);
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
                <div className="auth-main-container">
                    <div className="auth-container">
                        <div className="imgContainer">
                            <Image
                                width={500}
                                height={500}
                                alt="Logo de ZETA"
                                src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogoCp.PNG?alt=media&token=4ab20b3d-09e0-403c-851a-154d51af90b6"
                                className="auth-zeta-logo"
                                priority
                            />
                        </div>
                        <div className="auth-page-text-container">
                            <p className="auth-page-text">
                                Inicia sesión o crea tu cuenta para acceder a más funcionalidades.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="auth-form-container">
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="auth-input-field"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="auth-input-field"
                                required
                            />
                            <p className="auth-forgot-password-link">
                                <Link href="/forgotPassword" className="auth-link">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </p>
                            <button type="submit" className="auth-submit-button">
                                Iniciar Sesión
                            </button>
                            <p className="auth-small-text">
                                ¿No tienes una cuenta?{" "}
                                <a href="/createUser" className="auth-link">
                                    Regístrate aquí
                                </a>
                            </p>
                            <a href="/login" className="auth-link">
                                Volver
                            </a>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}

export default UserAndPassword;