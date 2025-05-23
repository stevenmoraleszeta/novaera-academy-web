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
    const [modalContent, setModalContent] = useState("");

    useEffect(() => {
        setModalContent(modalType);
    }, [modalType]);

    const handleSave = async () => {

        const newResource = {
            classId: item.classId,
            contentResource: item.contentResource,
            typeResource: item.typeResource,
            orderResource: item.orderResource,
            startTime: item.startTime || null,
            endTime: item.endTime || null,
            width: item.width || null,
            height: item.height || null,
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
                        <div className={styles.btnsContainer}>
                            <button type="submit">Enviar</button>
                            <button type="button" onClick={onClose}>Cancelar</button>
                        </div>
                    </form>
                )}

                {modalContent === "alert" && (
                    <div className={styles.btnsContainer}>
                        {children}
                        <button onClick={onClose}>Cerrar</button>
                    </div>
                )}

                {modalContent === "confirmation" && (
                    <div className={styles.btnsContainer}>
                        <p>{description}</p>
                        <button onClick={onConfirm} className={styles.confirmButton}>Confirmar</button>
                        <button onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                    </div>
                )}

                {modalContent === "formModal" && (
                    <div className={styles.modalContent}>
                        <h2>{isEditMode ? "Editar Elemento" : "Agregar Nuevo Elemento"}</h2>
                        {editFields.map(({ label, field, type }) => (
                            <div key={field} className={styles.fieldRow}>
                                <label>{label}</label>
                                <input
                                    type={type}
                                    name={field}
                                    value={item[field] || ""}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        item[name] = value;
                                    }}
                                />
                            </div>
                        ))}
                        <div className={styles.modalButtons}>
                            <button onClick={() => onSave(item, isEditMode)}>Guardar</button>
                            <button onClick={onClose}>Cerrar</button>
                        </div>
                    </div>
                )}

                {modalContent === "addResources" && (
                    <div className={styles.btnsContainer}>
                        {children}
                        <button onClick={handleSave}>Guardar</button>
                        <button onClick={onClose}>Cancelar</button>
                    </div>
                )}

                {customContent && (
                    <div className={styles.customContent}>
                        {customContent}
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