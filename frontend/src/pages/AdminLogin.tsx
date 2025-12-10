import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/admin/login", { email, password });
      const { token } = res.data;

      // Save token in localStorage
      localStorage.setItem("adminToken", token);
      navigate("/admin/dashboard");
    } catch (err: any) {
      console.error("Admin login error:", err);
      setError("Invalid admin credentials.");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Admin Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f1faee",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    padding: 24,
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#ffffff",
    width: 300,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
    color: "#1d3557",
  },
  input: {
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  button: {
    padding: 10,
    borderRadius: 4,
    border: "none",
    backgroundColor: "#1d3557",
    color: "#ffffff",
    fontSize: 16,
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: 12,
    textAlign: "center",
  },
};

export default AdminLogin;
