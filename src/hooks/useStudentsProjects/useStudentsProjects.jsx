import { useState, useEffect } from 'react';
import axios from 'axios';

export const useStudentProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentProjects = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/student-projects`);
      setProjects(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createStudentProject = async (payload) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/student-projects`, payload);
      await fetchStudentProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStudentProject = async (id, payload) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/student-projects/${id}`, payload);
      await fetchStudentProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteStudentProject = async (id) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/student-projects/${id}`);
      await fetchStudentProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const searchByStudentName = async (name) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/student-projects/search?studentName=${name}`);
      setProjects(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const filterByStatus = async (status) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/student-projects/status/${status}`);
      setProjects(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchStudentProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    fetchStudentProjects,
    createStudentProject,
    updateStudentProject,
    deleteStudentProject,
    searchByStudentName,
    filterByStatus
  };
};
