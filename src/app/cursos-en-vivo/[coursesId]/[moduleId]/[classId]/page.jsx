"use client";

import ClassDetail from "@/components/classDetail/ClassDetail";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Page = () => {
    const { currentUser, isAdmin } = useAuth();
    const { coursesId, moduleId, classId } = useParams();
    const router = useRouter();

    return (
        <ClassDetail
            courseId={coursesId}
            moduleId={moduleId}
            classId={classId}
            currentUser={currentUser}
            isAdmin={isAdmin}
            onBackToSyllabus={() => router.push(`/cursos-en-vivo/${coursesId}`)}
        />
    );
};

export default Page;