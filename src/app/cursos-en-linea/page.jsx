import dynamic from "next/dynamic";
import { PERFORMANCE_CONFIG } from "@/utils/performanceConfig";
import styles from "./skeleton.module.css";

// Dynamic import del componente principal para reducir bundle inicial
const CoursesPage = dynamic(() => import("@/components/coursePage/coursePage"), {
    loading: () => <CoursePageSkeleton />,
    ssr: true // Server-side rendering habilitado para SEO
});

export const metadata = {
    title: "Cursos en Línea | ZETA Academia - Python, Excel, SQL",
    description: "Aprende programación Python, Excel y SQL con nuestros cursos en línea. Avanza a tu ritmo con apoyo de tutores expertos. Certificados incluidos.",
    keywords: "cursos online, Python, Excel, SQL, programación, cursos virtuales, educación a distancia",
    openGraph: {
        title: "Cursos en Línea | ZETA Academia",
        description: "Aprende programación Python, Excel y SQL con nuestros cursos en línea",
        url: "https://zetaacademia.com/cursos-en-linea",
        images: [
            {
                url: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZETA%201200.png?alt=media&token=3adb303b-a52f-4f7f-8266-b2bbba867083",
                width: 1200,
                height: 630,
                alt: "Cursos en Línea ZETA Academia"
            }
        ]
    }
};

// Componente de loading optimizado con mejor performance
const CoursePageSkeleton = () => (
    <div className={styles.courseSkeleton}>
        <div className={styles.skeletonSearch} />
        <div className={styles.skeletonGrid}>
            {Array.from({ length: 6 }, (_, i) => (
                <div
                    key={i}
                    className={styles.skeletonCard}
                    style={{ animationDelay: `${i * 0.1}s` }}
                />
            ))}
        </div>
    </div>
);

const OnlineCoursesPage = () => {
    return (
        <CoursesPage
            collectionName="onlineCourses"
            courseType="online"
            pageTitle="Cursos en Linea - ZETA"
            placeholderText="Python, SQL, Excel..."
        />
    );
};

export default OnlineCoursesPage;