"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import styles from './page.module.css';
import { useAuth } from '@/context/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';

const StudentPage = () => {
    const params = useParams();
    const studentId = params ? params.studentId : null;

    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser, isAdmin } = useAuth();
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        if (studentId) {
            const fetchStudentData = async () => {
                try {
                    if (studentId) {
                        const docRef = doc(db, 'estudiantes', studentId);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            setStudentData(docSnap.data());
                        } else {
                            setError('No such document!');
                        }

                        const assignmentsQuery = query(
                            collection(db, 'asignaciones'),
                            where('estudianteId', '==', studentId)
                        );
                        const assignmentsSnap = await getDocs(assignmentsQuery);
                        const assignmentsList = assignmentsSnap.docs.map(doc => {
                            const data = doc.data();
                            return {
                                id: doc.id,
                                ...data,
                                fecha: data.fecha.toDate() // Convierte el Timestamp de Firestore a Date
                            };
                        });
                        setAssignments(assignmentsList);
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchStudentData();
        }
    }, [studentId]);

    if (loading) return <p>Cargando datos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className={styles.studentPageContainer}>
            <h1>Ficha de Estudiante</h1>
            {studentData && <h1>{studentData.nombreCompleto}</h1>}
            {studentData && (
                <div className={styles.studentInformation}>
                    <div className={styles.studentDataContainer}>
                        <h2>Información personal</h2>
                        <p>Nombre de usuario: {studentData.username || ''}</p>
                        <p>Email: {studentData.email || ''}</p>
                        <p>Edad: {studentData.edad || ''}</p>
                    </div>
                    <div className={styles.studentTableContainer}>
                        <h2>Perfil de estudio</h2>
                        {studentData && (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ocupación</th>
                                        <th>Intereses personales</th>
                                        <th>Estilo de aprendizaje</th>
                                        <th>Nivel inicial</th>
                                        <th>Objetivos individuales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{studentData.ocupacion}</td>
                                        <td>{studentData.Intereses}</td>
                                        <td>{studentData.estiloAprendizaje}</td>
                                        <td>{studentData.nivelInicial}</td>
                                        <td>{studentData.objetivosIndividuales}</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className={styles.studentAssignmentsContainer}>
                        <h2>Asignaciones</h2>
                        <div className={styles.assignmentsMainContainer}>
                            <div className={styles.assignmentsContainer}>
                                {assignments.length === 0 ? (
                                    <p>Este estudiante no tiene asignaciones completadas o calificadas.</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Tarea/ Proyecto</th>
                                                <th>Estado</th>
                                                <th>Calificación</th>
                                                <th>Fecha</th>
                                                <th>Comentarios</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assignments.map((assignment) => (
                                                <tr key={assignment.id}>
                                                    <td>{assignment.nombre}</td>
                                                    <td>{assignment.estado}</td>
                                                    <td>{assignment.calificacion}</td>
                                                    <td>{assignment.fecha.toLocaleString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}</td>
                                                    <td>{assignment.comentarios}</td>
                                                    <td>
                                                        <button className={styles.actionBtn}><FaTrash></FaTrash></button>
                                                        <button className={styles.actionBtn}><FaEdit></FaEdit></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className={styles.adminActionsContainer}>
                                <button className={styles.addAssignmentButton}>
                                    Agregar tarea/Proyecto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentPage;