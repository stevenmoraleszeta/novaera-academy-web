import React, { useState } from "react";
import Image from "next/image";
import { FaTrash, FaCamera } from "react-icons/fa";
import styles from "./UserProfileForm.module.css";
import defaultAvatar  from "@/assets/img/defaultProfileImage.jpg";

import Link from "next/link";

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

    return (
        <section className={styles.userProfileContainer}>
            <form onSubmit={handleSubmit} className={styles.userProfileForm}>
                <div className={styles.photoUploader}>
                    <label htmlFor="photoUpload">
                        <Image
                            alt="profile's photo"
                            src={userInfo.photourl || defaultAvatar}
                            width={150}
                            height={150}
                            className={styles.userImg}
                            priority 
                        />
                        <div className={styles.photoOverlay}>
                            <FaCamera className={styles.photoIcon} />
                        </div>
                    </label>
                    <input
                        id="photoUpload"
                        type="file"
                        accept="image/png, image/jpeg, image/webp" 
                        className={styles.hiddenFileInput}
                        onChange={handleFileChange}
                    />
                </div>
                <div className={styles.userInformationContainer}>
                    <div className={styles.firstContainerInformation}>
                        <div className={styles.nameFieldsContainer}>
                            <input
                                type="text"
                                name="firstname"
                                value={userInfo.firstname || ''}
                                onChange={handleChange}
                                placeholder="Nombre"
                                className={styles.nameFieldInput}
                                required
                            />
                            <input
                                type="text"
                                name="lastname1"
                                value={userInfo.lastname1 || ''}
                                onChange={handleChange}
                                placeholder="Primer Apellido"
                                className={styles.nameFieldInput}
                                required
                            />
                            <input
                                type="text"
                                name="lastname2"
                                value={userInfo.lastname2 || ''}
                                onChange={handleChange}
                                placeholder="Segundo Apellido"
                                className={styles.nameFieldInput}
                            />
                        </div>
                        <p className={styles.inputLabels}>Número telefónico</p>
                        <input
                            type="text"
                            name="phone"
                            value={userInfo.phone}
                            onChange={handleChange}
                            required
                            className={styles.inputNumber}
                        />
                    </div>
                    <div className={styles.secondContainerInformation}>
                        <div className={styles.countryContainer}>
                            <p className={styles.inputLabels}>País</p>
                            <select
                                name="country"
                                id="countrySelect"
                                className={styles.countrySelect}
                                value={userInfo.country}
                                onChange={handleChange}
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
                                name="age"
                                value={userInfo.age}
                                required
                                onChange={handleChange}
                                className={styles.ageInput}
                            />
                        </div>
                    </div>
                    <div>
                        <Link href="/userProfile/changePass" className={styles.changePasswordLink}>
                            Cambiar Contraseña
                        </Link>
                    </div>
                    <div className={styles.actionsContainer}>
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
                </div>
            </form>
        </section>
    );
};

export default UserProfileForm;