"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaPlus, FaPencilAlt, FaTimes, FaArrowUp, FaArrowDown } from "react-icons/fa";
import styles from "./ClassesRecorded.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ClassesRecorded = ({ courseId, isAdmin }) => {
  const [recordings, setRecordings] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 

  const [errors, setErrors] = useState({});

  // --- FUNCIÓN PARA VALIDAR EL FORMULARIO ---
const validateForm = () => {
  const newErrors = {};
  if (!currentTitle.trim()) {
    newErrors.title = "El título es obligatorio.";
  }
  
  if (!currentUrl.trim()) {
    newErrors.url = "La URL es obligatoria.";
  } else if (!/^(https?:\/\/|www\.)/.test(currentUrl)) {
    newErrors.url = "La URL debe comenzar con http://, https:// o www.";
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // --- Data logic (fetch) ---
  useEffect(() => {
    if (!courseId) return;
    const fetchRecordings = async () => {
      try {
        const response = await axios.get(`${API_URL}/recordings/${courseId}`);
        setRecordings(response.data);
      } catch (error) {
        console.error("Error al obtener grabaciones:", error.response?.data || error.message);
      }
    };
    fetchRecordings();
  }, [courseId]);

  // --- Modal for update or insert recordings ---
  const openAddModal = () => {
    setEditingId(null);
    setCurrentTitle("");
    setCurrentUrl("");
    setIsModalOpen(true);
  };
  // --- open Edit modal ---
  const openEditModal = (recording) => {
    setEditingId(recording.recordingid);
    setCurrentTitle(recording.title);
    setCurrentUrl(recording.url);
    setIsModalOpen(true);
  };
  // --- Close Modal ---
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setCurrentTitle("");
    setCurrentUrl("");
  };

  // --- CRUD recordings ---
  const handleSave = async () => {
    const isValid = validateForm()
    if(!isValid){
      return;
    }
    if (editingId) {
      // --- update logic ---
      try {
        const response = await axios.put(`${API_URL}/recordings/${editingId}`, {
          title: currentTitle,
          url: currentUrl,
        });
        setRecordings(prev => prev.map(rec => (rec.recordingid === editingId ? response.data : rec)));
      } catch (error) {
        console.error("Error al actualizar grabación:", error.response?.data || error.message);
      }
    } else {
      // --- Add record logic ---
      try {
        const response = await axios.post(`${API_URL}/recordings`, {
          title: currentTitle,
          url: currentUrl,
          orderrecording: recordings.length,
          courseid: courseId,
        });
        setRecordings(prev => [...prev, response.data]);
      } catch (error) {
        console.error("Error al agregar la grabación:", error.response?.data || error.message);
      }
    }
    closeModal();
  };
    // --- Delete logic --- 
  const deleteRecording = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta grabación?")) {
      try {
        await axios.delete(`${API_URL}/recordings/${id}`);
        setRecordings(prev => prev.filter(rec => rec.recordingid !== id));
      } catch (error) {
        console.error("Error al eliminar la grabación:", error.response?.data || error.message);
      }
    }
  };

  // --- moving logic ---
  const moveRecording = (index, direction) => {
      const newRecordings = [...recordings];
      const [movedRecording] = newRecordings.splice(index, 1);
      newRecordings.splice(index + direction, 0, movedRecording);
      setRecordings(newRecordings);
  };

  return (
    <div className={styles.recordingsBlock}>
      <h3>Grabaciones de Clases</h3>

      {/* Mapeo de las grabaciones */}
      {recordings.map((rec, index) => (
        <div key={rec.recordingid} className={styles.recordingItem}>
          <a href={rec.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
              <span>{rec.title}</span>
          </a>
          
          {isAdmin && (
            <div className={styles.actions}>
              <button onClick={() => moveRecording(index, -1)} disabled={index === 0} className={styles.actionButton} title="Mover arriba"><FaArrowUp /></button>
              <button onClick={() => moveRecording(index, 1)} disabled={index === recordings.length - 1} className={styles.actionButton} title="Mover abajo"><FaArrowDown /></button>
              <button onClick={() => openEditModal(rec)} className={styles.actionButton} title="Editar"><FaPencilAlt /></button>
              <button onClick={() => deleteRecording(rec.recordingid)} className={styles.actionButton} title="Eliminar"><FaTrash /></button>
            </div>
          )}
        </div>
      ))}

      {isAdmin && (
        <button onClick={openAddModal} className="add-element-button">
          Añadir Grabación
        </button>
      )}

      {/* --- (Modal) --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>{editingId ? "Editar Grabación" : "Añadir Nueva Grabación"}</h3>
            
            <label htmlFor="recordingTitle">Título de la grabación:</label>
            <input
              id="recordingTitle"
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className={styles.title}
              required
            />
            {errors.title && <span className={styles.errorMessage}>{errors.title}</span>}
            <label htmlFor="recordingUrl">URL de la grabación:</label>
            <input
              id="recordingUrl"
              type="url"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              className={`${styles.title} ${errors.url ? styles.inputError : ''}`}
              required
            />
            {errors.url ? (
              <span className={styles.errorMessage}>{errors.url}</span>
            ) : (
              <span className={styles.helpMessage}>Debe ser un enlace válido (ej: https://... o www...)</span>
            )}
            
            <div className="formActions">
              <button onClick={handleSave} className="saveButton">
                {editingId ? <FaPencilAlt /> : <FaPlus />} {editingId ? "Guardar" : "Añadir"}
              </button>
              <button onClick={closeModal} className="cancelButton">
                <FaTimes /> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesRecorded;