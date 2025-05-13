"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import RequireAuth from "@/features/RequireAuth";
import UserProfileForm from "@/components/userProfile/userProfile";
import countries from "@/jsonFiles/paises.json";
import { useAuth } from "@/context/AuthContext";

function UserProfile() {
    const { currentUser, updateCurrentUser } = useAuth();
    const router = useRouter();

    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("/api/users/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserInfo(response.data);
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
        router.push("/");
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            let photoUrl = userInfo.photoUrl;

            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);

                const uploadResponse = await axios.post("/api/upload", formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                photoUrl = uploadResponse.data.url;
            }

            const updatedUser = {
                ...userInfo,
                photoUrl,
            };

            await axios.put(`/api/users/${currentUser.id}`, updatedUser, {
                headers: { Authorization: `Bearer ${token}` },
            });

            updateCurrentUser({ ...currentUser, photoUrl });
            router.push("/cursos-en-linea");
        } catch (error) {
            console.error("Error updating profile", error);
        }
    };

    if (!currentUser) {
        router.push("/login");
        return null;
    }

    return (
        <RequireAuth>
            <UserProfileForm
                currentUser={currentUser}
                userInfo={userInfo}
                countries={countries}
                handleFileChange={handleFileChange}
                handleSubmit={handleSubmit}
                handleLogout={handleLogout}
                loading={loading}
            />
        </RequireAuth>
    );
}

export default UserProfile;