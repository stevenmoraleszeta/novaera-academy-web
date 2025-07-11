"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

// Cache simple para evitar recargas innecesarias
const courseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const useFetchCourses = (collectionName) => {
    const [courses, setCourses] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cacheKey = `courses_${collectionName}`;

    const refetch = useCallback(() => {
        // Limpiar cache y recargar
        courseCache.delete(cacheKey);
        window.location.reload();
    }, [cacheKey]);

    useEffect(() => {
        const abortController = new AbortController();

        // Función async interna para manejar la carga de datos
        const loadCourses = async () => {
            try {
                setLoading(true);
                setError(null);

                // Verificar cache primero
                const cachedData = courseCache.get(cacheKey);
                if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
                    setCourses(cachedData.courses);
                    setMinPrice(cachedData.minPrice);
                    setMaxPrice(cachedData.maxPrice);
                    setLoading(false);
                    return;
                }

                const categoryName = collectionName === 'onlineCourses' ? 'online' : 'live';

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/courses/category-name/${categoryName}`,
                    {
                        signal: abortController.signal,
                        headers: {
                            'Cache-Control': 'max-age=300'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Error al obtener los cursos');
                }

                const data = await response.json();

                const activeCourses = data
                    .filter((course) => !(course.archived === true || course.archived === "true"))
                    .map((course) => ({
                        ...course,
                        discountedPrice: Number(course.discountedprice),
                        originalPrice: Number(course.originalprice),
                        id: course.courseid,
                    }));

                let minCoursePrice = 0;
                let maxCoursePrice = 10000;

                if (activeCourses.length > 0) {
                    const prices = activeCourses.map((course) => course.discountedPrice);
                    minCoursePrice = Math.floor(Math.min(...prices) / 10) * 10;
                    maxCoursePrice = Math.ceil(Math.max(...prices) / 10) * 10;
                }

                courseCache.set(cacheKey, {
                    courses: activeCourses,
                    minPrice: minCoursePrice,
                    maxPrice: maxCoursePrice,
                    timestamp: Date.now()
                });

                setCourses(activeCourses);
                setMinPrice(minCoursePrice);
                setMaxPrice(maxCoursePrice);
                setLoading(false);

            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError("Error al cargar los cursos");
                    setLoading(false);
                }
            }
        };

        loadCourses();

        // Función de limpieza
        return () => {
            abortController.abort();
        };
    }, [collectionName, cacheKey]);

    // Memorizar el resultado para evitar re-renderizados innecesarios
    const result = useMemo(() => ({
        courses,
        minPrice,
        maxPrice,
        loading,
        error,
        refetch
    }), [courses, minPrice, maxPrice, loading, error, refetch]);

    return result;
};

export default useFetchCourses;