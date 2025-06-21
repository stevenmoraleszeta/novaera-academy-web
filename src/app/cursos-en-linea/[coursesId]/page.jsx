import CourseComponent from "@/components/courseComponent/courseComponent";

const CursosEnLineaPage = ({ params }) => {
    return (
        <CourseComponent courseIdentification={params.coursesId} isLiveCourse={false} />
    );
};

export default CursosEnLineaPage;