


import { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';

const LandownerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getLandownerBookings();
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await bookingAPI.approve(id);
      fetchBookings();
    } catch (error) {
      console.error('Failed to approve booking:', error);
      alert('Failed to approve booking');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await bookingAPI.reject(id, { rejectionReason: reason });
        fetchBookings();
      } catch (error) {
        console.error('Failed to reject booking:', error);
        alert('Failed to reject booking');
      }
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('Mark this booking as completed?')) {
      try {
        await bookingAPI.complete(id);
        fetchBookings();
      } catch (error) {
        console.error('Failed to complete booking:', error);
      }
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--text-dark)] mb-8">
          Booking Requests
        </h1>

        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No booking requests yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[var(--primary)]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text-dark)]">
                      {booking.plot?.title}
                    </h3>
                    <p className="text-gray-600">
                      {booking.plot?.location?.city}, {booking.plot?.location?.state}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.status === 'approved'
                        ? 'bg-[var(--secondary)]/20 text-[var(--secondary)]'
                        : booking.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : booking.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                {/* Booking details */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Gardener</p>
                    <p className="font-medium">{booking.gardener?.name}</p>
                    <p className="text-sm text-gray-500">
                      {booking.gardener?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-medium">{booking.gardener?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">{formatDate(booking.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">{formatDate(booking.endDate)}</p>
                  </div>

                </div>

                {booking.message && (
                  <div className="mb-4 bg-[var(--bg-light)] rounded p-3">
                    <p className="text-sm text-gray-600 font-medium">
                      Message from Gardener
                    </p>
                    <p className="text-gray-800">{booking.message}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(booking._id)}
                        className="bg-[var(--primary)] hover:bg-[var(--secondary)] text-white px-4 py-2 rounded font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(booking._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'approved' && (
                    <button
                      onClick={() => handleComplete(booking._id)}
                      className="bg-[var(--secondary)] hover:bg-[var(--primary)] text-white px-4 py-2 rounded font-medium"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandownerBookings;
