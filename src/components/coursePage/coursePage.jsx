"use client";

import React, { useState, useEffect } from "react";
import CourseCardMenu from "@/components/courseCardMenu/courseCardMenu";
import useFetchCourses from "@/hooks/useFetchCourses/useFetchCourses";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import styles from "./coursePage.module.css";

const CoursesPage = ({ collectionName, pageTitle, placeholderText, courseType }) => {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { courses, minPrice, maxPrice, loading, error } = useFetchCourses(collectionName);

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [priceRange, setPriceRange] = useState(maxPrice);
    const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);

    const matchesQuery = (course, query) =>
        course?.title?.toLowerCase().includes(query.toLowerCase());

    const withinPriceRange = (course, range) =>
        course?.discountedPrice <= range;

    const matchesCategory = (course, category) =>
        !category || course?.category === category;

    const handleFilter = () => {
        const normalizedCourses = courses.map(course => ({
            ...course,
            archived: Boolean(course.archived),
        }));

        const filtered = normalizedCourses.filter((course) =>
            matchesQuery(course, searchQuery) &&
            withinPriceRange(course, priceRange) &&
            matchesCategory(course, selectedCategory) &&
            !course.archived
        );
        setFilteredCourses(filtered);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleFilter();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, priceRange, selectedCategory, courses]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handlePriceChange = (event) => {
        setPriceRange(parseInt(event.target.value, 10));
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory((prevCategory) =>
            prevCategory === category ? "" : category
        );
    };

    const handleAddCourse = async () => {
        try {
            const defaultImageUrl =
                "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FDALL·E%202024-09-14%2012.19.23%20-%20An%20epic%20and%20highly%20realistic%20scene%20of%20a%20woman%20learning%20to%20program%20in%20Python%2C%20with%20blue%20and%20yellow%20as%20the%20predominant%20colors.%20The%20woman%2C%20a%20young%20adult%20.webp?alt=media&token=496e97a6-c60f-44f0-8e87-12b0a1f5a755";

            let categoryId = 1;
            if (pathname.startsWith("/cursos-en-vivo")) {
                categoryId = 2;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: "Curso Introducción a la Programación con Python",
                    description: "Aprende a programar desde cero con Python, el lenguaje de programación más popular del mundo.",
                    discountedPrice: 29.99,
                    originalPrice: 39.99,
                    imageUrl: defaultImageUrl,
                    courseIcon: '📘',
                    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    archived: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    categoryId,
                    mentorId: 1,
                    modalityId: 1
                }),
            });

            if (!response.ok) {
                throw new Error('Error al crear el curso');
            }

            // Obtener el ID del curso recién creado
            const newCourse = await response.json();
            const courseId = newCourse.courseid || newCourse.id;

            // Agregar features por defecto (IDs 1, 2, 3, 4)
            const featuresToAdd = [1, 2, 3, 4];
            await Promise.all(
                featuresToAdd.map(async (featureId, idx) => {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course-features`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            courseid: courseId,
                            featureid: featureId,
                            order: idx + 1
                        }),
                    });
                })
            );

            window.location.reload();
        } catch (error) {
            console.error("Error al agregar curso: ", error);
        }
    };

    const categories = ["Programación", "Ofimática"];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <input
                    type="text"
                    placeholder={placeholderText}
                    className={styles.searchBar}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </header>

            <div className={styles.filters}>
                <div className={styles.filterOptions}>
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`${styles.filterButton} ${selectedCategory === category ? styles.activeFilter : ""}`}
                            onClick={() => handleCategoryChange(category)}
                        >
                            {category}
                        </button>
                    ))}
                    <div className={styles.sliderContainer}>
                        {!isNaN(minPrice) && !isNaN(maxPrice) && (
                            <div className={styles.sliderContainer}>
                                <input
                                    type="range"
                                    min={minPrice}
                                    max={maxPrice}
                                    step="10"
                                    value={priceRange}
                                    onChange={handlePriceChange}
                                    className={styles.slider}
                                />
                                <span>${priceRange}</span>
                            </div>
                        )}
                        <span>$</span>
                        <span>{priceRange}</span>
                    </div>
                </div>
                {isAdmin && (
                    <button className={styles.addButton} onClick={handleAddCourse}>
                        Agregar curso
                    </button>
                )}
            </div>

            {loading && <p>Cargando cursos...</p>}
            {error && <p>{error}</p>}

            <div className={styles.courseGrid}>
                {filteredCourses?.length > 0 &&
                    filteredCourses.map((course) => (
                        <CourseCardMenu
                            key={course.courseid}
                            course={{
                                ...course,
                                id: course.courseid,
                            }}
                            courseType={courseType}
                            collectionName={collectionName}
                        />
                    ))}

            </div>

            <footer className={styles.footer}>
                <p>¿No ves el curso que buscas?</p>
                <a
                    href="https://wa.link/hvutf8"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <button className={styles.contactButton}>Contáctanos</button>
                </a>
            </footer>
        </div>
    );
};

export default CoursesPage;