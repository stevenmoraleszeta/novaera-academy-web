// File: src/components/navbar/Navbar.jsx
"use client"; // Esto indica que el componente es un Client Component

// Importaciones de Next.js y React
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Asegúrate de que este contexto esté bien configurado en Next.js
import defaultProfileImage from "@/assets/img/defaultProfileImage.jpg";

// Importar estilos
import styles from './Navbar.module.css'; // Los estilos globales pueden ir en _app.js
import { usePathname } from 'next/navigation';

function Navbar() {
    const { currentUser, isAdmin } = useAuth();
    const [profileImage, setProfileImage] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false); // Estado del menú
    const pathName = usePathname();

    useEffect(() => {
        if (currentUser) {
            setProfileImage(currentUser.photourl || defaultProfileImage);
        } else {
            setProfileImage(null);
        }
    }, [currentUser]);

    const navItems = [
        { path: '/cursos-en-linea', label: 'APRENDE EN LÍNEA' },
        { path: '/cursos-en-vivo', label: 'CURSOS EN VIVO' },
        { path: '/servicios', label: 'SERVICIOS' },
    ];

    return (
        // CAMBIO: Usando la clase global "topnav" como string
        <nav className="topnav">
            {/* El logo va primero para un mejor orden visual */}
            <Link href={'/'} className={styles.imgLink}>
                <Image
                    alt="ZetaLogo"
                    src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogo.png?alt=media&token=d8e33971-ceb0-4d9e-a617-2f026fe4467c"
                    width={100}
                    height={100}
                    className={styles.zLogo} // Estilo específico del módulo para el tamaño del logo
                    priority // Carga la imagen del logo más rápido
                />
            </Link>

            {/* Menú hamburguesa para móviles */}
            <button
                className={styles.hamburger} // Clase de módulo porque es específica de este componente
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation"
            >
                ☰
            </button>

            {/* Lista de links de navegación */}
            {/* CAMBIO: Combinando clase global "navLinks" con la clase de estado del módulo "showMenu" */}
            <ul className={`navLinks ${menuOpen ? styles.showMenu : ''}`}>
                {navItems.map((item) => (
                    <li key={item.path}>
                        <Link
                            href={item.path}
                            // CAMBIO: Usando la clase global "navbarLink" y combinándola con la clase de módulo para el link activo
                            className={
                                pathName === item.path
                                    ? `navbarLink ${styles.navbarLinkSelected}`
                                    : "navbarLink"
                            }
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Contenedor de acciones de usuario */}
            <div className={styles.manageContainer}>
                {isAdmin && currentUser && (
                    <Link href="/admin" className= "accessLink">
                        ADMIN
                    </Link>
                )}
                {currentUser ? (
                    <Link href="/userProfile" className={styles.profileLink}>
                        <Image
                            className={styles.profileImage}
                            src={profileImage || defaultProfileImage}
                            alt="Profile"
                            width={40}
                            height={40}
                        />
                    </Link>
                ) : (
                    <Link href="/admin" className= "accessLink">
                        ACCEDER
                    </Link>
                )}
            </div>
        </nav>
    );

}

export default Navbar;