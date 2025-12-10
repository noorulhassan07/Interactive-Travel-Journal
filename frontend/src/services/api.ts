import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

const jsonApi = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const addAuthToken = (config: any) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(addAuthToken);
jsonApi.interceptors.request.use(addAuthToken);

export default api;

export const loginUser = (data: { email: string; password: string }) =>
  jsonApi.post("/auth/login", data);

export const registerUser = (data: { username: string; email: string; password: string }) =>
  jsonApi.post("/auth/register", data);

export const getCurrentUser = () => jsonApi.get("/auth/me");

export const uploadTravelLog = (formData: FormData) => {
  return api.post("/trips/upload", formData);
};

export const getTrips = () => api.get("/trips");

export const getTripById = (tripId: string) => api.get(`/trips/${tripId}`);

export const getUserTrips = (userId: string) => 
  api.get(`/trips/user/${userId}`);

export const deleteTrip = (tripId: string) => api.delete(`/trips/${tripId}`);

export const getTripPhoto = (tripId: string, thumbnail: boolean = false) => {
  const url = `/trips/photo/${tripId}${thumbnail ? '?thumbnail=true' : ''}`;
  return api.get(url, { responseType: 'blob' });
};

export const getHDFSStats = () => api.get("/trips/hdfs/stats");

export const getLeaderboard = (userId?: string) =>
  jsonApi.get(`/users/leaderboard${userId ? `?user_id=${userId}` : ""}`);

export const getUserFriends = (email: string) =>
  jsonApi.get(`/users/friends?email=${email}`);

export const followUser = (friendId: string, followerId: string) =>
  jsonApi.post(`/users/follow/${friendId}?follower_id=${followerId}`);

export const getUserProfile = () => api.get("/users/profile");
