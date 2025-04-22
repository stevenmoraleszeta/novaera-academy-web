// hooks/useX.js (ejemplo: useCourses.js)
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useX = (endpoint = 'courses') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`);
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createData = async (payload) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, payload);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateData = async (id, payload) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}/${id}`, payload);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteData = async (id) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}/${id}`);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    createData,
    updateData,
    deleteData
  };
};
