"use client"; // Esto indica que el componente es un Client Component

import Link from "next/link";
import Image from "next/image";
import React from "react";

// Importar estilos
import styles from "./Footer.module.css"; // Los estilos globales pueden ir en _app.js

function FooterZ() {
  return (
    <footer className={styles.footer}>
      {/* Contenedor izquierdo (30%) */}
      <div className={styles.leftContainer}>
        <Link href="/" className={styles.imgLink}>
          <Image
            alt="ZetaLogo"
            src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogo.png?alt=media&token=d8e33971-ceb0-4d9e-a617-2f026fe4467c"
            width={1000}
            height={1000}
            className={styles.zLogo}
          />
        </Link>
        <div className={styles.contactInfo}>
            <a className={styles.contactItem}
              href="https://wa.link/qggv19"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <Image
                alt="WhatsApp"
                src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Fwhatsapp.png?alt=media&token=c5a39c00-a699-446b-bab6-9ddf3c9ab7c9"
                width={20}
                height={20}
                className={styles.iconsRedes}
              />
              +50661304830
            </a>
            <a className={styles.contactItem}
              href="https://www.instagram.com/stevenmoraleszeta"
              target="_blank" // Abre el enlace en una nueva pestaña
              rel="noopener noreferrer" // Buenas prácticas de seguridad
              style={{ color: "inherit", textDecoration: "none" }} // Opcional: estilos para mantener el color y eliminar el subrayado
            >
              <Image
                alt="IG"
                src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Finstagram.png?alt=media&token=4ceb6bba-a56c-496b-92b6-5e1d936b5422"
                width={20}
                height={20}
                className={styles.iconsRedes}
              />
              stevenmoraleszeta
            </a>
            <a className={styles.contactItem}
              href="https://www.instagram.com/zeta.steam"
              target="_blank" // Abre el enlace en una nueva pestaña
              rel="noopener noreferrer" // Buenas prácticas de seguridad
              style={{ color: "inherit", textDecoration: "none" }} // Mantiene el estilo de texto sin subrayado
            >
              <Image
                alt="IG"
                src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Finstagram.png?alt=media&token=4ceb6bba-a56c-496b-92b6-5e1d936b5422"
                width={20} // Ajusta el tamaño según lo necesites
                height={20}
                className={styles.iconsRedes}
              />
              zeta.steam
            </a>
        </div>
      </div>

      {/* Contenedor derecho (70%) */}
      <div className={styles.rightContainer}>
        <div className={styles.separator}></div>
        <div className={styles.navColumn}>
          <a href="/cursos-en-linea">Aprende en línea</a>
          <a href="/cursos-en-vivo">Cursos en vivo</a>
        </div>

        <div className={styles.separator}></div>

        <div className={styles.navColumn}>
          <a href="https://wa.link/ifz1ng" target="_blank" rel="noopener noreferrer">Elaboración de proyectos</a>
          <a href="https://wa.link/q2kzi6" target="_blank" rel="noopener noreferrer">Clases particulares</a>
        </div>

        <div className={styles.separator}></div>

        <div className={styles.navColumn}>
          <a href="https://wa.link/ackd1n" target="_blank" rel="noopener noreferrer">Desarrollo de Software</a>
          <a href="https://wa.link/ek3xtk" target="_blank" rel="noopener noreferrer">Unirse a ZETA</a>
        </div>
      </div>
    </footer>
  );
}

export default FooterZ;
