import CourseComponent from "@/components/courseComponent/courseComponent";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const getStudentProjectsByCourse = async (courseId) => {
    const res = await fetch(`${API_URL}/student-projects`);
    if (!res.ok) return [];
    const allProjects = await res.json();
    return allProjects.filter(p => String(p.courseid) === String(courseId));
};

const getAverageScore = (projects) => {
    if (!projects.length) return 0;
    const scores = projects.map(p => Number(p.score)).filter(Boolean);
    if (!scores.length) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
};

const CursosEnVivoPage = async ({ params }) => {
    const courseId = params.coursesId;
    const studentProjects = await getStudentProjectsByCourse(courseId);
    const averageScore = getAverageScore(studentProjects);

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