import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Wishlist from './pages/Wishlist'; 
import Badges from './pages/Badges'; 
import Friends from './pages/Friends';
import Profile from './pages/Profile';
import Globe from './pages/Globe';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

           <Route
            path="/globe"
            element={
              <PrivateRoute>
                <Globe />
              </PrivateRoute>
            }
          />

          <Route
            path="/trips"
            element={
              <PrivateRoute>
                <Trips />
              </PrivateRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
                <PrivateRoute>
                  <Wishlist />
                </PrivateRoute>
              }
            />
             <Route
            path="/badges"
            element={
              <PrivateRoute>
                <Badges />
              </PrivateRoute>
            }
          />
           <Route
            path="/friends"
            element={
              <PrivateRoute>
                <Friends />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
