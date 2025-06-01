import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const defaultFeatures = [
    {
        iconurl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FReloj%20Icon.png?alt=media&token=d323e959-9e9a-493c-a697-3b40799f94de",
        title: "Curso asincrónico",
        description: "Aprende cualquier día y hora.",
    },
    {
        iconurl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FIdea%20Icon.png?alt=media&token=38c0b934-1b7c-45ac-b665-26205af181a7",
        title: "Aprendizaje práctico",
        description: "Aprende con problemas reales.",
    },
    {
        iconurl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FPerson%20Notify%20Icon.png?alt=media&token=c37120e9-371b-45c9-b24e-5bc891fbfde3",
        title: "Atención personalizada",
        description: "Consulta al mentor en cualquier momento.",
    },
    {
        iconurl: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FCertificado%20Icon.png?alt=media&token=608dc368-d510-4276-a551-f50cdcb4b7e6",
        title: "Certificado de finalización",
        description: "Incrementa tu conocimiento.",
    },
];

const useFetchCourse = (courseId) => {
    const [course, setCourse] = useState({ features: [] });
    const router = useRouter();

    useEffect(() => {
        const fetchCourse = async () => {
            console.log("courseId recibido en hook:", courseId);
            if (!courseId) return;

            try {
                const url = `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`;
                console.log("URL de fetch:", url);
                const res = await fetch(url);
                if (!res.ok) throw new Error("Curso no encontrado");

                const data = await res.json();
                console.log("data recibida:", data);

                data.archived = Boolean(data.archived);

                data.features = defaultFeatures;
                setCourse(data);
                document.title = `${data.title} - ZETA`;
            } catch (error) {
                console.error("Error al cargar el curso:", error);
                router.push("/cursos-en-linea");
            }
        };

        fetchCourse();
    }, [courseId]);

    return { course, setCourse };
};

export default useFetchCourse;