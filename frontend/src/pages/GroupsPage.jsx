// src/pages/GroupsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Impor useNavigate
import axios from 'axios';

const GroupsPage = () => {
  const navigate = useNavigate(); // Inisialisasi hook navigasi
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/risk_groups');
      setGroups(response.data);
    } catch (err) {
      console.error("Failed to fetch groups", err);
      setError("Could not load assessment groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setError('Group name cannot be empty.');
      return;
    }
    setError('');

    try {
      await axios.post('http://localhost:5000/api/risk_groups', { name: newGroupName });
      setNewGroupName('');
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create new group.');
      console.error(err);
    }
  };

  // Fungsi untuk menangani klik tombol view
  const handleViewGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Assessment Groups</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter new group name"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
            Create Group
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Groups</h2>
        {loading ? (
          <p>Loading groups...</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {groups.map(group => (
              <li key={group.id} className="py-3 flex justify-between items-center">
                <span className="font-medium">{group.name}</span>
                <button 
                  onClick={() => handleViewGroup(group.id)}
                  className="bg-indigo-500 text-white text-sm py-1 px-3 rounded-md hover:bg-indigo-600 transition-colors"
                >
                  View Dashboard
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;
