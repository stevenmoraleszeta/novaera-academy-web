// hooks/useAuth.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAuthenticate() {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { email, password }
      );

      if (res.status !== 200 || !res.data.token || !res.data.user) {
        throw new Error('Credenciales inválidas o respuesta incorrecta');
      }
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      let message = 'Error al iniciar sesión';
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message) {
        message = error.message;
      }
      return {
        success: false,
        message
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    setUser(null);
  };

  const isAuthenticated = !!authToken;

  return {
    user,
    authToken,
    login,
    logout,
    isAuthenticated,
    loading
  };
}
