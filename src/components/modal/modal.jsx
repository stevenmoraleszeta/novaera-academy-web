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
    setResources
}) {
    const [modalContent, setModalContent] = useState("");

    useEffect(() => {
        switch (modalType) {
            case "alert":
                setModalContent("alert");
                break;
            case "form":
                setModalContent("form");
                break;
            case "message":
                setModalContent("message");
                break;
            case "notification":
                setModalContent("notification");
                break;
            case "addResources":
                setModalContent("addResources");
                break;
            default:
                setModalContent("");
                break;
        }
    }, [modalType]);

    const handleSave = () => {
        // Logic to save resource
        setIsModalOpen(false);
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

                {modalContent === "message" && (
                    <div className={styles.btnsContainer}>
                        {children}
                        <button onClick={onClose}>Cerrar</button>
                    </div>
                )}

                {modalContent === "notification" && (
                    <div className={styles.btnsContainer}>
                        {children}
                        <button onClick={onClose}>Entendido</button>
                    </div>
                )}
                {modalContent === "addResources" && (
                    <div className={styles.btnsContainer}>
                        {children}
                        <button onClick={handleSave}>Guardar</button>
                        <button onClick={onClose}>Cancelar</button>
                    </div>
                )}
            </div>
        </div>
    );
}