"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import CourseCardMenu from "@/components/courseCardMenu/courseCardMenu";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import styles from "./coursePage.module.css";

const CoursesPage = ({ pageTitle, placeholderText }) => {
    const { user, isAdmin } = useAuth();
    const router = useRouter();

    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [priceRange, setPriceRange] = useState(1000); // Default the max price
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);

    // Fetch all courses from the backend
    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/courses");
            setCourses(response.data);
            setFilteredCourses(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Error fetching courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const matchesQuery = (course, query) =>
        course?.title?.toLowerCase().includes(query.toLowerCase());

    const withinPriceRange = (course, range) =>
        course?.discountedPrice <= range;

    const matchesCategory = (course, category) =>
        !category || course?.categoryName === category;

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
            const response = await axios.post("/api/courses", {
                title: "",
                description: "",
                discountedPrice: 0,
                originalPrice: 0,
                categoryId: 1, // Default category ID
                mentorId: 1, // Default mentor ID
                modalityId: 1, // Default modality ID
                imageUrl: "",
                courseIcon: "",
                videoUrl: "",
                archived: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            const newCourse = response.data;
            router.push(`/courses/${newCourse.id}`);
        } catch (error) {
            console.error("Error adding course: ", error.response?.data?.error || error.message);
        }
    };

    const categories = ["Programación", "Ofimática"]; // Replace with dynamic categories if needed

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
                            min={0}
                            max={1000} // Adjust based on the data
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
                            courseType="online" // Might need to adjust based on the data
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