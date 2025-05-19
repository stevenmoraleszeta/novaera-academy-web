"use client";

import { useState, useEffect } from "react";

const useFetchCourses = (collectionName) => {
    const [courses, setCourses] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                
                const categoryName = collectionName === 'onlineCourses' ? 'online' : 'live';
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/category-name/${categoryName}`);
                if (!response.ok) {
                    throw new Error('Error al obtener los cursos');
                }
                const data = await response.json();
                const activeCourses = data
                    .filter((course) => !course.archived)
                    .map((course) => ({
                        ...course,
                        discountedPrice: Number(course.discountedprice),
                        originalPrice: Number(course.originalprice),
                        id: course.courseid,
                    }));

                const prices = activeCourses.map((course) => course.discountedPrice);
                const minCoursePrice = Math.floor(Math.min(...prices) / 10) * 10;
                const maxCoursePrice = Math.ceil(Math.max(...prices) / 10) * 10;

                setCourses(activeCourses);
                setMinPrice(minCoursePrice);
                setMaxPrice(maxCoursePrice);
                setLoading(false);
            } catch (err) {
                setError("Error al cargar los cursos");
                setLoading(false);
            }
        };

        fetchCourses();
    }, [collectionName]);

    return { courses, minPrice, maxPrice, loading, error };
};

export default useFetchCourses;