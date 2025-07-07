"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Head from "next/head";

// Componente principal que usa Suspense
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}

// Componente del formulario que puede usar useSearchParams
function ResetPasswordForm() {
    const { resetPasswordWithToken } = useAuth();
    const { showAlert } = useModal();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const resetToken = searchParams.get('token');
        if (resetToken) {
            setToken(resetToken);
        } else {
            // Si no hay token, no tiene sentido estar en esta página
            showAlert("Token de recuperación no encontrado. Por favor, solicita un nuevo enlace.", "Error");
            router.push('/forgotPassword');
        }
    }, [searchParams, router, showAlert]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showAlert("Las contraseñas no coinciden.", "Error");
            return;
        }
        if (!token) {
            showAlert("Token inválido.", "Error");
            return;
        }
        setLoading(true);

        try {
            await resetPasswordWithToken(token, password);
            showAlert("Tu contraseña ha sido actualizada exitosamente.", "Éxito");
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error) {
            showAlert("El token es inválido, ha expirado o ya fue utilizado.", "Error");
        } finally {
            setTimeout(() => {
                router.push('/login');
            }, 2000);
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Restablecer Contraseña - ZETA</title>
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
                                Ingresa tu nueva contraseña.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="auth-form-container">
                            <input
                                type="password"
                                placeholder="Nueva Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="auth-input-field"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Confirmar Nueva Contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="auth-input-field"
                                required
                            />
                            <div className="auth-button-wrapper">
                                <button type="submit" className="auth-submit-button" disabled={loading || !token}>
                                    {loading ? "Actualizando..." : "Restablecer Contraseña"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}