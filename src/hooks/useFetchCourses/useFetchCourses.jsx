"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";

const useFetchCourses = (collectionName) => {
    const [courses, setCourses] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, collectionName));
                const fetchedCourses = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                const activeCourses = fetchedCourses.filter((course) => !course.archived);
                const prices = activeCourses.map((course) => course.discountedPrice);
                const minCoursePrice = Math.floor(Math.min(...prices) / 10) * 10;
                const maxCoursePrice = Math.ceil(Math.max(...prices) / 10) * 10;

                setCourses(activeCourses);
                setMinPrice(minCoursePrice);
                setMaxPrice(maxCoursePrice);
                setLoading(false);
            } catch (err) {
                setError("Error fetching courses");
                setLoading(false);
            }
        };

        fetchCourses();
    }, [collectionName]);

    return { courses, minPrice, maxPrice, loading, error };
};

export default useFetchCourses;