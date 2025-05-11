"use client";

import React, { useState } from "react";
import { getAuth, updateProfile, updateEmail, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, setDoc } from "firebase/firestore";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RequireAuth from "@/features/RequireAuth";
import UserProfileForm from "@/components/userProfile/userProfile";
import countries from "@/jsonFiles/paises.json";
import useFetchUserData from "@/hooks/fetchUserData/fetchUserData";
import { useAuthenticate } from "@/hooks/useAuth/useAuth";

function UserProfile() {
    const { currentUser, updateCurrentUser } = useAuth();
    const auth = getAuth();
    const { logout } = useAuthenticate();
    const storage = getStorage();
    const db = getFirestore();
    const router = useRouter();

    const { userInfo, loading } = useFetchUserData(db, currentUser);
    const [imageFile, setImageFile] = useState(null);

    const handleLogout = async () => {
        try {
            logout();
            router.push("/");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let photoURL = userInfo.photoURL;

            if (imageFile) {
                const storageRef = ref(
                    storage,
                    `profileImages/${currentUser.uid}/${imageFile.name}`
                );
                await uploadBytes(storageRef, imageFile);
                photoURL = await getDownloadURL(storageRef);
            }

            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: userInfo.displayName,
                    photoURL: photoURL,
                });

                if (userInfo.email !== auth.currentUser.email) {
                    await updateEmail(auth.currentUser, userInfo.email);
                }
                const userDocRef = doc(db, "users", currentUser.uid);
                await setDoc(
                    userDocRef,
                    {
                        number: userInfo.number,
                        edad: userInfo.edad,
                        pais: userInfo.pais,
                    },
                    { merge: true }
                );

                updateCurrentUser({ ...auth.currentUser, photoURL });
                router.push("/cursos-en-linea");
            }
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