"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext"; // Ajusta la ruta si es necesario
import { useRouter } from "next/navigation";
import Image from "next/image";
import Head from "next/head";
import { useModal } from "@/context/ModalContext"; 


function ForgotPasswordPage() {
    const { sendPasswordResetRequest } = useAuth(); // Usamos la función del contexto
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { showAlert } = useModal();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await sendPasswordResetRequest(email);
            showAlert("Hemos enviado un enlace a tu correo para restablecer tu contraseña.", "Revisa tu Correo");
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (error) {
            showAlert("Ocurrió un error. Por favor, inténtalo de nuevo más tarde.","Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Recuperar Contraseña - ZETA</title>
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
                                Ingresa tu correo y te enviaremos un enlace para recuperar tu cuenta.
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
                            <button type="submit" className="auth-submit-button" disabled={loading}>
                                {loading ? "Enviando..." : "Enviar Correo"}
                            </button>
                            <a onClick={() => router.back()} className="auth-link" style={{ cursor: 'pointer', marginTop: '1rem', marginLeft:'1.5rem' }}>
                                Volver
                            </a>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}

export default ForgotPasswordPage;