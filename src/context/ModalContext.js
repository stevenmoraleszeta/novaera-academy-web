"use client";

import React, { createContext, useState, useContext } from 'react';
import GenericModal from '../components/modal/GenericModal'; // Lo crearemos en el paso 2

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'alert', 
    });

    const showAlert = (message, title = 'Aviso') => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            type: 'alert',
            onConfirm: null,
        });
    };

    const showConfirm = (message, onConfirm, title = 'Confirmación') => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            type: 'confirm',
            onConfirm: () => {
                onConfirm(); 
                closeModal(); 
            },
        });
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, title: '', message: '', onConfirm: null, type: 'alert' });
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <GenericModal {...modalConfig} onClose={closeModal} />
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);