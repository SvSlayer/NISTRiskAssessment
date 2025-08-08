// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import { useAuth } from '../context/AuthContext';

// Komponen kecil untuk kartu statistik
const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center">
    <h3 className="text-gray-500 text-sm font-medium uppercase">{title}</h3>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

const DashboardPage = () => {
  // Mengambil state dan fungsi dari komponen Layout dan AuthContext
  const { risks, fetchRisks } = useOutletContext();
  const { user, loading: authLoading } = useAuth(); // Ambil loading langsung dari AuthContext

  // State khusus untuk data di halaman dasbor ini
  const [summary, setSummary] = useState({ total_risks: 0, high_risks: 0 });
  const [levelStats, setLevelStats] = useState(null);
  const [impactStats, setImpactStats] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Ambil semua data statistik secara bersamaan untuk efisiensi
        const [summaryRes, levelStatsRes, impactStatsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/risks/summary'),
          axios.get('http://localhost:5000/api/risks/stats'),
          axios.get('http://localhost:5000/api/risks/stats_by_impact')
        ]);
        setSummary(summaryRes.data);
        setLevelStats(levelStatsRes.data);
        setImpactStats(impactStatsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    
    // Perbaikan Kunci: Hanya ambil data jika proses loading autentikasi sudah selesai DAN user sudah login
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [risks, authLoading, user]); // Jalankan kembali jika daftar risiko utama, status auth, atau user berubah

  const handleDelete = async (riskId) => {
    if (window.confirm("Are you sure you want to delete this risk?")) {
      try {
        await axios.delete(`http://localhost:5000/api/risks/${riskId}`);
        fetchRisks(); // Panggil fetchRisks dari Layout untuk me-refresh data global
      } catch (error) {
        console.error("Failed to delete risk:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Global Risk Dashboard</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <StatCard title="Total Risks" value={summary.total_risks} />
          <StatCard title="High Risks" value={summary.high_risks} />
        </div>
        <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="relative h-[35vh]">
              {levelStats ? <BarChart chartData={levelStats} titleText="Risiko Berdasarkan Level" /> : <p>Loading chart...</p>}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="relative h-[35vh]">
              {impactStats ? <PieChart chartData={impactStats} titleText="Risiko Berdasarkan Dampak" /> : <p>Loading chart...</p>}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">All Assessments</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {risks.map((risk) => (
              <tr key={risk.id}>
                <td className="px-6 py-4 whitespace-nowrap">{risk.asset_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{risk.group.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{risk.risk_level}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link to={`/risks/${risk.id}`} className="text-green-600 hover:text-green-900 mr-4">View</Link>
                  {(user && (user.id === risk.user_id || user.role === 'admin')) && (
                    <>
                      <Link to={`/edit-assessment/${risk.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                      <button onClick={() => handleDelete(risk.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
