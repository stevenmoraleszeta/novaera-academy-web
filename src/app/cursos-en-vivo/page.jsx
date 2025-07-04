import CoursesPage from "@/components/coursePage/coursePage";

export const metadata = {
    title: "Cursos en Vivo | ZETA Academia - Clases Online en Tiempo Real",
    description: "Únete a nuestras clases en vivo de programación Python, Excel y SQL. Interacción directa con instructores y compañeros de clase.",
    keywords: "clases en vivo, cursos tiempo real, Python live, Excel online, SQL streaming, educación interactiva",
    openGraph: {
        title: "Cursos en Vivo | ZETA Academia",
        description: "Únete a nuestras clases en vivo de programación Python, Excel y SQL",
        url: "https://zetaacademia.com/cursos-en-vivo"
    }
};

const OnlineCourses = () => {
    return (
        <CoursesPage
            collectionName="liveCourses"
            courseType="live"
            pageTitle="Cursos en Vivo - ZETA"
            placeholderText="Python, SQL, Excel..."
        />
    );
};

export default OnlineCourses;