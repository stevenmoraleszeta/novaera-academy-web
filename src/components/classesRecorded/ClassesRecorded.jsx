"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaPlus, FaPencilAlt, FaTimes, FaArrowUp, FaArrowDown } from "react-icons/fa";
import styles from "./ClassesRecorded.module.css";

// Asegúrate de que esta URL apunte a tu servidor de backend
const API_URL = process.env.NEXT_PUBLIC_API_URL; // "http://localhost:3001/api"; 

const ClassesRecorded = ({ courseId, isAdmin }) => {
  const [recordings, setRecordings] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingUrl, setEditingUrl] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);-

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

  const addRecording = async () => {
    if (newTitle && newUrl) {
      try {
        const response = await axios.post(`${API_URL}/recordings`, {
          title: newTitle,
          url: newUrl,
          orderrecording: recordings.length,
          courseid: courseId,
        });
        console.log("Respuesta del backend al insertar:", response.data); 
        setRecordings(prev => [...prev, response.data]);
        setNewTitle("");
        setNewUrl("");
        setShowAddForm(false); // Ocultar el formulario después de añadir
      } catch (error) {
        console.error("Error al agregar grabación:", error.response?.data || error.message);
      }
    }
  };

  const deleteRecording = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta grabación?")) {
      try {
        await axios.delete(`${API_URL}/recordings/${id}`);
        setRecordings(prev => prev.filter(rec => rec.recordingid !== id));
      } catch (error) {
        console.error("Error al eliminar grabación:", error.response?.data || error.message);
      }
    }
  };

  const updateRecording = async () => {
    if (editingId) {
      try {
        const response = await axios.put(`${API_URL}/recordings/${editingId}`, {
          title: editingTitle,
          url: editingUrl,
        });
        setRecordings(prev => prev.map(rec => (rec.recordingid === editingId ? response.data : rec)));
        setEditingId(null);
      } catch (error) {
        console.error("Error al actualizar grabación:", error.response?.data || error.message);
      }
    }
  };
  
  const moveRecording = (index, direction) => {
      const newRecordings = [...recordings];
      const [movedRecording] = newRecordings.splice(index, 1);
      newRecordings.splice(index + direction, 0, movedRecording);
      setRecordings(newRecordings);
  };

  return (
    <div className={styles.recordingsBlock}>
      <h3>Grabaciones de Clases</h3>

      {recordings.map((rec, index) => (
        editingId === rec.recordingid ? (

          <div key={rec.recordingid} className={styles.editRecording}>
            <input type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} placeholder="Editar título" className={styles.title} />
            <input type="url" value={editingUrl} onChange={(e) => setEditingUrl(e.target.value)} placeholder="Editar URL" className={styles.title} />
            <div className={styles.formActions}>
                <button onClick={updateRecording} className={styles.saveButton}><FaPencilAlt /> Guardar</button>
                <button onClick={() => setEditingId(null)} className={styles.cancelButton}><FaTimes /> Cancelar</button>
            </div>
          </div>
        ) : (

          <div key={rec.recordingid} className={styles.recordingItem}>
            <a href={rec.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                <span>{rec.title}</span>
            </a>
            
            {isAdmin && (
              <div className={styles.actions}>
                <button onClick={(e) => { e.stopPropagation(); moveRecording(index, -1); }} disabled={index === 0} className={styles.actionButton} title="Mover arriba"><FaArrowUp /></button>
                <button onClick={(e) => { e.stopPropagation(); moveRecording(index, 1); }} disabled={index === recordings.length - 1} className={styles.actionButton} title="Mover abajo"><FaArrowDown /></button>
                <button onClick={(e) => { e.stopPropagation(); setEditingId(rec.recordingid); setEditingTitle(rec.title); setEditingUrl(rec.url); }} className={styles.actionButton} title="Editar"><FaPencilAlt /></button>
                <button onClick={(e) => { e.stopPropagation(); deleteRecording(rec.recordingid); }} className={styles.actionButton} title="Eliminar"><FaTrash /></button>
              </div>
            )}
          </div>
        )
      ))}

      {isAdmin && (
        showAddForm ? (
          <div className={styles.addRecording}>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título de la grabación" className={styles.title}/>
            <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="URL de la grabación" className={styles.title} />
            <div className={styles.formActions}>
                <button onClick={addRecording} className={styles.saveButton}><FaPlus /> Añadir</button>
                <button onClick={() => setShowAddForm(false)} className={styles.cancelButton}><FaTimes /> Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddForm(true)} className={styles.addButton}>
            Añadir Grabación
          </button>
        )
      )}
    </div>
  );
};

export default ClassesRecorded;
