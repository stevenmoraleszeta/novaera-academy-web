import CoursesPage from "@/components/coursePage/coursePage";

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