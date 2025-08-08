// src/pages/RiskDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const DetailItem = ({ label, value }) => (
  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
  </div>
);

const RiskDetailPage = () => {
  const { riskId } = useParams();
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRiskDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/risks/${riskId}`);
        setRisk(response.data);
      } catch (err) {
        console.error("Failed to fetch risk details:", err);
        setError("Could not load risk details.");
      } finally {
        setLoading(false);
      }
    };
    fetchRiskDetails();
  }, [riskId]);

  if (loading) {
    return <p>Loading risk details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!risk) {
    return <p>No risk data found.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Assessment Details</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-xl leading-6 font-medium text-gray-900">
            Asset: {risk.asset_name}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Details for assessment ID: {risk.id}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <DetailItem label="Assessment Group" value={risk.group.name} />
            <DetailItem label="Risk Level" value={risk.risk_level} />
            <DetailItem label="Impact" value={risk.impact} />
            <DetailItem label="Likelihood" value={risk.likelihood} />
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Mitigation Plan</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                {risk.mitigation_plan || 'No mitigation plan provided.'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="mt-6">
        <Link to={`/edit-assessment/${risk.id}`} className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
          Edit this Assessment
        </Link>
      </div>
    </div>
  );
};

export default RiskDetailPage;
