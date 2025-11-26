import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const BASE_URL = "https://greenspace-iynp.onrender.com/api";

  const [stats, setStats] = useState(null);
  const [plots, setPlots] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const response = await adminAPI.getStats();
        setStats(response.data.stats);
      } else if (activeTab === 'plots') {
        // Only fetch pending plots for verification
        const response = await adminAPI.getPlots({ verificationStatus: 'pending' });
        setPlots(response.data.plots);
      } else if (activeTab === 'users') {
        const response = await adminAPI.getUsers();
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPlot = async (plotId, status, reason = '') => {
    try {
      await adminAPI.verifyPlot(plotId, { verificationStatus: status, rejectionReason: reason });
      fetchData();
    } catch (error) {
      console.error('Failed to verify plot:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['stats', 'plots', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md font-medium border transition ${activeTab === tab
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              {tab === 'stats' ? 'Statistics' : tab === 'users' ? 'Users' : 'Verify Plots'}
            </button>
          ))}
        </div>

        {/* Stats Section */}
        {activeTab === 'stats' && stats && (
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Users', data: stats.users },
              { title: 'Plots', data: stats.plots },
              { title: 'Bookings', data: stats.bookings },
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-lg shadow-sm p-6 bg-white border-l-4 border-gray-800"
              >
                <h3 className="text-lg font-semibold mb-4">{item.title}</h3>
                <div className="space-y-2 text-gray-700">
                  {Object.entries(item.data).map(([key, value]) => (
                    <p key={key} className="flex justify-between capitalize">
                      <span>{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-semibold">{value}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Plots Verification Section */}
        {activeTab === 'plots' && (
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            {plots.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No pending plot verifications</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-200">
                  <tr>
                    {['Title', 'Owner', 'Location', 'Size','Description', 'Documents', 'Actions'].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {plots.map((plot) => (
                    <tr key={plot._id}>
                      <td className="px-6 py-4">{plot.title}</td>
                      <td className="px-6 py-4">{plot.owner?.name}</td>
                      <td className="px-6 py-4">{plot.location.city}, {plot.location.state}</td>
                      <td className="px-6 py-4">{plot.size.value} {plot.size.unit}</td>
                      <td className="px-6 py-4">{plot.description || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {plot.documents?.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1 max-h-24 overflow-y-auto">
                            {plot.documents.map((doc, idx) => (
                              <li key={idx}>
                                <a
                                  href={BASE_URL + doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {doc.name || `Document ${idx + 1}`}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          'No documents'
                        )}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleVerifyPlot(plot._id, 'approved')}
                          className="px-3 py-1 rounded text-sm bg-gray-800 text-white hover:bg-gray-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Reason for rejection:');
                            if (reason) handleVerifyPlot(plot._id, 'rejected', reason);
                          }}
                          className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-500 transition"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Users Section */}
        {/* Users Section */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto p-6">
            {users.length === 0 ? (
              <div className="text-center text-gray-500">No users found</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-200">
                  <tr>
                    {['User ID', 'Name', 'Email', 'Role', 'Phone', 'Address', 'Created At'].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 text-xs text-gray-500">{user._id}</td>
                      <td className="px-6 py-4">{user.name || 'N/A'}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4 capitalize">{user.role}</td>
                      <td className="px-6 py-4">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4">{user.address || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
