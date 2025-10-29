import { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';

const GardenerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getGardenerBookings();
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.cancel(id);
        fetchBookings();
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        alert(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-dark mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-border-light">
            <p className="text-text-muted text-lg">You haven't made any bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md p-6 border border-border-light hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-text-dark">{booking.plot?.title}</h3>
                    <p className="text-text-muted">{booking.plot?.location?.city}, {booking.plot?.location?.state}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                    booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    booking.status === 'completed' ? 'bg-accent-light text-accent-dark' :
                    booking.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-text-muted">Start Date</p>
                    <p className="font-medium">{formatDate(booking.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">End Date</p>
                    <p className="font-medium">{formatDate(booking.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Landowner</p>
                    <p className="font-medium">{booking.landowner?.name}</p>
                  </div>
                </div>

                {booking.message && (
                  <div className="mb-4">
                    <p className="text-sm text-text-muted">Your Message</p>
                    <p className="text-text-dark">{booking.message}</p>
                  </div>
                )}

                {booking.rejectionReason && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-600 font-medium">Rejection Reason</p>
                    <p className="text-red-800">{booking.rejectionReason}</p>
                  </div>
                )}

                {booking.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GardenerBookings;