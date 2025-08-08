// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const token = localStorage.getItem('luka_token');
        const storedUser = localStorage.getItem('luka_user');
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Failed to load user from storage", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserFromStorage();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      if (response.data.access_token) {
        const { access_token, user: userData } = response.data;
        localStorage.setItem('luka_token', access_token);
        localStorage.setItem('luka_user', JSON.stringify(userData));
        setAuthToken(access_token);
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      logout();
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('luka_token');
    localStorage.removeItem('luka_user');
    setAuthToken(null);
  };

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
