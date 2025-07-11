import { Suspense } from "react";
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

const CoursePageSkeleton = () => (
    <div style={{ padding: '40px 20px' }}>
        <div style={{ height: '50px', backgroundColor: '#f0f0f0', marginBottom: '30px', borderRadius: '5px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: '400px', backgroundColor: '#f0f0f0', borderRadius: '10px' }}></div>
            ))}
        </div>
    </div>
);

const LiveCoursesPage = () => {
    return (
        <Suspense fallback={<CoursePageSkeleton />}>
            <CoursesPage
                collectionName="liveCourses"
                courseType="live"
                pageTitle="Cursos en Vivo - ZETA"
                placeholderText="Python, SQL, Excel..."
            />
        </Suspense>
    );
};

export default LiveCoursesPage;