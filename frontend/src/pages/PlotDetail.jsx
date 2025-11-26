
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { plotAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BASE_URL = "https://greenspace-iynp.onrender.com"; // backend URL

const PlotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [plot, setPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    message: ''
  });

  useEffect(() => {
    fetchPlot();
  }, [id]);

  const fetchPlot = async () => {
    try {
      const response = await plotAPI.getById(id);
      setPlot(response.data.plot);
    } catch (error) {
      console.error('Failed to fetch plot:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await bookingAPI.create({
        plotId: id,
        ...bookingData
      });
      alert('Booking request sent successfully!');
      setShowBookingForm(false);
      navigate('/gardener/bookings');
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert(error.response?.data?.message || 'Failed to create booking');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!plot) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">Plot not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-96 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{plot.title}</h1>
            <p className="text-gray-600 mb-6">{plot.description}</p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                <p className="text-gray-700">{plot.location.address}</p>
                <p className="text-gray-700">{plot.location.city}, {plot.location.state} {plot.location.pincode}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Plot Details</h3>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">Size:</span> {plot.size.value} {plot.size.unit}</p>
                  <p><span className="font-medium">Soil Type:</span> {plot.soilType}</p>
                  <p><span className="font-medium">Water:</span> {plot.waterAvailability.replace('-', ' ')}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Owner Details</h3>
                <p className="text-gray-700">{plot.owner.name}</p>
                <p className="text-gray-700">{plot.owner.email}</p>
                <p className="text-gray-700">{plot.owner.phone}</p>
              </div>
            </div>

            {/* Documents / Images */}
            {plot.documents && plot.documents.length > 0 && (
              <div className="mt-10 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Documents & Images
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {plot.documents.map((doc, index) => (
                    <div key={doc._id || index} className="border rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition">
                      {doc.url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                        <img
                          src={`${BASE_URL}${doc.url}`}
                          alt={doc.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="p-4 text-center">
                          <svg
                            className="mx-auto w-8 h-8 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <a
                            href={`${BASE_URL}${doc.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-2 text-blue-600 hover:underline text-sm font-medium"
                          >
                            View {doc.name}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user?.role === 'gardener' && plot.isAvailable && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                {!showBookingForm ? (
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="w-full bg-primary hover:bg-secondary text-black cursor-pointer px-6 py-3 rounded-lg font-semibold text-lg transition"
                  >
                    Book This Plot
                  </button>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Book This Plot</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          value={bookingData.startDate}
                          onChange={handleBookingChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          value={bookingData.endDate}
                          onChange={handleBookingChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                      <textarea
                        name="message"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Tell the landowner about your gardening plans..."
                        value={bookingData.message}
                        onChange={handleBookingChange}
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="flex-1 bg-primary hover:bg-secondary text-black border-2 cursor-pointer px-6 py-3 rounded-md font-semibold transition"
                      >
                        Submit Booking Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlotDetail;
