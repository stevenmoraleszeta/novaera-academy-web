import { useEffect, useState, useCallback } from "react"; //se agrega el useCallback
import axios from "axios";

const useFetchData = (endpoint) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {  //atrapa el error si no hay endpoint
        if (!endpoint) {
            setData([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
            const token = localStorage.getItem("token");
            const response = await axios.get(`${apiUrl}/${endpoint}`,
                token ? { headers: { Authorization: `Bearer ${token}` } } : {}
            );
            setData(response.data);
            setError(null);
        } catch (err) {
            setError(err);
            setData([]); 
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

export default useFetchData;