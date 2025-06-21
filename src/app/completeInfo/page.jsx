"use client";

import { useEffect, useState } from "react";
import styles from "./completeInfo.module.css";
import Image from "next/image";
import countries from "../../jsonFiles/paises.json";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export default function CompleteInformation() {
    document.title = "Información Usuario - ZETA";

    const { currentUser, updateCurrentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [userInfo, setUserInfo] = useState({
        firstname: "",
        lastname1: "",
        lastname2: "",
        age: "",
        email: "",
        phone: "",
        country: "",
        photourl: "",
        roleId: "",
        updatedAt: "",
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = res.data;
                updateCurrentUser(data);
                setUserInfo({
                    firstname: data.firstname || "",
                    lastname1: data.lastname1 || "",
                    lastname2: data.lastname2 || "",
                    age: data.age || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    country: data.country || "",
                    photourl: data.photourl || "",
                    roleId: data.roleId || "",
                    updatedAt: new Date().toISOString(),
                });
            } catch (err) {
                console.error("Error al obtener perfil:", err);
            }
            setLoading(false);
        };
        fetchUserProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            let photourl = userInfo.photourl ?? "";

            const userId =
                currentUser?.userid ||
                userInfo?.userid ||
                currentUser?.id ||
                userInfo?.id;

            if (!userId) {
                throw new Error("No se encontró el ID del usuario.");
            }

            const updatedUser = {
                firstname: userInfo.firstname ?? "",
                lastname1: userInfo.lastname1 ?? "",
                lastname2: userInfo.lastname2 ?? "",
                age: userInfo.age && !isNaN(Number(userInfo.age)) && userInfo.age !== "" ? Number(userInfo.age) : null,
                email: userInfo.email ?? "",
                phone: userInfo.phone && !isNaN(Number(userInfo.phone)) && userInfo.phone !== "" ? Number(userInfo.phone) : null,
                country: userInfo.country ?? "",
                photourl: photourl ?? "",
                roleId: userInfo.roleId && !isNaN(Number(userInfo.roleId)) && userInfo.roleId !== "" ? Number(userInfo.roleId) : (currentUser?.roleid ?? 9),
                updatedAt: new Date().toISOString(),
            };


            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
                updatedUser,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            updateCurrentUser({ ...currentUser, photourl });
            router.push("/");
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                alert("Error al actualizar usuario: " + error.response.data.error);
            } else {
                alert("Error de red al actualizar usuario");
            }
            console.error("Error updating profile", error);
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <>
            <section className={styles.completeInfoMainSection}>
                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.instructionsContainer}>
                            <Image
                                alt="zetaLogo"
                                src={
                                    "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2FZetaLogoCpp.PNG?alt=media&token=6b854bc7-b25f-4b5c-b2ba-b0298372b67e"
                                }
                                width={1000}
                                height={1000}
                                className={styles.zetaImgLogo}
                            />
                            <p className={styles.instructions}>
                                Bienvenido {userInfo.firstname}, por favor rellena estos
                                campos antes de continuar para mejorar la experiencia de
                                usuario.
                            </p>
                        </div>
                        <div className={styles.firstFieldsContainer}>
                            <div className={styles.firstFieldsContainer}>
                                <p className={styles.formLabelTxt}>Nombre(s)</p>
                                <input
                                    type="text"
                                    name="firstname"
                                    value={userInfo.firstname}
                                    onChange={handleChange}
                                    required
                                />
                                <p className={styles.formLabelTxt}>Primer Apellido</p>
                                <input
                                    type="text"
                                    name="lastname1"
                                    value={userInfo.lastname1}
                                    onChange={handleChange}
                                    required
                                />
                                <p className={styles.formLabelTxt}>Segundo Apellido</p>
                                <input
                                    type="text"
                                    name="lastname2"
                                    value={userInfo.lastname2}
                                    onChange={handleChange}
                                />
                                <p className={styles.formLabelTxt}>Correo electrónico</p>
                                <input
                                    type="email"
                                    name="email"
                                    value={userInfo.email}
                                    onChange={handleChange}
                                    required
                                />
                                <p className={styles.formLabelTxt}>Número Telefónico</p>
                                <input
                                    type="number"
                                    name="phone"
                                    value={userInfo.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.secondFieldsContainer}>
                                <div className={styles.countryContainer}>
                                    <p className={styles.formLabelTxt}>País</p>
                                    <select
                                        name="country"
                                        id="countrySelector"
                                        onChange={handleChange}
                                        value={userInfo.country}
                                    >
                                        <option value="">Selecciona un país</option>
                                        {countries.map((country) => (
                                            <option key={country.es} value={country.es}>
                                                {country.es}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.ageContainer}>
                                    <p className={styles.formLabelTxt}>Edad</p>
                                    <input
                                        min={0}
                                        type="number"
                                        name="age"
                                        value={userInfo.age}
                                        required
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <button type="submit" className={styles.completeBtn}>
                                Completar
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
}