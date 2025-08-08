// src/pages/GroupDashboardPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center">
    <h3 className="text-gray-500 text-sm font-medium uppercase">{title}</h3>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

const GroupDashboardPage = () => {
  const { groupId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [risks, setRisks] = useState([]);
  const [summary, setSummary] = useState({ total_risks: 0, high_risks: 0 });
  const [levelStats, setLevelStats] = useState(null);
  const [impactStats, setImpactStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const [detailsRes, risksRes, summaryRes, levelStatsRes, impactStatsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/risk_groups/${groupId}`),
        axios.get(`http://localhost:5000/api/risk_groups/${groupId}/risks`),
        axios.get(`http://localhost:5000/api/risk_groups/${groupId}/summary`),
        axios.get(`http://localhost:5000/api/risk_groups/${groupId}/stats`),
        axios.get(`http://localhost:5000/api/risk_groups/${groupId}/stats_by_impact`)
      ]);
      setGroupName(detailsRes.data.name);
      setRisks(risksRes.data);
      setSummary(summaryRes.data);
      setLevelStats(levelStatsRes.data);
      setImpactStats(impactStatsRes.data);
    } catch (error) {
      console.error("Failed to fetch group dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Hanya ambil data jika proses loading autentikasi sudah selesai
    if (!authLoading) {
      fetchGroupData();
    }
  }, [groupId, authLoading]);

  const handleDelete = async (riskId) => {
    if (window.confirm("Are you sure you want to delete this risk?")) {
      try {
        await axios.delete(`http://localhost:5000/api/risks/${riskId}`);
        fetchGroupData(); // Ambil ulang semua data untuk grup ini
      } catch (error) {
        console.error("Failed to delete risk:", error);
      }
    }
  };

  if (loading || authLoading) {
    return <p>Loading group dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard for: <span className="text-indigo-600">{groupName}</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total Risks in Group" value={summary.total_risks} />
        <StatCard title="High Risks in Group" value={summary.high_risks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="relative h-[40vh]">
            {levelStats ? <BarChart chartData={levelStats} titleText="Risiko Berdasarkan Level" /> : <p>Loading chart...</p>}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="relative h-[40vh]">
            {impactStats ? <PieChart chartData={impactStats} titleText="Risiko Berdasarkan Dampak" /> : <p>Loading chart...</p>}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Assessments in this Group</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {risks.map((risk) => (
              <tr key={risk.id}>
                <td className="px-6 py-4 whitespace-nowrap">{risk.asset_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{risk.risk_level}</td>
                <td className="px-6 py-4 whitespace-nowrap">{risk.impact}</td>
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

export default GroupDashboardPage;
