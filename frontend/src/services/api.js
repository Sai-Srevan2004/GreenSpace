import axios from 'axios';

//http://localhost:5000/api

const API_BASE_URL = 'https://greenspace-iynp.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadDocuments: (formData) =>
    api.post('/auth/upload-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Plot APIs (fully aligned with your backend routes)
export const plotAPI = {
  getAll: (filters = {}) => api.get('/plots', { params: filters }),
  getMyPlots: () => api.get('/plots/my-plots'),
  getById: (id) => api.get(`/plots/${id}`),
  create: (formData) =>
    api.post('/plots', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/plots/${id}`, data),
  delete: (id) => api.delete(`/plots/${id}`),
  uploadDocuments: (id, formData) =>
    api.post(`/plots/${id}/upload-documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getGardenerBookings: () => api.get('/bookings/gardener'),
  getLandownerBookings: () => api.get('/bookings/landowner'),
  getById: (id) => api.get(`/bookings/${id}`),
  approve: (id) => api.put(`/bookings/${id}/approve`),
  reject: (id, data) => api.put(`/bookings/${id}/reject`, data),
  complete: (id) => api.put(`/bookings/${id}/complete`),
  cancel: (id) => api.delete(`/bookings/${id}`),
};

// Admin APIs
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  verifyUser: (id, data) => api.put(`/admin/users/${id}/verify`, data),
  getPlots: (params) => api.get('/admin/plots', { params }),
  getPlotById: (id) => api.get(`/admin/plots/${id}`),
  verifyPlot: (id, data) => api.put(`/admin/plots/${id}/verify`, data),
  getBookings: () => api.get('/admin/bookings'),
  getStats: () => api.get('/admin/stats'),
};

export default api;
