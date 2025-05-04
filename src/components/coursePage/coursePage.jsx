"use client";

import React, { useState, useEffect } from "react";
import CourseCardMenu from "@/components/courseCardMenu/courseCardMenu";
import useFetchCourses from "@/hooks/useFetchCourses/useFetchCourses";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import styles from "./coursePage.module.css";

const CoursesPage = ({ collectionName, pageTitle, placeholderText }) => {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
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
        const filtered = courses.filter((course) =>
            matchesQuery(course, searchQuery) &&
            withinPriceRange(course, priceRange) &&
            matchesCategory(course, selectedCategory) &&
            !course.archived
        );

        console.log("Courses originales:", courses);

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
            const categoryName = collectionName === 'onlineCourses' ? 'online' : 'live';
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category-name/${categoryName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: "",
                    description: "",
                    discountedPrice: 0,
                    originalPrice: 0,
                    category: "",
                    imageUrl: "",
                    features: [],
                    archived: false,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al crear el curso');
            }

            const data = await response.json();
            if (collectionName === 'onlineCourses') {
                router.push(`cursos-en-linea/${data.id}`);
            } else {
                router.push(`cursos-en-vivo/${data.id}`);
            }
        } catch (error) {
            console.error("Error al agregar curso: ", error);
        }
    };

    const categories = ["Programación", "Ofimática"];
    console.log("Cursos filtrados:", filteredCourses);

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
                            courseType={collectionName}
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