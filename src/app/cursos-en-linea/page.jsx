import CoursesPage from "@/components/coursePageComponent/coursePage";

const OnlineCourses = () => {
    return (
        <CoursesPage
            collectionName="onlineCourses"
            pageTitle="Cursos en Linea - ZETA"
            placeholderText="Python, SQL, Excel..."
        />
    );
};

export default OnlineCourses;