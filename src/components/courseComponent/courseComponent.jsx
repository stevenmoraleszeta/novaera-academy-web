"use client";

import React, { useEffect, useState, use, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import useFetchCourse from "@/hooks/fetchCourses/useFetchCourse";
import { useModal } from '../../context/ModalContext';

import { useCompletedClasses } from "@/hooks/useCompletedClasses/useCompletedClasses";
import CourseDetails from "@/components/courseDetails/courseDetails";
import CourseVideo from "@/components/courseVideo/courseVideo";
import Features from "@/components/features/features";
import ModuleCard from "@/components/moduleCards/moduleCards";
import { Modal } from "@/components/modal/modal";
import ProjectsList from "@/components/projects/projects";
import ClassesRecorded from "@/components/classesRecorded/ClassesRecorded";

import { useFirebaseIntegration } from "@/hooks/useFirebaseIntegration"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/firebase";


import { FaPlus, FaTrash } from "react-icons/fa";
import styles from "./courseComponent.module.css";

const CourseDetail = ({
    courseIdentification,
    isLiveCourse = false,
    studentProjects = [],
    averageScore = null,
}) => {
    const searchParams = useSearchParams();
    const courseIdFromSearch = searchParams.get("courseId");
    const courseId = courseIdFromSearch || courseIdentification;
    const { course, setCourse } = useFetchCourse(courseId, isLiveCourse ? "liveCourses" : "onlineCourses");
    const router = useRouter();

    const [modules, setModules] = useState([]);
    const { currentUser, isAdmin } = useAuth();
    const [isEnrolled, setIsEnrolled] = useState(false);

    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState(course?.videoUrl || "");

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState("");
    const [adminUsers, setAdminUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [mentorList, setMentorList] = useState([]);

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const { ensureFirebaseConnection, isConnecting } = useFirebaseIntegration();
    const [uploadingFile, setUploadingFile] = useState(false);

    const { showAlert, showConfirm } = useModal();

    const { completedClasses, fetchCompletedStatus } = useCompletedClasses({
        userId: currentUser?.userid,
    });

    useEffect(() => {
        if (currentUser?.userid) {
            fetchCompletedStatus();
        }
    }, [currentUser?.userid]);

    const getClassId = (cls) => cls.classid || cls.id;

    const highlightedClassId = useMemo(() => {
        for (const module of modules) {
            const nextClass = module.classes?.find(
                cls => !completedClasses.includes(Number(getClassId(cls)))
            );
            if (nextClass) {
                return getClassId(nextClass);
            }
        }
        return null;
    }, [modules, completedClasses]);

    const filteredStudents = allUsers.filter(
        (user) =>
            // Filtrar por texto de búsqueda
            (user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) || !searchTerm) &&
            (user.email?.toLowerCase().includes(searchEmail.toLowerCase()) || !searchEmail) &&
            // Excluir estudiantes que ya están inscritos en el curso
            !students.includes(user.userid) &&
            // Solo mostrar usuarios que no son administradores (opcional, según tu lógica de negocio)
            user.roleid !== 8
    );

    useEffect(() => {
        if (!isLiveCourse || !isAdmin) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`)
            .then(res => res.json())
            .then(data => {
                setAllUsers(data);
                setAdminUsers(data.filter(u => u.roleid === 8));
            });

        // Traer los estudiantes inscritos en el curso
        if (!courseId) {
            console.warn("No hay courseId válido, no se hace fetch");
            return;
        }
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-courses/by-course/${courseId}`)
            .then(res => res.json())
            .then(data => {
                setStudents(data.map(sc => sc.userid));
            });
    }, [isLiveCourse, isAdmin, courseId]);

    useEffect(() => {
        if (course && course.mentorid) {
            setSelectedMentor(course.mentorid);
        }
    }, [course]);

    const openGroupModal = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`);
            const data = await res.json();
            setSelectedMentor(data.mentorid || "");
            const mentorRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mentors`);
            const mentorData = await mentorRes.json();
            setMentorList(Array.isArray(mentorData) ? mentorData : []);
        } catch (e) {
            setSelectedMentor("");
            setMentorList([]);
        }
        setIsGroupModalOpen(true);
    };

    const assignMentor = async (mentorId) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/mentor`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mentorId: Number(mentorId) }),
            });
            setSelectedMentor(Number(mentorId));
        } catch (error) {
            showAlert(`Error al asignar mentor: ${error.message}`, "Error");
        }
    };

    const handleAddStudent = async (studentId) => {
        const numericId = Number(studentId);
        if (!numericId) return;

        // Verificar si el estudiante ya está inscrito en el curso
        if (students.includes(numericId)) {
            showAlert("Este estudiante ya está inscrito en el curso.", "Acción no permitida");
            return;
        }

        try {
            //Inscribir al estudiante en el curso
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-courses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: Number(studentId),
                    courseId: Number(courseId),
                    enrollmentDate: new Date().toISOString().split('T')[0],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            console.log("✅ Estudiante inscrito en el curso");

            //Asignar proyectos existentes al estudiante(solo para cursos en vivo)
            if (isLiveCourse) {
                try {
                    const projectAssignmentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/assign-to-student`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: Number(studentId),
                            courseId: Number(courseId),
                        }),
                    });

                    if (projectAssignmentResponse.ok) {
                        const assignmentData = await projectAssignmentResponse.json();
                        console.log("Proyectos asignados:", assignmentData);

                        if (assignmentData.assignedProjects > 0) {
                            showAlert(
                                `Estudiante añadido con éxito. Se asignaron ${assignmentData.assignedProjects} proyecto(s) automáticamente.`,
                                "Éxito"
                            );
                        } else {
                            showAlert("Estudiante añadido con éxito. No había proyectos nuevos para asignar.", "Éxito");
                        }
                    } else {
                        console.warn("Error asignando proyectos, pero el estudiante fue inscrito");
                        showAlert("Estudiante añadido con éxito, pero hubo un problema asignando proyectos existentes.", "Advertencia");
                    }
                } catch (projectError) {
                    console.error("Error asignando proyectos:", projectError);
                    showAlert("Estudiante añadido con éxito, pero hubo un problema asignando proyectos existentes.", "Advertencia");
                }
            } else {
                showAlert("Estudiante añadido con éxito.", "Éxito");
            }

            //Actualiza la lista local de estudiantes
            setStudents([...students, numericId]);

        } catch (error) {
            console.error("Error al añadir estudiante:", error);
            showAlert(`Error al añadir estudiante: ${error.message}`, "Error");
        }
    };

    // Falta implementar el borrado de los estudiantes al curso
    const handleRemoveStudent = async (studentId, studentName) => {
        showConfirm(
            `¿Estás seguro de que deseas eliminar a "${studentName}" de este curso?`,
            async () => {
                try {
                    // Primero buscamos el registro student-course para obtener el ID
                    const studentCourseResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/student-courses/by-course/${courseId}`
                    );

                    if (!studentCourseResponse.ok) {
                        throw new Error("Error al obtener los registros de estudiantes del curso");
                    }

                    const studentCourses = await studentCourseResponse.json();

                    const studentCourseRecord = studentCourses.find(sc => sc.userid === studentId);

                    if (!studentCourseRecord) {
                        throw new Error("No se encontró el registro del estudiante en este curso");
                    }

                    const recordId = studentCourseRecord.studentcourseid ||
                        studentCourseRecord.id ||
                        studentCourseRecord.studentCourseId;

                    if (!recordId) {
                        console.error("Student course record structure:", Object.keys(studentCourseRecord));
                        throw new Error("No se pudo encontrar el ID del registro student-course");
                    }

                    // Eliminamos el registro usando el ID del student-course
                    const deleteResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/student-courses/${recordId}`,
                        {
                            method: "DELETE",
                        }
                    );

                    if (!deleteResponse.ok) {
                        const errorData = await deleteResponse.json().catch(() => ({ error: "Error desconocido" }));
                        throw new Error(errorData.error || `Error ${deleteResponse.status}: ${deleteResponse.statusText}`);
                    }

                    // Actualizamos el estado local
                    setStudents(prev => prev.filter(id => id !== studentId));
                    showAlert("Estudiante eliminado del curso.", "Éxito");
                } catch (error) {
                    console.error("Error al eliminar estudiante:", error);
                    showAlert(`Error al eliminar estudiante: ${error.message}`, "Error");
                }
            },
            "Confirmar Eliminación"
        );
    };

    const openVideoModal = () => {
        setVideoUrl(course?.videoUrl || "https://www.youtube.com/watch?v=zLRCwQS7XAM");
        setIsVideoModalOpen(true);
    };

    useEffect(() => {
        const fetchModulesAndClasses = async () => {
            if (!courseId) return;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules/course/${courseId}`);
                const modulesData = await response.json();
                const modulesWithSortedClasses = modulesData.map((mod, idx) => ({
                    ...mod,
                    id: mod.moduleid,
                    classes: Array.isArray(mod.classes)
                        ? mod.classes.map((cls, cidx) => ({
                            ...cls,
                            id: cls.classid || cls._id || `class-${cidx}`,
                        })).sort((a, b) => a.orderClass - b.orderClass)
                        : [],
                }));

                modulesWithSortedClasses.sort((a, b) => a.orderModule - b.orderModule);
                setModules(modulesWithSortedClasses);
            } catch (error) {
                console.error("Error fetching modules and classes:", error);
            }
        };

        fetchModulesAndClasses();
    }, [courseId]);

    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            if (!currentUser || !currentUser.userid || !courseId) {
                setIsEnrolled(false);
                return;
            }

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/student-courses/${courseId}/${currentUser.userid}`
                );
                if (!response.ok) {
                    setIsEnrolled(false);
                    return;
                }
                const data = await response.json();
                setIsEnrolled(Array.isArray(data) && data.length > 0);
            } catch (error) {
                console.error("Error de red al verificar inscripción:", error);
                setIsEnrolled(false);
            }
        };

        checkEnrollmentStatus();
    }, [currentUser, courseId]);


    const handleFieldChange = async (field, value) => {
        const fieldMap = {
            imageUrl: "imageurl",
            discountedprice: "discountedPrice",
            originalprice: "originalPrice",
            description: "description",
            title: "title",
        };
        const backendField = fieldMap[field] || field;

        const normalizedCourse = {
            ...course,
            discountedPrice: course.discountedPrice ?? course.discountedprice,
            originalPrice: course.originalPrice ?? course.originalprice,
            imageUrl: course.imageUrl ?? course.imageurl,
            courseIcon: course.courseIcon ?? course.courseicon,
            videoUrl: course.videoUrl ?? course.videourl,
            categoryId: course.categoryId ?? course.categoryid,
            mentorId: course.mentorId ?? course.mentorid,
            modalityId: course.modalityId ?? course.modalityid,
        };

        if (field === "discountedprice" || field === "discountedPrice") {
            normalizedCourse.discountedPrice = value;
            normalizedCourse.discountedprice = value;
        } else if (field === "originalprice" || field === "originalPrice") {
            normalizedCourse.originalPrice = value;
            normalizedCourse.originalprice = value;
        } else {
            normalizedCourse[backendField] = value;
        }
        setCourse(normalizedCourse);

        const backendCourse = {
            courseId,
            title: normalizedCourse.title,
            description: normalizedCourse.description,
            discountedPrice: normalizedCourse.discountedPrice,
            originalPrice: normalizedCourse.originalPrice,
            imageUrl: normalizedCourse.imageUrl,
            courseIcon: normalizedCourse.courseIcon,
            videoUrl: normalizedCourse.videoUrl,
            archived: false,
            updatedAt: new Date().toISOString(),
            categoryId: normalizedCourse.categoryId,
            mentorId: normalizedCourse.mentorId,
            modalityId: normalizedCourse.modalityId,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(backendCourse),
            });

            if (response.ok) {
                showAlert("El curso se ha actualizado correctamente.", "Éxito");
            } else {
                throw new Error("Error al actualizar el curso");
            }
        } catch (error) {
            console.error("Error al actualizar el curso:", error);
        }
    };

    const addModule = async () => {
        try {
            const orderModule = modules.length + 1;
            const newModule = {
                title: "Nuevo Módulo",
                orderModule,
                courseId,
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newModule),
            });

            if (!response.ok) {
                throw new Error("Error al crear el módulo");
            }

            const modulesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules/course/${courseId}`);
            const modulesData = await modulesResponse.json();

            const modulesWithSortedClasses = modulesData.map((mod, idx) => ({
                ...mod,
                id: mod.moduleid,
                classes: Array.isArray(mod.classes)
                    ? mod.classes.map((cls, cidx) => ({
                        ...cls,
                        id: cls.classid || cls._id || `class-${cidx}`,
                    })).sort((a, b) => a.orderClass - b.orderClass)
                    : [],
            }));

            modulesWithSortedClasses.sort((a, b) => a.orderModule - b.orderModule);
            setModules(modulesWithSortedClasses);
            showAlert("Módulo añadido con éxito.", "Éxito");
        } catch (error) {
            showAlert(`Error al añadir módulo: ${error.message}`, "Error");
        }
    };

    const onClassClick = (moduleId, classId) => {
        const basePath = isLiveCourse ? "cursos-en-vivo" : "cursos-en-linea";
        router.push(`/${basePath}/${courseId}/${moduleId}/${classId}`);
    };

    const handleSaveVideoUrl = async () => {
        await handleFieldChange("videoUrl", videoUrl);
        setIsVideoModalOpen(false);
    };

    const handleSaveImage = async () => {  
        try {
            setUploadingFile(true);

            // Asegurar autenticación en Firebase antes de subir
            console.log("Asegurando autenticación en Firebase...");
            const firebaseUser = await ensureFirebaseConnection();
            console.log("Usuario autenticado en Firebase:", firebaseUser.uid);

            // Crear referencia única del archivo
            const timestamp = Date.now();
            const sanitizedFileName = selectedImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${timestamp}_${sanitizedFileName}`;
            const storageRef = ref(storage, `projects/${firebaseUser.uid}/${fileName}`);

            console.log("Subiendo archivo a Firebase Storage...");

            // Subir archivo
            const snapshot = await uploadBytes(storageRef, selectedImageFile);
            const downloadURL = await getDownloadURL(snapshot.ref);

            console.log("Archivo subido exitosamente:", downloadURL);
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/image`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                    body: JSON.stringify({ imageUrl: downloadURL }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al guardar la URL en la base de datos.");
            }

            const updatedCourseData = await response.json();
            setCourse(updatedCourseData.course);
            showAlert("Imagen subida y guardada con éxito.", "Éxito");
            setIsImageModalOpen(false);
            setSelectedImageFile(null);

        } catch (error) {
            showAlert(`Error subiendo archivo: ${error.message}`, "Error de Firebase");
        } finally {
            setUploadingFile(false);
        }
    };

    useEffect(() => {
        setVideoUrl(course?.videoUrl || "");
    }, [course?.videoUrl]);


    if (!course) {
        return <div>Cargando información del curso...</div>;
    }

    return (
        <div className="course-detail-container">
            {isAdmin ? (
                <input
                    type="text"
                    value={course.title || ""}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="course-detail-title-input"
                />
            ) : (
                <span className="course-detail-title-text">
                    {course.title || "Sin título disponible"}
                </span>
            )}
            <div className="course-detail-main-content">
                <CourseVideo course={course} isAdmin={isAdmin} openVideoModal={openVideoModal} />
                <CourseDetails
                    course={course}
                    isAdmin={isAdmin}
                    isEnrolled={isEnrolled}
                    handleFieldChange={handleFieldChange}
                    handleContactClick={() => { }}
                    openGroupModal={openGroupModal}
                    openVideoModal={openVideoModal}
                    isLiveCourse={isLiveCourse}
                    openImageModal={() => setIsImageModalOpen(true)}
                />
            </div>
            {!isEnrolled && (
                <Features courseId={courseId} course={course} setCourse={setCourse}></Features>
            )}
            <div className={styles.mainContentGrid}>
                <div className={styles.leftColumn}>
                    {modules.length > 0 ? (
                        modules.map((classModule, moduleIndex) => (
                            <ModuleCard
                                key={classModule.id || `module-${moduleIndex}`}
                                moduleData={{
                                    ...classModule,
                                    order: moduleIndex,
                                }}
                                totalModules={modules}
                                isAdmin={isAdmin}
                                courseId={courseId}
                                onModulesUpdate={setModules}
                                onClassClick={onClassClick}
                                currentUser={currentUser}
                                highlightedClassId={highlightedClassId}
                                completedClasses={completedClasses}
                            />
                        ))
                    ) : (
                        <p>No hay módulos disponibles.</p>
                    )}
                    {isAdmin && (
                        <button onClick={addModule} className="add-element-button" title="Añadir Módulo">
                            Add Module
                        </button>
                    )}
                </div>

                <div className={styles.rightColumn}>
                    {/* ProjectsList solo para cursos en vivo */}
                    {isLiveCourse && (
                        <ProjectsList
                            isAdmin={isAdmin}
                            isStudentInCourse={isEnrolled}
                            studentProjects={studentProjects}
                            courseId={courseId}
                            averageScore={averageScore}
                            students={students}
                            mentor={selectedMentor}
                        />
                    )}
                    {/* Records solo para cursos en vivo */}
                    {isLiveCourse && (isEnrolled || isAdmin) && <ClassesRecorded courseId={courseId} isAdmin={isAdmin} />}
                    {/* {isLiveCourse && <ClassesRecorded courseId={courseId} />}    */}
                </div>
            </div>

            {isVideoModalOpen && (
                <Modal isOpen={isVideoModalOpen}
                    onClose={() => setIsVideoModalOpen(false)}
                    title="Editar enlace del video"
                    modalType="customContent">
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <input
                            type="text"
                            name="videoUrl"
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                            placeholder="Pega el enlace del video"
                            style={{ width: "100%" }}
                        />
                        {/* <div style={{ display: "flex", gap: 8 }}> */}
                        <div className="formActions">
                            <button className="saveButton" onClick={handleSaveVideoUrl}>Guardar</button>
                            <button className="cancelButton" onClick={() => setIsVideoModalOpen(false)}>Cancelar</button>
                        </div>

                    </div>
                </Modal>
            )}

            {isImageModalOpen && (
                <Modal
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    title="Subir nueva imagen"
                    modalType="customContent"
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <p>Selecciona la imagen que deseas subir.</p>
                        <input
                            type="file"
                            name="imageUpload"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={e => setSelectedImageFile(e.target.files[0])}
                            style={{ width: "100%" }}
                        />
                        {selectedImageFile && (
                            <p style={{ fontSize: '14px', color: '#888' }}>
                                Archivo seleccionado: {selectedImageFile.name}
                            </p>
                        )}

                        <div className="formActions">
                            <button
                                className="saveButton"
                                onClick={handleSaveImage}
                                disabled={!selectedImageFile || isUploading || isConnecting}
                            >
                                {isUploading ? 'Subiendo...' : 'Guardar Imagen'}
                                
                            </button>
                            <button
                                className="cancelButton"
                                onClick={() => setIsImageModalOpen(false)}
                                disabled={isUploading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {isGroupModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Asignar Mentor</h3>
                        <select
                            value={selectedMentor || ""}
                            onChange={async (e) => {
                                const mentorId = e.target.value;
                                setSelectedMentor(mentorId);
                                if (mentorId) {
                                    await assignMentor(mentorId);
                                }
                            }}
                        >
                            <option value="">Selecciona un mentor</option>
                            {Array.isArray(mentorList) && mentorList.map(mentor => {
                                const user = allUsers.find(u => u.userid === mentor.userid);
                                return (
                                    <option key={mentor.mentorid} value={mentor.mentorid}>
                                        {`${user.firstname} ${user.lastname1}`}
                                    </option>
                                );
                            })}
                        </select>
                        <h3>Asignar Estudiantes</h3>
                        <input
                            type="text"
                            placeholder="Buscar estudiante por nombre"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <input
                            type="email"
                            placeholder="Buscar estudiante por email"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            className={styles.searchInput}
                        />
                        <div className={styles.buttonContainer}>
                            <select id="studentSelect">
                                <option value="">Selecciona un estudiante</option>
                                
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map(user => (
                                        <option key={user.userid} value={user.userid}>
                                            {`${user.firstname} ${user.lastname1 || "Nombre no disponible"}`} - {user.email}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>
                                        {searchTerm || searchEmail ? "No se encontraron estudiantes" : "Todos los estudiantes ya están inscritos"}
                                    </option>
                                )}
                            </select>
                            <button
                                onClick={() => handleAddStudent(document.getElementById('studentSelect').value)}
                                disabled={filteredStudents.length === 0}
                            >
                                <FaPlus />
                            </button>
                        </div>
                        <table className={styles.studentTable}>
                            <thead>
                                <tr>
                                    <th>Estudiantes</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(studentId => {
                                    const student = allUsers.find(user => user.userid === studentId);
                                    const fullName = student ? `${student.firstname} ${student.lastname1}` : "Nombre no disponible";
                                    return (
                                        <tr key={studentId}>
                                            <td>{fullName}</td>
                                            <td>
                                                <button onClick={() => handleRemoveStudent(studentId, fullName)}>
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="formActions">
                            <button className="cancelButton" onClick={() => setIsGroupModalOpen(false)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail;