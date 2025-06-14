import { useState, useCallback } from "react";

export function useCompletedClasses({ userId, classId }) {
    const [completedClasses, setCompletedClasses] = useState([]);
    const [isCompleted, setIsCompleted] = useState(false);

    const fetchCompletedStatus = useCallback(async () => {
        if (!userId) return;
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/completed-classes`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("No se pudo obtener el progreso del usuario");
            const data = await res.json();
            const completed = (data.completedClasses || []).map(Number);
            setCompletedClasses(completed);
            setIsCompleted(completed.includes(Number(classId)));
        } catch (error) {
            console.error("Error al obtener el estado de completado:", error);
        }
    }, [userId, classId]);

    return {
        completedClasses,
        isCompleted,
        fetchCompletedStatus,
        setCompletedClasses,
        setIsCompleted,
    };
}