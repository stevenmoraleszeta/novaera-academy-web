import { Suspense } from "react";
import dynamic from "next/dynamic";
import { PERFORMANCE_CONFIG } from "@/utils/performanceConfig";
import styles from "./skeleton.module.css";

// Dynamic import del componente principal para reducir bundle inicial
const CoursesPage = dynamic(() => import("@/components/coursePage/coursePage"), {
    loading: () => <CoursePageSkeleton />,
    ssr: true // Server-side rendering habilitado para SEO
});

export const metadata = {
    title: "Cursos en Vivo | ZETA Academia - Clases Online en Tiempo Real",
    description: "Únete a nuestras clases en vivo de programación Python, Excel y SQL. Interacción directa con instructores y compañeros de clase.",
    keywords: "clases en vivo, cursos tiempo real, Python live, Excel online, SQL streaming, educación interactiva",
    openGraph: {
        title: "Cursos en Vivo | ZETA Academia",
        description: "Únete a nuestras clases en vivo de programación Python, Excel y SQL",
        url: "https://zetaacademia.com/cursos-en-vivo",
        images: [
            {
                url: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZETA%201200.png?alt=media&token=3adb303b-a52f-4f7f-8266-b2bbba867083",
                width: 1200,
                height: 630,
                alt: "Cursos en Vivo ZETA Academia"
            }
        ]
    }
};

// Componente de loading optimizado con mejor performance
const CoursePageSkeleton = () => (
    <div className={styles.courseSkeleton}>
        {/* Search bar skeleton */}
        <div className={styles.skeletonSearch} />

        {/* Grid skeleton con mejor rendimiento */}
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

const LiveCoursesPage = () => {
    return (
        <CoursesPage
            collectionName="liveCourses"
            courseType="live"
            pageTitle="Cursos en Vivo - ZETA"
            placeholderText="Python, SQL, Excel..."
        />
    );
};

export default LiveCoursesPage;