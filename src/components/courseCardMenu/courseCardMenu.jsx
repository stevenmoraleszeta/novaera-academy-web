// File: src/components/CourseCardMenu.jsx
import React, { useState } from "react";
import { FaArchive, FaCopy } from "react-icons/fa";
import styles from "./courseCardMenu.module.css";
import { useRouter } from "next/navigation";
import { doc, updateDoc, addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";


const CourseCardMenu = ({ course, courseType }) => {
  const router = useRouter();
  const [isArchived, setIsArchived] = useState(course.archived); // Estado local para controlar el archivado
  const { user, isAdmin } = useAuth();

  // Determina la colección y la ruta en función del tipo de curso
  const collectionName =
    courseType === "live" ? "liveCourses" : "onlineCourses";
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

    const docRef = doc(db, collectionName, courseId); // Usa la colección correcta
    try {
      await updateDoc(docRef, { archived: true });
      setIsArchived(true); // Actualiza el estado local para reflejar el cambio
    } catch (error) {
      console.error("Error archiving course: ", error);
    }
  };

  const handleDuplicateCourse = async (course) => {
    const collectionChoice = window.confirm(
      "¿Deseas duplicar este curso en liveCourses? (Cancel para onlineCourses)"
    )
      ? "liveCourses"
      : "onlineCourses";

    try {
      // Duplicar el curso principal
      const newCourse = {
        ...course,
        title: `${course.title} (Copy)`,
        archived: false,
      };
      delete newCourse.id; // Eliminar id para evitar conflictos
      const docRef = await addDoc(collection(db, collectionChoice), newCourse);

      // Obtener y duplicar módulos del curso original
      const modulesSnapshot = await getDocs(
        collection(db, `${collectionName}/${course.id}/modules`)
      );

      const modulePromises = modulesSnapshot.docs.map(async (moduleDoc) => {
        const moduleData = moduleDoc.data();
        delete moduleData.id;

        // Crear nuevo módulo en el curso duplicado
        const newModuleRef = await addDoc(
          collection(db, `${collectionChoice}/${docRef.id}/modules`),
          moduleData
        );

        // Obtener y duplicar clases para este módulo
        const classesSnapshot = await getDocs(
          collection(
            db,
            `${collectionName}/${course.id}/modules/${moduleDoc.id}/classes`
          )
        );

        const classPromises = classesSnapshot.docs.map((classDoc) => {
          const classData = classDoc.data();
          delete classData.id;

          return addDoc(
            collection(db, `${collectionChoice}/${docRef.id}/modules/${newModuleRef.id}/classes`),
            classData
          );
        });

        // Esperar a que se dupliquen todas las clases
        await Promise.all(classPromises);
      });

      // Esperar a que se dupliquen todos los módulos
      await Promise.all(modulePromises);

      router.push(
        `/${collectionChoice === "liveCourses" ? "cursos-en-vivo" : "cursos-en-linea"}/${docRef.id}`
      );
      window.location.reload(); // Recarga la página después de duplicar el curso
    } catch (error) {
      console.error("Error duplicating course: ", error);
    }
  };


  // No renderiza el curso si está archivado
  /* if (isArchived) return null; */

  return (
    <div
      className={styles.courseCard}
      onClick={() => handleViewCourse(course.id)}
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
          onClick={() => handleViewCourse(course.id)}
        >
          Ver Información
        </button>

        {isAdmin && (
          <div className={styles.buttonIconContainer}>
            <button
              className={styles.duplicateButton}
              onClick={(e) => {
                e.stopPropagation(); // Prevent navigation on button click
                handleDuplicateCourse(course); // Llama a la función de duplicar
              }}
              title="Duplicar curso"
            >
              <FaCopy />
            </button>
            <button
              className={styles.archiveButton}
              onClick={(e) => {
                e.stopPropagation(); // Prevent navigation on button click
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
