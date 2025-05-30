import { useEffect, useState } from "react";
import axios from "axios";

const useFetchData = (endpoint) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
                const token = localStorage.getItem("token");
                const response = await axios.get(`${apiUrl}/${endpoint}`,
                    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                );
                setData(response.data); // Asume que la respuesta es el array de datos
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint]);

    return { data, loading, error };
};

export default useFetchData;