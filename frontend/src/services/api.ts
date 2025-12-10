import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


export const loginUser = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

export const registerUser = (data: { username: string; email: string; password: string }) =>
  api.post("/auth/register", data);

export const getCurrentUser = () => api.get("/auth/me");

export const getUserTrips = (userEmail: string) =>
  api.get(`/trips/user?email=${userEmail}`);

export const getTripById = (tripId: string) => api.get(`/trips/${tripId}`);

export const createTrip = (data: {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
}) => api.post("/trips/upload", data);

export const deleteTrip = (tripId: string) => api.delete(`/trips/${tripId}`);

export const uploadTravelLog = (formData: FormData) =>
  api.post("/travel_logs/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getLeaderboard = (userId?: string) =>
  api.get(`/users/leaderboard${userId ? `?user_id=${userId}` : ""}`);

export const getUserFriends = (email: string) =>
  api.get(`/users/friends?email=${email}`);

export const followUser = (friendId: string, followerId: string) =>
  api.post(`/users/follow/${friendId}?follower_id=${followerId}`);
