"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RequireAuth from '@/features/RequireAuth';
import styles from './changePassword.module.css';
import { useModal } from '@/context/ModalContext'; 

function ChangePasswordPage() {
    const { currentUser } = useAuth();
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { showAlert } = useModal(); 
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showAlert('La nueva contraseña y su confirmación no coinciden.', 'Error de validación');
            return;
        }
        
        if (!newPassword || newPassword.length < 6) {
            showAlert('La nueva contraseña debe tener al menos 6 caracteres.', 'Contraseña débil');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, 
                {
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            showAlert('¡Contraseña actualizada con éxito!', 'Éxito');

            setTimeout(() => {
                router.push('/userProfile');
            }, 1000);

        } catch (err) {
           const errorMessage = err.response?.data?.message || 'Ocurrió un error al cambiar la contraseña.';
            showAlert(errorMessage, 'Error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RequireAuth>
            <section>
                <div className="auth-main-container">
                    <div className="auth-container">
                        <form onSubmit={handleSubmit} className={styles.authFormContainer}>
                            <h1>Cambiar Contraseña</h1>
                            
                            <div className={styles.authInputGroup}>
                                <label htmlFor="currentPassword">Contraseña actual</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.authInputGroup}>
                                <label htmlFor="newPassword">Nueva contraseña</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.authInputGroup}>
                                <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="formActions">
                                <button type="submit" className="saveButton" disabled={isLoading}>
                                    {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                                </button>
                                <button type="button" className="cancelButton" onClick={() => router.push('/userProfile')}>
                                    Regresar al perfil
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </section>
        </RequireAuth>
    );
}

export default ChangePasswordPage;
