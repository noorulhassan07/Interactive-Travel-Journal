// frontend/src/components/AdminRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  
  const checkAdmin = () => {
    if (isAdmin) return true;
    
    if (currentUser?.isAdmin) return true;
    
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.isAdmin === true) return true;
      }
      catch
      {
        // Ignoring Prase Error
      }
    }
      return localStorage.getItem("isAdmin") === "true";
  };

  if (!checkAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;

};

export default AdminRoute;
