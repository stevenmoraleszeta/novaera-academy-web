import ServicesClient from "./ServicesClient";

export const metadata = {
    title: "Servicios | ZETA Academia - Proyectos, Clases Particulares y Más",
    description:
        "Ofrecemos proyectos universitarios, clases particulares de programación, y oportunidades de trabajo en tecnología. Contacta con nuestros expertos.",
    keywords:
        "proyectos universitarios, clases particulares programación, desarrollo software, consultoría tecnológica",
    openGraph: {
        title: "Servicios | ZETA Academia",
        description:
            "Proyectos universitarios, clases particulares de programación y más servicios especializados",
        url: "https://zetaacademia.com/servicios",
    },
};

export default function Servicios() {
    return <ServicesClient />;
}