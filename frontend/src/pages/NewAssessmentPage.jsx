// src/pages/NewAssessmentPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';

const NewAssessmentPage = () => {
  const navigate = useNavigate();
  const { fetchRisks } = useOutletContext();
  
  // State untuk form fields
  const [assetName, setAssetName] = useState('');
  const [riskLevel, setRiskLevel] = useState('Low');
  const [impact, setImpact] = useState('Low');
  const [likelihood, setLikelihood] = useState('Low');
  const [mitigationPlan, setMitigationPlan] = useState('');
  const [groupId, setGroupId] = useState('');
  
  // State untuk data & error
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');

  // Ambil daftar grup saat komponen dimuat
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/risk_groups');
        setGroups(response.data);
        // Set grup pertama sebagai default jika ada
        if (response.data.length > 0) {
          setGroupId(response.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch groups", err);
        setError("Could not load assessment groups.");
      }
    };
    fetchGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupId) {
        setError('Please select an assessment group.');
        return;
    }
    setError('');

    const newRisk = {
      asset_name: assetName,
      risk_level: riskLevel,
      impact: impact,
      likelihood: likelihood,
      mitigation_plan: mitigationPlan,
      group_id: parseInt(groupId), // Pastikan ID adalah integer
    };

    try {
      await axios.post('http://localhost:5000/api/risks', newRisk);
      await fetchRisks();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to submit new risk assessment.');
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Risk Assessment</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="mb-4">
          <label htmlFor="group" className="block text-gray-700 font-medium mb-2">Assessment Group</label>
          <select id="group" value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
            <option value="" disabled>Select a group</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="assetName" className="block text-gray-700 font-medium mb-2">Asset Name</label>
          <input type="text" id="assetName" value={assetName} onChange={(e) => setAssetName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="riskLevel" className="block text-gray-700 font-medium mb-2">Risk Level</label>
            <select id="riskLevel" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div>
            <label htmlFor="impact" className="block text-gray-700 font-medium mb-2">Impact</label>
            <select id="impact" value={impact} onChange={(e) => setImpact(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div>
            <label htmlFor="likelihood" className="block text-gray-700 font-medium mb-2">Likelihood</label>
            <select id="likelihood" value={likelihood} onChange={(e) => setLikelihood(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="mitigationPlan" className="block text-gray-700 font-medium mb-2">Mitigation Plan</label>
          <textarea
            id="mitigationPlan"
            value={mitigationPlan}
            onChange={(e) => setMitigationPlan(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Describe the steps to mitigate this risk..."
          ></textarea>
        </div>

        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors">
          Save Assessment
        </button>
      </form>
    </div>
  );
};

export default NewAssessmentPage;
