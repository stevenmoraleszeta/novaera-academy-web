// En: app/perfil/cambiar-contrasena/page.jsx

"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RequireAuth from '@/features/RequireAuth';
import styles from './changePassword.module.css'; 

function ChangePasswordPage() {
    const { currentUser } = useAuth();
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setError('La nueva contraseña y su confirmación no coinciden.');
            return;
        }
        
        if (!newPassword || newPassword.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/users/change-password`, 
                {
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setSuccessMessage('¡Contraseña actualizada con éxito!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                router.push('/userProfile');
            }, 1000);

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ocurrió un error al cambiar la contraseña.';
            setError(errorMessage);
            console.error("Error changing password:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RequireAuth>
            <div className={styles.container}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2>Cambiar Contraseña</h2>
                    
                    <div className={styles.inputGroup}>
                        <label htmlFor="currentPassword">Contraseña actual</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="newPassword">Nueva contraseña</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}
                    {successMessage && <p className={styles.success}>{successMessage}</p>}
                    
                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                    </button>
                    <button type="button" className={styles.backButton} onClick={() => router.push('/userProfile')}>
                        Regresar al perfil
                    </button>
                </form>
            </div>
        </RequireAuth>
    );
}

export default ChangePasswordPage;
