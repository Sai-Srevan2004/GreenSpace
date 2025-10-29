


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { plotAPI } from '../services/api';

const PlotsList = () => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    soilType: '',
    waterAvailability: ''
  });

  useEffect(() => {
    fetchPlots();
    // eslint-disable-next-line
  }, []);

  const fetchPlots = async () => {
    setLoading(true);
    try {
      const response = await plotAPI.getAll(filters);
      setPlots(response.data.plots);
    } catch (error) {
      console.error('Failed to fetch plots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchPlots();
  };

  const handleClearFilters = () => {
    setFilters({ city: '', soilType: '', waterAvailability: '' });
    setTimeout(() => fetchPlots(), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Available Plots</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Filter Plots</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              name="city"
              placeholder="City"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.city}
              onChange={handleFilterChange}
            />
            <select
              name="soilType"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.soilType}
              onChange={handleFilterChange}
            >
              <option value="">All Soil Types</option>
              <option value="clay">Clay</option>
              <option value="sandy">Sandy</option>
              <option value="loamy">Loamy</option>
              <option value="silt">Silt</option>
              <option value="chalky">Chalky</option>
              <option value="peaty">Peaty</option>
            </select>
            <select
              name="waterAvailability"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.waterAvailability}
              onChange={handleFilterChange}
            >
              <option value="">Water Availability</option>
              <option value="available">Available</option>
              <option value="limited">Limited</option>
              <option value="not-available">Not Available</option>
            </select>
            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
              >
                Search
              </button>
              <button
                onClick={handleClearFilters}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium transition"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Plots Grid */}
        {plots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No plots available at the moment.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plots.map((plot) => (
              <Link
                key={plot._id}
                to={`/plots/${plot._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
              >
                {/* Plot Image */}
                <div className="h-48 flex items-center justify-center bg-gray-100">
                  {plot.images && plot.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000${plot.images[0]}`}
                      alt={plot.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  )}
                </div>

                {/* Plot Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{plot.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        plot.verificationStatus === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : plot.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {plot.verificationStatus}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{plot.description}</p>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <strong>Location:</strong> {plot.location.city}, {plot.location.state}
                    </p>
                    <p>
                      <strong>Size:</strong> {plot.size.value} {plot.size.unit}
                    </p>
                    <p>
                      <strong>Soil:</strong> {plot.soilType}
                    </p>
                    <p>
                      <strong>Water:</strong> {plot.waterAvailability.charAt(0).toUpperCase() + plot.waterAvailability.slice(1)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlotsList;

