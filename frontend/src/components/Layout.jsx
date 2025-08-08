// src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user } = useAuth();
  const [risks, setRisks] = useState([]);

  const fetchRisks = async () => {
    if (!user) return; 
    try {
      const response = await axios.get('http://localhost:5000/api/risks');
      setRisks(response.data);
    } catch (error) {
      console.error("Failed to fetch risks:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRisks();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto p-4">
        <Outlet context={{ risks, fetchRisks }} />
      </main>
    </div>
  );
};

export default Layout;
