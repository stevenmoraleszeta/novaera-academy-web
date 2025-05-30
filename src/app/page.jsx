"use client";

import Head from "next/head";
import CursoCard from "@/components/cursoCard/cursoCard";
import Service from "@/components/zetaServices/zetaServices";
import ContactUsBtn from "@/components/contactUsBtn/contactUsBtn";

import React from 'react';
import useTypedEffect from "@/hooks/typed/typed";


import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  document.title = "ZETA Academia";
  useTypedEffect('dynamicMsg', {
    strings: ['Potencial', 'Futuro', 'Capacidad'],
    typeSpeed: 150,
    loop: true,
    backSpeed: 100,
    startDelay: 300,
    cursorChar: '',
  });

  return (
    <>
      <Head>
        <title>ZETA Academia | Cursos de Programación, Excel y SQL en línea y en vivo</title>
        <meta name="description" content="Desbloquea tu potencial con ZETA Academia. Aprende programación, Excel, SQL y más con cursos en línea y en vivo, apoyo personalizado y tutores expertos. ¡Impulsa tu futuro hoy!" />
        <meta name="keywords" content="ZETA Academia, cursos online, cursos en vivo, programación, Python, Excel, SQL, clases particulares, educación, mentoría, Costa Rica, aprender desde casa, proyectos universitarios" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="ZETA Academia" />
        <meta property="og:title" content="ZETA Academia | Cursos de Programación, Excel y SQL en línea y en vivo" />
        <meta property="og:description" content="Desbloquea tu potencial con ZETA Academia. Aprende programación, Excel, SQL y más con cursos en línea y en vivo, apoyo personalizado y tutores expertos." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zetaacademia.com/" />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZETA%201200.png?alt=media&token=3adb303b-a52f-4f7f-8266-b2bbba867083" />
        <meta property="og:locale" content="es_CR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ZETA Academia | Cursos de Programación, Excel y SQL en línea y en vivo" />
        <meta name="twitter:description" content="Desbloquea tu potencial con ZETA Academia. Aprende programación, Excel, SQL y más con cursos en línea y en vivo, apoyo personalizado y tutores expertos." />
        <meta name="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZETA%201200.png?alt=media&token=3adb303b-a52f-4f7f-8266-b2bbba867083" />
        <link rel="canonical" href="https://zetaacademia.com/" />
      </Head>
      <div className={styles.page}>
        <main className={styles.main}>
          {/* Main content */}
          <section className={styles.mainSection}>
            <div className={styles.contentContainer}>
              <div className={styles.infoContainer}>
                <h1 className={styles.mainTitle}>Desbloquea tu</h1>
                <div className={styles.dynamicMsgContainer}>
                  <span id="dynamicMsg" className={styles.dynamicMessage}></span>
                </div>
                <h4 className={styles.mainSubtitle}>Aprende con los mejores</h4>
                <Link href={'/cursos-en-linea'} className={styles.coursesBtn}>Ver cursos en línea</Link>
              </div>
              <div className={styles.componentContainer}>
                <CursoCard icon="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FpythonIconPng.png?alt=media&token=6583f3bc-0ce1-42f8-adbe-75e4ede5e662" imgSrc='https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FDALLE03.webp?alt=media&token=858d23a3-df7a-4b29-ba21-38bb56b27011' descText="Conviértete en programador con Python desde cero. Avanza a tu ritmo y cuenta con el apoyo de tutores especializados." titleText="Introducción a la Programación con Python" width={500}
                  height={500} link="/cursos-en-linea/YCYVzrKgRMI2XjFW05SP" />
              </div>
            </div>
          </section >
          {/* benefits elements */}
          <section className={styles.benefitsSection}>
            <div className={styles.benefitsContentContainer}>
              <div className={styles.iconsContainer}>
                <Image className={styles.excelIcon} alt="icon" src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FexcelIcon.png?alt=media&token=ae94876e-b189-4728-9ff0-56fd51014dbe" width={400} height={400}></Image>
                <Image className={styles.sqlIcon} alt="icon" src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FsqlPngIcon.png?alt=media&token=03f5dc8e-8bfb-4ee1-b18f-3e0764604815" width={400} height={400}></Image>
                <Image className={styles.pythonIcon} alt="icon" src="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FpythonIconPng.png?alt=media&token=6583f3bc-0ce1-42f8-adbe-75e4ede5e662" width={400} height={400}></Image>
              </div>
              <div className={styles.benefitsTextContainer}>
                <h1 className={styles.benefitsTitle}>Conéctate y aprende en vivo desde casa</h1>
                <h2 className={styles.benefitsSubtitle}>Apoyo personalizado las 24 horas del día</h2>
                <Link href={'/cursos-en-vivo'} className={styles.coursesBtn}>Ver cursos en vivo</Link>
              </div>
            </div>
          </section >
          {/* services elements */}
          <section className={styles.servicesSection}>
            <div className={styles.servicesTitleContainer}>
              <h1 className={styles.servicesTitle}>Nosotros te ayudamos</h1>
            </div>
            <div className={styles.servicesMainContainer}>
              <Service imageURL="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FDALLE01.webp?alt=media&token=12fe3e5e-cd7b-4307-bbdf-3cb374b02186" displayText="Realizamos tus proyectos de universidad" nonDisplayedText="Envíanos las instrucciones de tu proyecto universitario o de cualquier otra institución, y te cotizaremos el costo de realización">
                <ContactUsBtn link="https://wa.link/ifz1ng"></ContactUsBtn>
              </Service>
              <Service imageURL="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FDALLE02.webp?alt=media&token=55bf8abe-6b4d-4e52-8344-842e730e6d6f" displayText="Te ayudamos con clases particulares" nonDisplayedText="Te ayudamos con clases particulares online de programación u ofimática, la hora y día que mejor te funcionen">
                <ContactUsBtn link="https://wa.link/q2kzi6"></ContactUsBtn>
              </Service>
              <Service imageURL="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FDALLE04.webp?alt=media&token=38e225b8-7a83-457c-96a3-382c1a85a08c" displayText="Forma parte del equipo ZETA" nonDisplayedText="Si eres programador y te interesa unirte a una startup de educación y tecnología, envíanos tu CV">
                <ContactUsBtn link="https://wa.link/ek3xtk"></ContactUsBtn>
              </Service>
            </div>
            <div className={styles.auxContactContainer}>
              <h3>Cualquier otro asunto</h3>
            </div>
            <div className={styles.auxBtnContainer}>
              <ContactUsBtn link="https://wa.link/qggv19"></ContactUsBtn>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}