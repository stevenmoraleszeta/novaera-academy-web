import React, { useState } from "react";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import styles from "./UserProfileForm.module.css";

const UserProfileForm = ({
    currentUser,
    userInfo,
    countries,
    handleChange,
    handleFileChange,
    handleSubmit,
    handleLogout,
    loading,
}) => {
    if (!currentUser) return null;

    if (loading) {
        return <div>Cargando...</div>;
    }

    // Si no se pasa handleChange, los campos serán solo lectura
    const safeHandleChange = handleChange || (() => {});

    return (
        <section className={styles.userProfileContainer}>
            <form onSubmit={handleSubmit} className={styles.userProfileForm}>
                <div className={styles.imgContainer}>
                    {userInfo.photoUrl && (
                        <Image
                            alt="userProfileImage"
                            src={userInfo.photoUrl}
                            width={500}
                            height={500}
                            className={styles.userImg}
                        />
                    )}
                    <input type="file" onChange={handleFileChange} />
                </div>
                <div className={styles.userInformationContainer}>
                    <div className={styles.firstContainerInformation}>
                        <input
                            type="text"
                            name="displayName"
                            value={userInfo.displayName || ''}
                            onChange={safeHandleChange}
                            required
                            className={styles.nameInput}
                        />
                        <p className={styles.inputLabels}>Número telefónico</p>
                        <input
                            type="text"
                            name="number"
                            value={userInfo.number || ''}
                            onChange={safeHandleChange}
                            required
                            className={styles.inputNumber}
                        />
                    </div>
                    <div className={styles.secondContainerInformation}>
                        <div className={styles.countryContainer}>
                            <p className={styles.inputLabels}>País</p>
                            <select
                                name="pais"
                                id="countrySelect"
                                className={styles.countrySelect}
                                value={userInfo.pais || ''}
                                onChange={safeHandleChange}
                            >
                                {countries.map((country, idx) => (
                                    <option key={country.es + idx} value={country.es}>
                                        {country.es}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.ageContainer}>
                            <p className={styles.inputLabels}>Edad</p>
                            <input
                                min={0}
                                type="number"
                                name="edad"
                                value={userInfo.edad || ''}
                                required
                                onChange={safeHandleChange}
                                className={styles.ageInput}
                            />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        Guardar Cambios
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className={styles.logoutButton}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </form>
        </section>
    );
};

export default UserProfileForm;