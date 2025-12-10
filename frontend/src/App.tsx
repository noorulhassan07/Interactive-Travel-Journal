// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import Wishlist from "./pages/Wishlist";
import Badges from "./pages/Badges";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import Globe from "./pages/Globe";
import NewTripForm from "./components/NewTripForm";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin"; // create a separate Admin login page

function AppRoutes() {
  const { currentUser } = useAuth();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Private User Routes */}
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
        path="/trips/new"
        element={
          currentUser ? (
            <NewTripForm userId={currentUser?.id!} />
          ) : (
            <Navigate to="/login" replace />
          )
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

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={isAdmin ? <AdminPanel /> : <Navigate to="/admin/login" replace />}
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
