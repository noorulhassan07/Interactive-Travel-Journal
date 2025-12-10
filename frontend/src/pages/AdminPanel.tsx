import React, { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminRoute from "../components/AdminRoute";

interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  isAdmin?: boolean;
  countriesVisited?: number;
  following?: string[];
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          navigate("/admin/login");
          return;
        }
        try {
          const res = await api.get<User[]>("/users", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(res.data);
        } catch (firstErr: any) {

          const res = await api.get<User[]>("/users/all", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(res.data);
        }
        
      } catch (err: any) {
        console.error("Admin fetch error:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/admin/login");
        } else {
          setError(err.response?.data?.message || "Failed to load users");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setUsers(users.filter(user => user._id !== userId));
      alert("User deleted successfully");
    } catch (err: any) {
      alert("Failed to delete user");
    }
  };

  return (
    <AdminRoute>
      <Layout>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.heading}>Admin Panel</h1>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>

          {loading && <p style={styles.loading}>Loading users...</p>}
          {error && <p style={styles.error}>{error}</p>}

          {!loading && !error && (
            <>
              <div style={styles.stats}>
                <div style={styles.statCard}>
                  <h3>Total Users</h3>
                  <p style={styles.statNumber}>{users.length}</p>
                </div>
                <div style={styles.statCard}>
                  <h3>Admins</h3>
                  <p style={styles.statNumber}>
                    {users.filter(user => user.isAdmin).length}
                  </p>
                </div>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>#</th>
                      <th style={styles.th}>Username</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Admin</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={user._id}
                        style={{
                          ...styles.tr,
                          backgroundColor: index % 2 === 0 ? "#f9fafb" : "#fff",
                        }}
                      >
                        <td style={styles.td}>{index + 1}</td>
                        <td style={styles.td}>{user.username}</td>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.adminBadge,
                            background: user.isAdmin ? "#10b981" : "#ef4444"
                          }}>
                            {user.isAdmin ? "Yes" : "No"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            style={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Layout>
    </AdminRoute>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "30px",
    maxWidth: "1000px",
    margin: "auto",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  heading: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1d3557",
    margin: 0,
  },
  logoutButton: {
    padding: "10px 20px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#555",
  },
  error: {
    textAlign: "center",
    padding: "20px",
    color: "#dc2626",
    background: "#fee2e2",
    borderRadius: "8px",
  },
  stats: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    flex: 1,
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "10px",
    textAlign: "center",
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: "10px 0 0 0",
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    background: "#1d3557",
    color: "white",
    padding: "15px",
    fontWeight: "600",
    textAlign: "left",
  },
  tr: {
    transition: "0.2s",
  },
  td: {
    padding: "15px",
    borderBottom: "1px solid #e5e7eb",
  },
  adminBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
  },
  deleteButton: {
    padding: "6px 15px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default AdminPanel;
