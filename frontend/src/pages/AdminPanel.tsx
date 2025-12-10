import React, { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";

interface User {
  id: string;
  username: string;
  email: string;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("Admin not authenticated");
          setLoading(false);
          return;
        }

        const res = await api.get<User[]>("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err: any) {
        console.error("Admin fetch error:", err);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.heading}>Admin Panel</h1>

        {loading && <p style={styles.loading}>Loading users...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && !error && (
          <>
            <p style={styles.totalUsers}>Total Users: {users.length}</p>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      style={{
                        ...styles.tr,
                        backgroundColor: index % 2 === 0 ? "#f9fafb" : "#fff",
                      }}
                    >
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>{user.username}</td>
                      <td style={styles.td}>{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "30px",
    maxWidth: "800px",
    margin: "auto",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  heading: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
    color: "#333",
  },
  loading: { textAlign: "center", fontSize: "18px", color: "#555" },
  error: { textAlign: "center", fontSize: "18px", color: "red" },
  totalUsers: { fontWeight: "bold", fontSize: "18px", marginBottom: "15px" },
  tableContainer: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  th: {
    background: "#2563eb",
    color: "white",
    padding: "12px",
    border: "none",
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: "12px",
  },
  tr: { transition: "0.2s" },
  td: {
    padding: "12px",
    textAlign: "center",
    fontSize: "14px",
    borderBottom: "1px solid #e5e7eb",
  },
};

export default AdminPanel;
