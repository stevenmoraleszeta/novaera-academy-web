import CourseComponent from "@/components/courseComponent/courseComponent";

// Para datos desde el fetch
const studentProjects = []; // Proyectos de estudiantes
const averageScore = null;  // El promedio por si es necesario

const CursosEnVivoPage = ({ params }) => {
    return (
        <CourseComponent
            params={params}
            isLiveCourse={true}
            studentProjects={studentProjects}
            averageScore={averageScore}
        />
    );
};

export default CursosEnVivoPage;