import CoursesPage from "@/components/coursePage/coursePage";

export const metadata = {
    title: "Cursos en Línea | ZETA Academia - Python, Excel, SQL",
    description: "Aprende programación Python, Excel y SQL con nuestros cursos en línea. Avanza a tu ritmo con apoyo de tutores expertos. Certificados incluidos.",
    keywords: "cursos online, Python, Excel, SQL, programación, cursos virtuales, educación a distancia",
    openGraph: {
        title: "Cursos en Línea | ZETA Academia",
        description: "Aprende programación Python, Excel y SQL con nuestros cursos en línea",
        url: "https://zetaacademia.com/cursos-en-linea"
    }
};

const OnlineCourses = () => {
    return (
        <CoursesPage
            collectionName="onlineCourses"
            courseType="online"
            pageTitle="Cursos en Linea - ZETA"
            placeholderText="Python, SQL, Excel..."
        />
    );
};

export default OnlineCourses;