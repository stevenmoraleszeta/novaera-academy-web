"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Head from "next/head";
import styles from "./page.module.css";

function Login() {
    const {
        loginWithGoogle,
        currentUser,
        missingInfo,
        loading,
        isCheckingUser,
    } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isCheckingUser) {
            if (currentUser && missingInfo) {
                router.push("/completeInfoPage");
            } else if (currentUser && !missingInfo) {
                router.push("/");
            }
        }
    }, [currentUser, missingInfo, loading, isCheckingUser, router]);

    const handleUserPasswordLogin = () => {
        router.push("/loginPassword");
    };

    return (
        <>
            <Head>
                <title>Iniciar Sesión - ZETA</title>
                <meta
                    name="description"
                    content="Inicia sesión o crea tu cuenta en ZETA para acceder a más funcionalidades y recursos educativos."
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
                                Inicia sesión o crea tu cuenta con Google para acceder a más
                                funcionalidades.
                            </p>
                        </div>
                        <button className={styles.googleBtn} onClick={loginWithGoogle}>
                            <Image
                                alt="Logo de Google"
                                width={24}
                                height={24}
                                src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FgoogleLogo.jpg?alt=media&token=0acdd2e2-fbcc-4607-ba96-248c94250906"
                                className={styles.googleBtnLogo}
                            />
                            <span>Continuar con Google</span>
                        </button>
                        <button
                            className={styles.googleBtn}
                            onClick={handleUserPasswordLogin}
                        >
                            <Image
                                alt="Logo de ZETA"
                                width={24}
                                height={24}
                                src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZETA%20White%20Color.png?alt=media&token=b2fce474-4bf7-4815-a9cc-03e939ffeea1"
                                className={styles.googleBtnLogo}
                            />
                            <span className={styles.textLogin}>
                                Continuar con Usuario y Contraseña
                            </span>
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Login;