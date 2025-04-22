import { useEffect, useState } from 'react';
import axios from 'axios';

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/students`);
      setStudents(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudieron obtener los estudiantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
  };
}
