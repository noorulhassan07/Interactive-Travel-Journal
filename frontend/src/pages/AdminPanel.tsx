import React, { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  badges_count: number;
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
        const res = await api.get<User[]>("/admin/users", {
          params: { username: "admin@gmail.com", password: "admin@123" },
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
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>

        {loading && <p>Loading users...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <p className="mb-4 font-semibold">Total Users: {users.length}</p>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg shadow-lg">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-2 px-4 border">#</th>
                    <th className="py-2 px-4 border">Username</th>
                    <th className="py-2 px-4 border">Email</th>
                    <th className="py-2 px-4 border">Password</th>
                    <th className="py-2 px-4 border">Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id} className="text-center">
                      <td className="py-2 px-4 border">{index + 1}</td>
                      <td className="py-2 px-4 border">{user.username}</td>
                      <td className="py-2 px-4 border">{user.email}</td>
                      <td className="py-2 px-4 border">{user.password}</td>
                      <td className="py-2 px-4 border">{user.badges_count}</td>
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

export default AdminPanel;
