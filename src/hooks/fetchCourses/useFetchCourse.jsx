import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/firebase/firebase";

const defaultFeatures = [
    {
        iconUrl:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FReloj%20Icon.png?alt=media&token=d323e959-9e9a-493c-a697-3b40799f94de",
        title: "Curso asincrónico",
        description: "Aprende cualquier día y hora.",
    },
    {
        iconUrl:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FIdea%20Icon.png?alt=media&token=38c0b934-1b7c-45ac-b665-26205af181a7",
        title: "Aprendizaje práctico",
        description: "Aprende con problemas reales.",
    },
    {
        iconUrl:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPerson%20Notify%20Icon.png?alt=media&token=c37120e9-371b-45c9-b24e-5bc891fbfde3",
        title: "Atención personalizada",
        description: "Consulta al mentor en cualquier momento.",
    },
    {
        iconUrl:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificado%20Icon.png?alt=media&token=608dc368-d510-4276-a551-f50cdcb4b7e6",
        title: "Certificado de finalización",
        description: "Incrementa tu conocimiento.",
    },
];

const useFetchCourse = (courseId, collectionName) => {
    const [course, setCourse] = useState({
        title: "Introducción a la Programación con Python",
        description:
            "Conviértete en programador con Python desde cero. No necesitarás conocimientos previos y cuenta con apoyo personalizado.",
        discountedPrice: 35,
        originalPrice: 65,
        category: "Programación",
        videoUrl: "https://www.youtube.com/embed/rc9Db0uuOPI?si=DiiGkghjvsq_QkGU",
        imageUrl:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FprogrammingDefaulImage.webp?alt=media&token=1ddc96cb-88e5-498e-8d9f-a870f32ecc45",
        courseIcon:
            "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FpythonIconPng.png?alt=media&token=6583f3bc-0ce1-42f8-adbe-75e4ede5e662",
        features: [
            {
                iconUrl:
                    "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FReloj%20Icon.png?alt=media&token=d323e959-9e9a-493c-a697-3b40799f94de",
                title: "Curso asincrónico",
                description: "Aprende cualquier día y hora.",
            },
            {
                iconUrl:
                    "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FIdea%20Icon.png?alt=media&token=38c0b934-1b7c-45ac-b665-26205af181a7",
                title: "Aprendizaje práctico",
                description: "Aprende con problemas reales.",
            },
            {
                iconUrl:
                    "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPerson%20Notify%20Icon.png?alt=media&token=c37120e9-371b-45c9-b24e-5bc891fbfde3",
                title: "Atención personalizada",
                description: "Consulta al mentor en cualquier momento.",
            },
            {
                iconUrl:
                    "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificado%20Icon.png?alt=media&token=608dc368-d510-4276-a551-f50cdcb4b7e6",
                title: "Certificado de finalización",
                description: "Incrementa tu conocimiento.",
            },
        ],
    });
    const router = useRouter();

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) {
                console.error("courseId is undefined");
                return;
            }

            try {
                const docRef = doc(db, collectionName, courseId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const fetchedData = docSnap.data();

                    if (!fetchedData.features || fetchedData.features.length === 0) {
                        fetchedData.features = defaultFeatures;
                        await updateDoc(docRef, { features: defaultFeatures }); // Update Firestore
                    }

                    setCourse((prevCourse) => ({
                        ...prevCourse,
                        ...fetchedData,
                    }));
                    document.title = `${fetchedData.title || "Curso"} - ZETA`;
                } else {
                    console.error("Course not found");
                    router.push("/cursos-en-linea");
                }
            } catch (error) {
                console.error("Error fetching course:", error);
            }
        };

        fetchCourse();
    }, [courseId, router]);

    return course;
};

export default useFetchCourse;