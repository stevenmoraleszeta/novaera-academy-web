import CoursesPage from "@/components/coursePage/coursePage";

const OnlineCourses = () => {
    return (
        <CoursesPage
            collectionName="liveCourses"
            pageTitle="Cursos en Vivo - ZETA"
            placeholderText="Python, SQL, Excel..."
        />
    );
};

export default OnlineCourses;