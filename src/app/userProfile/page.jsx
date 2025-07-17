"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import RequireAuth from "@/features/RequireAuth";
import UserProfileForm from "@/components/userProfile/userProfile";
import countries from "@/jsonFiles/paises.json";
import { useAuth } from "@/context/AuthContext";
import { useImageUpload } from "@/hooks/useImageUpload";

function UserProfile() {
    const { currentUser, updateCurrentUser } = useAuth();
    const router = useRouter();
    const { uploadImage, uploading, error, clearError } = useImageUpload();

    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const apiUser = response.data;
                setUserInfo({
                    firstname: apiUser.firstname || '',
                    lastname1: apiUser.lastname1 || '',
                    lastname2: apiUser.lastname2 || '',
                    phone: apiUser.phone || '',
                    country: apiUser.country || '',
                    age: apiUser.age || '',
                    email: apiUser.email || '',
                    photourl: apiUser.photourl || '',
                    userid: apiUser.userid,
                    roleid: apiUser.roleid,
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user data", error);
                router.push("/login");
            }
        };

        if (currentUser) {
            fetchUserData();
        } else {
            router.push("/login");
        }
    }, [currentUser, router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        updateCurrentUser(null);
        router.push("/login");   //Siento que es mejor que lo mande al login a uno al cerrar la sesion!!!
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            clearError(); // Limpiar errores previos
            setImageFile(file);

            // Crear preview de la imagen
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        clearError(); // Limpiar errores previos
        setImageFile(null);
        setImagePreview(null);
        setUserInfo(prev => ({
            ...prev,
            photourl: ''
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            let photourl = userInfo.photourl ?? "";

            // Subir imagen a Firebase Storage si hay una nueva imagen
            if (imageFile) {
                const userId = currentUser?.userid || userInfo?.userid || currentUser?.id || userInfo?.id;
                if (!userId) {
                    throw new Error("No se encontró el ID del usuario.");
                }

                photourl = await uploadImage(imageFile, userId);
            }

            const userId =
                currentUser?.userid ||
                userInfo?.userid ||
                currentUser?.id ||
                userInfo?.id;

            if (!userId) {
                throw new Error("No se encontró el ID del usuario.");
            }

            // Helper function to safely convert to integer
            const safeParseInt = (value, defaultValue = null) => {
                if (value === "" || value === null || value === undefined) {
                    return defaultValue;
                }
                const parsed = parseInt(value, 10);
                return isNaN(parsed) ? defaultValue : parsed;
            };

            const updatedUser = {
                firstname: userInfo.firstname ?? "",
                lastname1: userInfo.lastname1 ?? "",
                lastname2: userInfo.lastname2 ?? "",
                age: safeParseInt(userInfo.age),
                email: userInfo.email ?? "",
                phone: safeParseInt(userInfo.phone),
                country: userInfo.country ?? "",
                photourl: photourl ?? "",
                roleid: safeParseInt(userInfo.roleid, currentUser?.roleid ?? 2),
                updatedAt: new Date().toISOString(),
            };

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
                updatedUser,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Actualizar el usuario actual con los datos del servidor
            const userFromServer = response.data;
            updateCurrentUser(userFromServer);

            // Limpiar estados de imagen
            setImageFile(null);
            setImagePreview(null);

            alert("Perfil actualizado exitosamente");
            router.push("/cursos-en-linea");
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                alert("Error al actualizar usuario: " + error.response.data.error);
            } else {
                alert("Error al actualizar usuario: " + error.message);
            }
            console.error("Error updating profile", error);
        }
    };

    // Permitir edición: solo renderizar el formulario si userInfo está definido
    // if (!currentUser) {
    //     router.push("/login");
    //     return null;
    // }

    return (
        <RequireAuth>
            <UserProfileForm
                currentUser={currentUser}
                userInfo={userInfo}
                countries={countries}
                handleChange={handleChange}
                handleFileChange={handleFileChange}
                handleRemovePhoto={handleRemovePhoto}
                handleSubmit={handleSubmit}
                handleLogout={handleLogout}
                loading={loading}
                uploading={uploading}
                imagePreview={imagePreview}
                uploadError={error}
            />
        </RequireAuth>
    );
}

export default UserProfile;