"use client";

import React, { useState, useEffect } from "react";
import CourseCardMenu from "@/components/courseCardMenu/courseCardMenu";
import useFetchCourses from "@/hooks/useFetchCourses/useFetchCourses";

import { db } from "@/firebase/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import styles from "./coursePage.module.css";

const CoursesPage = ({ collectionName, pageTitle, placeholderText }) => {
    const router = useRouter();
    const { user, isAdmin } = useAuth();

    // Estados
    const { courses, minPrice, maxPrice, loading, error } = useFetchCourses(collectionName);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [priceRange, setPriceRange] = useState(maxPrice);
    const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);


    // Filtrar los cursos
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
        setFilteredCourses(filtered);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleFilter();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, priceRange, selectedCategory]);

    // Handlers
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
            const docRef = await addDoc(collection(db, collectionName), {
                title: "",
                description: "",
                discountedPrice: 0,
                originalPrice: 0,
                category: "",
                imageUrl: "",
                features: [],
                archived: false,
            });
            router.push(`/${collectionName}/${docRef.id}`);
        } catch (error) {
            console.error("Error adding course: ", error);
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
                        <input
                            type="range"
                            min={minPrice}
                            max={maxPrice}
                            step="10"
                            value={priceRange}
                            onChange={handlePriceChange}
                            className={styles.slider}
                        />
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

            {loading && <p>Loading courses...</p>}
            {error && <p>{error}</p>}

            <div className={styles.courseGrid}>
                {filteredCourses?.length > 0 &&
                    filteredCourses.map((course) => (
                        <CourseCardMenu
                            key={course.id}
                            course={course}
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