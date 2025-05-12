import React, { useState } from "react";
import { FaArchive, FaCopy } from "react-icons/fa";
import styles from "./courseCardMenu.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const CourseCardMenu = ({ course, courseType }) => {
  const router = useRouter();
  const [isArchived, setIsArchived] = useState(course.archived); // Estado local para controlar el archivado
  const { isAdmin } = useAuth();

  // Determina la ruta en función del tipo de curso
  const courseRoute =
    courseType === "live" ? "/cursos-en-vivo" : "/cursos-en-linea";

  const handleViewCourse = (courseId) => {
    router.push(`${courseRoute}/${courseId}`);
  };

  const handleArchiveCourse = async (courseId) => {
    const confirmArchive = window.confirm(
      "¿Estás seguro de que deseas archivar este curso?"
    );
    if (!confirmArchive) return;

    try {
      await axios.put(`/api/courses/${courseId}`, { archived: true });
      setIsArchived(true);
    } catch (error) {
      console.error("Error archiving course: ", error.response?.data?.error || error.message);
    }
  };

  const handleDuplicateCourse = async (course) => {
    const confirmDuplicate = window.confirm(
      "¿Estás seguro de que deseas duplicar este curso?"
    );
    if (!confirmDuplicate) return;

    try {
      // Duplicar el curso principal
      const newCourse = {
        ...course,
        title: `${course.title} (Copy)`,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      delete newCourse.id;

      const response = await axios.post("/api/courses", newCourse);
      const duplicatedCourse = response.data;

      router.push(`${courseRoute}/${duplicatedCourse.id}`);
      window.location.reload();
    } catch (error) {
      console.error("Error duplicating course: ", error.response?.data?.error || error.message);
    }
  };


  if (isArchived) return null;

  return (
    <div
      className={styles.courseCard}
      onClick={() => handleViewCourse(course.id)}
    >
      <Image
        src={
          course.imageUrl ||
          "https://via.placeholder.com/1000x1000?text=Imagen+no+disponible"
        }
        alt={course.title || "Imagen del curso"}
        className={styles.courseImage}
        width={1000}
        height={1000}
      />
      <div className={styles.courseInfo}>
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        <div className={styles.priceContainer}>
          <span className={styles.discountedPrice}>
            ${course.discountedPrice}
          </span>
          <span className={styles.originalPrice}>${course.originalPrice}</span>
        </div>
        <button
          className={styles.infoButton}
          onClick={(e) => {
            e.stopPropagation();
            handleViewCourse(course.id);
          }}
        >
          Ver Información
        </button>

        {isAdmin && (
          <div className={styles.buttonIconContainer}>
            <button
              className={styles.duplicateButton}
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicateCourse(course);
              }}
              title="Duplicar curso"
            >
              <FaCopy />
            </button>
            <button
              className={styles.archiveButton}
              onClick={(e) => {
                e.stopPropagation();
                handleArchiveCourse(course.id);
              }}
              title="Archivar curso"
            >
              <FaArchive />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCardMenu;