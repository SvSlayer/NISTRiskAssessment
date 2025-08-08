// src/pages/EditAssessmentPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import axios from 'axios';

const EditAssessmentPage = () => {
  const navigate = useNavigate();
  const { riskId } = useParams();
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Ambil data grup dan data risk secara bersamaan
        const [groupsRes, riskRes] = await Promise.all([
          axios.get('http://localhost:5000/api/risk_groups'),
          axios.get(`http://localhost:5000/api/risks/${riskId}`)
        ]);

        setGroups(groupsRes.data);
        
        const risk = riskRes.data;
        setAssetName(risk.asset_name);
        setRiskLevel(risk.risk_level);
        setImpact(risk.impact);
        setLikelihood(risk.likelihood);
        setMitigationPlan(risk.mitigation_plan || '');
        setGroupId(risk.group.id);

      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError("Could not load data for editing.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [riskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const updatedRisk = {
      asset_name: assetName,
      risk_level: riskLevel,
      impact: impact,
      likelihood: likelihood,
      mitigation_plan: mitigationPlan,
      group_id: parseInt(groupId),
    };

    try {
      await axios.put(`http://localhost:5000/api/risks/${riskId}`, updatedRisk);
      await fetchRisks();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to update risk assessment.');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading assessment data...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Risk Assessment</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="mb-4">
          <label htmlFor="group" className="block text-gray-700 font-medium mb-2">Assessment Group</label>
          <select id="group" value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
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

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
          Update Assessment
        </button>
      </form>
    </div>
  );
};

export default EditAssessmentPage;
