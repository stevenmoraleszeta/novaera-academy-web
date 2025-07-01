"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import styles from "./services.module.css";

const servicesData = [
    {
        id: "aprendeLinea",
        title: "Aprende en línea.",
        hoverText:
            "Aprendé en línea con cursos asincrónicos a través de nuestra plataforma, donde contarás con el apoyo de tutores para resolver tus dudas.",
        link: "/cursos-en-linea",
        linkText: "Ver cursos",
        iconSrc:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FLaptopIconOrange.png?alt=media&token=2bf19c59-3d40-43a1-b0bd-fd3260952ecd",
    },
    {
        id: "cursosVivo",
        title: "Cursos en vivo.",
        hoverText:
            "Aprende con cursos en vivo y mentoría personalizada para resolver tus dudas en tiempo real y desarrollar proyectos semanales.",
        link: "/cursos-en-vivo",
        linkText: "Ver cursos",
        iconSrc:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificadoIconOrange.png?alt=media&token=459c20e6-831d-4724-b99c-b6c3261db28e",
    },
    {
        id: "clasesParticulares",
        title: "Clases particulares.",
        hoverText:
            "Impartimos clases partículares y mentorías el día y hora que mejor te quede, de programación, ofimática o computación.",
        link: "https://wa.link/q2kzi6",
        linkText: "Contacto",
        iconSrc:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPersonNotifyIconOrange.png?alt=media&token=0af04a95-498f-430f-919b-f36e02c4e7cb",
    },
    {
        id: "desarrolloSoftware",
        title: "Desarrollo de Software.",
        hoverText:
            "Nos encargamos del desarrollo de tu sitio web, aplicación o software para tu emprendimiento o empresa. Cuéntanos tu idea y hagámosla realidad juntos.",
        link: "https://wa.link/ackd1n",
        linkText: "Contacto",
        iconSrc:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FIdeaIconOrange.png?alt=media&token=bea543ee-a7f9-45da-ac66-df5b2839e067",
    },
    {
        id: "elaboracionProyectos",
        title: "Elaboración de Proyectos.",
        hoverText:
            "Te ayudamos con la realización de proyectos, exámenes o trabajos para universidad, colegio u otras instituciones.",
        link: "https://wa.link/ifz1ng",
        linkText: "Contacto",
        iconSrc:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FListaTareasIconOrange.png?alt=media&token=318160a1-89d3-4283-b35e-631fa70f278d",
    },
    {
        id: "otro",
        title: "Entre otras...",
        hoverText: "Cualquier otra asunto, estamos para ayudarte.",
        link: "https://wa.link/qggv19",
        linkText: "Contacto",
        iconSrc:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FDefaulImageIconOrange.png?alt=media&token=8f51793e-c5a5-43f1-8b03-d0e317707840",
    },
];

const ServiceCard = ({ service, isHovered, onMouseEnter, onMouseLeave }) => (
    <div
        id={styles[service.id]}
        className={styles.serviceContainer}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
        {isHovered ? (
            <>
                <div className={styles.textContainer}>
                    <h2 className={styles.onHoveredText}>{service.hoverText}</h2>
                </div>
                <div className={styles.iconContainer}>
                    <Link className={styles.linkBtn} href={service.link} target="_blank">
                        {service.linkText}
                    </Link>
                </div>
            </>
        ) : (
            <>
                <div className={styles.textContainer}>
                    <h2 className={styles.textTitle}>{service.title}</h2>
                </div>
                <div className={styles.iconContainer}>
                    <Image
                        className={styles.iconImg}
                        src={service.iconSrc}
                        alt={`${service.title} Icon`}
                        width={1000}
                        height={1000}
                    />
                </div>
            </>
        )}
    </div>
);

export default function Servicios() {
    const [hoveredService, setHoveredService] = useState(null);

    return (
        <>
            <Head>
                <title>Servicios - ZETA</title>
            </Head>
            <section className={styles.servicesMainSection}>
                <div className={styles.elementsContainer}>
                    <div className={styles.zetaLogoContainer}>
                        <Image
                            className={styles.zetaLogoImg}
                            width={1000}
                            height={1000}
                            src={
                                "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogoCpp.PNG?alt=media&token=6b854bc7-b25f-4b5c-b2ba-b0298372b67e"
                            }
                            alt="Zeta Logo"
                        />
                    </div>
                    <div className={styles.servicesContainer}>
                        {servicesData.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                isHovered={hoveredService === service.id}
                                onMouseEnter={() => setHoveredService(service.id)}
                                onMouseLeave={() => setHoveredService(null)}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}