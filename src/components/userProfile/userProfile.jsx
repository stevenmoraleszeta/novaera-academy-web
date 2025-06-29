import React, { useState } from "react";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import styles from "./UserProfileForm.module.css";

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
                <div className={styles.imgContainer}>
                    {userInfo.photourl && (
                        <Image
                            alt="photourl"
                            src={userInfo.photourl}
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
                            name="firstname"
                            value={userInfo.firstname}
                            onChange={handleChange}
                            required
                            className={styles.nameInput}
                        />
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