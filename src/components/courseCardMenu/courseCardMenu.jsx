import React, { useState } from "react";
import { FaArchive, FaCopy } from "react-icons/fa";
import styles from "./courseCardMenu.module.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import axios from "axios";

const CourseCardMenu = ({ course, courseType, collectionName }) => {
  const router = useRouter();
  const [isArchived, setIsArchived] = useState(course.archived);
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
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`,
        {
          ...course,
          archived: true,
          updatedAt: new Date().toISOString(),
        }
      );
      setIsArchived(true);
      window.location.reload();
    } catch (error) {
      console.error("Error archiving course: ", error);
    }
  };

  // Duplicar curso usando el backend
  const handleDuplicateCourse = async (course) => {
    const confirmDuplicate = window.confirm(
      "¿Deseas duplicar este curso?"
    );
    if (!confirmDuplicate) return;

    try {
      const newCourse = {
        ...course,
        title: `${course.title} (Copy)`,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      delete newCourse.courseid;
      delete newCourse.id;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/courses`,
        newCourse
      );
      // Redirige al nuevo curso si tienes el id, si no, recarga
      window.location.reload();
    } catch (error) {
      console.error("Error duplicating course: ", error);
    }
  };

  if (isArchived) return null;

  return (
    <div
      className={styles.courseCard}
      onClick={() => handleViewCourse(course.courseid || course.id)}
    >
      <Image
        src={
          course.imageUrl ||
          "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FprogrammingDefaulImage.webp?alt=media&token=1ddc96cb-88e5-498e-8d9f-a870f32ecc45"
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
            handleViewCourse(course.courseid || course.id);
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
                handleArchiveCourse(course.courseid || course.id);
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