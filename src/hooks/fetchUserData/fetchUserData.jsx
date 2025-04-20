import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";

const useFetchUserData = (db, currentUser) => {
    const [userInfo, setUserInfo] = useState({
        displayName: "",
        email: "",
        photoURL: "",
        number: "",
        edad: "",
        pais: "",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        setUserInfo({
                            displayName: currentUser.displayName || "",
                            email: currentUser.email || "",
                            photoURL: currentUser.photoURL || "",
                            number: userDocSnap.data().number || "",
                            edad: userDocSnap.data().edad || "",
                            pais: userDocSnap.data().pais || "",
                        });
                    } else {
                        console.log("No se encontró el documento del usuario en Firestore");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserData();
    }, [db, currentUser]);

    return { userInfo, loading };
};

export default useFetchUserData;