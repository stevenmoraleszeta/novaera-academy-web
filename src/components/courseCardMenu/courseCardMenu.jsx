import React, { useState, useCallback, memo, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import Image from "next/image";

// Lazy load iconos solo cuando se necesiten (para admin)
const FaArchive = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaArchive })));
const FaCopy = lazy(() => import("react-icons/fa").then(module => ({ default: module.FaCopy })));

// Lazy load axios solo cuando se necesite
const axios = lazy(() => import("axios"));

import styles from "./courseCardMenu.module.css";

const CourseCardMenu = memo(({ course, courseType, collectionName }) => {
  const router = useRouter();
  const [isArchived, setIsArchived] = useState(course.archived);
  const { isAdmin } = useAuth();
  const { showAlert, showConfirm } = useModal();

  // Determina la ruta en función del tipo de curso
  const courseRoute =
    courseType === "live" ? "/cursos-en-vivo" : "/cursos-en-linea";

  const handleViewCourse = useCallback((courseId) => {
    router.push(`${courseRoute}/${courseId}`);
  }, [courseRoute, router]);

  const handleArchiveCourse = useCallback(async (courseId) => {
    showConfirm(
      `¿Estás seguro de que deseas archivar el curso "${course.title}"?`,
      async () => {
        try {
          // Lazy load axios solo cuando se necesite
          const { default: axios } = await import("axios");
          await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, {
            ...course,
            archived: true,
          });
          setIsArchived(true);
          showAlert("Curso archivado con éxito.", "Archivado");
        } catch (error) {
          showAlert(`Error al archivar: ${error.message}`, "Error");
        }
      },
      "Confirmar Archivado"
    );
  }, [course, showAlert, showConfirm]);

  // Duplicar curso usando el backend
  const handleDuplicateCourse = useCallback(async (course) => {
    showConfirm(
      `¿Deseas duplicar el curso "${course.title}"?`,
      async () => {
        try {
          // Lazy load axios solo cuando se necesite
          const { default: axios } = await import("axios");
          const newCourse = {
            ...course,
            title: `${course.title} (Copy)`,
            archived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          delete newCourse.courseid;
          delete newCourse.id;

          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/courses`, newCourse);
          showAlert("Curso duplicado con éxito. La lista se actualizará.", "Duplicado");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          showAlert(`Error al duplicar: ${error.message}`, "Error");
        }
      },
      "Confirmar Duplicación"
    );
  }, [course, showAlert, showConfirm]);

  if (isArchived) return null;

  const defaultImageUrl = "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FprogrammingDefaulImage.webp?alt=media&token=1ddc96cb-88e5-498e-8d9f-a870f32ecc45";

  return (
    <div
      className={styles.courseCard}
      onClick={() => handleViewCourse(course.courseid || course.id)}
    >
      <Image
        src={course.imageurl || defaultImageUrl}
        alt={course.title || "Imagen del curso"}
        className={styles.courseImage}
        width={400}
        height={250}
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAQIAEQMhkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+JNKpBJXu9/wCxjmD"
        priority={false}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              <Suspense fallback={<span>📋</span>}>
                <FaCopy />
              </Suspense>
            </button>
            <button
              className={styles.archiveButton}
              onClick={(e) => {
                e.stopPropagation();
                handleArchiveCourse(course.courseid || course.id);
              }}
              title="Archivar curso"
            >
              <Suspense fallback={<span>📁</span>}>
                <FaArchive />
              </Suspense>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// Agregar displayName para debugging
CourseCardMenu.displayName = 'CourseCardMenu';

export default CourseCardMenu;