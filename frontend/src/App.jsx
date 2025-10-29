// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import Navbar from './components/Navbar';
// import ProtectedRoute from './components/ProtectedRoute';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import PlotsList from './pages/PlotsList';
// import PlotDetail from './pages/PlotDetail';
// import LandownerPlots from './pages/LandownerPlots';
// import LandownerBookings from './pages/LandownerBookings';
// import GardenerBookings from './pages/GardenerBookings';
// import AdminDashboard from './pages/AdminDashboard';

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <div className="min-h-screen bg-gray-50">
//           <Navbar />
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/plots" element={<PlotsList />} />
//             <Route path="/plots/:id" element={<PlotDetail />} />

//             <Route
//               path="/gardener/bookings"
//               element={
//                 <ProtectedRoute allowedRoles={['gardener']}>
//                   <GardenerBookings />
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/landowner/plots"
//               element={
//                 <ProtectedRoute allowedRoles={['landowner']}>
//                   <LandownerPlots />
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/landowner/bookings"
//               element={
//                 <ProtectedRoute allowedRoles={['landowner']}>
//                   <LandownerBookings />
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/admin"
//               element={
//                 <ProtectedRoute allowedRoles={['admin']}>
//                   <AdminDashboard />
//                 </ProtectedRoute>
//               }
//             />
//           </Routes>
//         </div>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PlotsList from './pages/PlotsList';
import PlotDetail from './pages/PlotDetail';
import LandownerPlots from './pages/LandownerPlots';
import LandownerBookings from './pages/LandownerBookings';
import GardenerBookings from './pages/GardenerBookings';
import AdminDashboard from './pages/AdminDashboard';

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
            <Route
              path="/landowner/plots"
              element={
                <ProtectedRoute allowedRoles={['landowner']}>
                  <LandownerPlots />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landowner/bookings"
              element={
                <ProtectedRoute allowedRoles={['landowner']}>
                  <LandownerBookings />
                </ProtectedRoute>
              }
            />

            {/* Admin route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
