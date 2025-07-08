"use client";

import styles from "./modal.module.css";
import { useEffect, useState } from "react";

export function Modal({
    modalType = "alert",
    title = "",
    description = "",
    children,
    onClose,
    onSubmit,
    isOpen = false,
    resources,
    setResources,
    customContent, // Nuevo prop para contenido personalizado
    onConfirm, // Para ConfirmationModal
    item, // Para ModalForm
    editFields, // Para ModalForm
    isEditMode, // Para ModalForm
    onSave // Para ModalForm
}) {

    const [editedItem, setEditedItem] = useState(item);
    
    const [typeResource, setTypeResource] = useState("text");
    const [contentResource, setContentResource] = useState("");
    const [titleResource, setTitleResource] = useState("");
    const [width, setWidth] = useState(null);
    const [height, setHeight] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [modalContent, setModalContent] = useState("");

    useEffect(() => {
        setEditedItem(item);
    }, [item]);

    useEffect(() => {
        setModalContent(modalType);
    }, [modalType]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditedItem(prev => ({
            ...prev, 
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = async () => {

        const newResource = {
            type: typeResource,
            content: contentResource,
            title: titleResource,
            width: width || null,
            height: height || null,
            start: startTime || null,
            end: endTime || null,
            classId: item.classId,
            moduleId: item.moduleId,
            courseId: item.courseId,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/class-resources`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newResource),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al guardar el recurso");
            }

            const savedResource = await response.json();
            setResources([...resources, savedResource.resource]);
            onClose();
        } catch (error) {
            console.error("Error al guardar el recurso:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalContainer}>
            <div className={styles.modalContentContainer}>
                {title && <h2 className={styles.title}>{title}</h2>}
                {description && <p className={styles.description}>{description}</p>}

                {modalContent === "form" && (
                    <form className={styles.modalForm} onSubmit={onSubmit}>
                        {children}
                        <div className="formActions">
                            <button className="saveButton" type="submit">Enviar</button>
                            <button className="cancelButton" type="button" onClick={onClose}>Cancelar</button>
                        </div>
                    </form>
                )}

                {modalContent === "alert" && (
                    <div className="formActions">
                        {children}
                        <button className="cancelButton" onClick={onClose}>Cerrar</button>
                    </div>
                )}

                {modalContent === "confirmation" && (
                    <div className="formActions">
                        <p>{description}</p>
                        <button onClick={onConfirm} className="saveButton">Confirmar</button>
                        <button onClick={onClose} className="cancelButton">Cancelar</button>
                    </div>
                )}

                {/* --- formModal --- */}
                {modalContent === "formModal" && (
                    <div className={styles.modalContent}>
                        <h2>{isEditMode ? "Editar Elemento" : "Agregar Nuevo Elemento"}</h2>
                        {editFields.map(({ label, field, type, render, options, required }) => {
                            if (render) {
                                return (
                                    <div key={label} className={`${styles.fieldRow} form-field-item`}>
                                        <label>{label}</label>
                                        <div className={styles.readOnlyField}>{render(editedItem)}</div>
                                    </div>
                                )
                            }
                            if (type === 'select') {
                                return (
                                    <div key={field} className={`${styles.fieldRow} form-field-item`}>
                                        <label>{label}</label>
                                        <select
                                            name={field}
                                            value={editedItem?.[field]?.toString() || ""}
                                            onChange={handleChange}
                                            required={required}
                                        >
                                            <option value="">-- Selecciona una opción --</option>
                                            {(options || []).map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            }
                            return (
                                <div key={field} className={`${styles.fieldRow} form-field-item`}>
                                    <label>{label}</label>
                                    <input
                                        type={type || 'text'}
                                        name={field}
                                        value={editedItem?.[field] || ""}
                                        onChange={handleChange}
                                        required={required}
                                    />
                                </div>
                            );
                        })}
                        <div className="formActions">
                                <button className="saveButton" onClick={() => onSave(editedItem, isEditMode)}>Guardar</button>
                                <button className="cancelButton" onClick={onClose}>Cancelar</button>
                        </div>
                    </div>
                )}

                {modalContent === "addResources" && (
                    <div className={styles.modalForm}>
                        <div className={styles.fieldRow}>
                            <label>Tipo de recurso</label>
                            <select value={typeResource} onChange={(e) => setTypeResource(e.target.value)}>
                                <option value="text">Texto</option>
                                <option value="imageUrl">Imagen</option>
                                <option value="videoUrl">Video</option>
                                <option value="pdfUrl">PDF</option>
                                <option value="title">Título</option>
                            </select>
                        </div>

                        <div className={styles.fieldRow}>
                            <label>Contenido</label>
                            <input type="text" value={contentResource} onChange={(e) => setContentResource(e.target.value)} />
                        </div>

                        {typeResource === "title" && (
                            <div className={styles.fieldRow}>
                                <label>Título</label>
                                <input type="text" value={titleResource} onChange={(e) => setTitleResource(e.target.value)} />
                            </div>
                        )}

                        {typeResource === "imageUrl" && (
                            <>
                                <div className={styles.fieldRow}>
                                    <label>Ancho</label>
                                    <input type="number" value={width || ""} onChange={(e) => setWidth(parseInt(e.target.value))} />
                                </div>
                                <div className={styles.fieldRow}>
                                    <label>Alto</label>
                                    <input type="number" value={height || ""} onChange={(e) => setHeight(parseInt(e.target.value))} />
                                </div>
                            </>
                        )}

                        {typeResource === "videoUrl" && (
                            <>
                                <div className={styles.fieldRow}>
                                    <label>Inicio (segundos)</label>
                                    <input type="number" value={startTime || ""} onChange={(e) => setStartTime(parseInt(e.target.value))} />
                                </div>
                                <div className={styles.fieldRow}>
                                    <label>Fin (segundos)</label>
                                    <input type="number" value={endTime || ""} onChange={(e) => setEndTime(parseInt(e.target.value))} />
                                </div>
                            </>
                        )}
                        <div className="formActions">
                            <button className="saveButton" onClick={handleSave}>Guardar</button>
                            <button className="cancelButton" onClick={onClose}>Cancelar</button>
                        </div>
                    </div>
                )}

                {modalContent === "customContent" && (
                    <div className={styles.customContent}>
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}

/* Uso */

/* 

ConfirmationModal

<Modal
    modalType="confirmation"
    isOpen={isConfirmationOpen}
    onClose={handleCloseConfirmation}
    onConfirm={handleConfirmAction}
    description="¿Estás seguro de que deseas realizar esta acción?"
/>

ModalForm

<Modal
    modalType="formModal"
    isOpen={isFormOpen}
    onClose={handleCloseForm}
    onSave={handleSaveItem}
    item={currentItem}
    editFields={[
        { label: "Nombre", field: "name", type: "text" },
        { label: "Descripción", field: "description", type: "text" }
    ]}
    isEditMode={isEditMode}
/>

*/