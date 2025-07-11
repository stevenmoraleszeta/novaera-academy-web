import { Suspense } from "react";
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

const OnlineCoursesPage = () => {
    return (
        <Suspense fallback={<CoursePageSkeleton />}>
            <CoursesPage
                collectionName="onlineCourses"
                courseType="online"
                pageTitle="Cursos en Linea - ZETA"
                placeholderText="Python, SQL, Excel..."
            />
        </Suspense>
    );
};

export default OnlineCoursesPage;