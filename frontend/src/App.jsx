import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PlotsList from './pages/PlotsList';
import PlotDetail from './pages/PlotDetail';
import GardenerBookings from './pages/GardenerBookings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Gardener-only routes */}
            <Route
              path="/plots"
              element={
                <ProtectedRoute allowedRoles={['gardener', 'admin']}>
                  <PlotsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plots/:id"
              element={
                <ProtectedRoute allowedRoles={['gardener', 'admin','landowner']}>
                  <PlotDetail />
                </ProtectedRoute>
              }
            />

            {/* Gardener routes */}
            <Route
              path="/gardener/bookings"
              element={
                <ProtectedRoute allowedRoles={['gardener']}>
                  <GardenerBookings />
                </ProtectedRoute>
              }
            />

            {/* Landowner routes */}
    

            {/* Admin route */}
            
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
