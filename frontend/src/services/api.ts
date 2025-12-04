// frontend/src/services/api.ts
import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
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

export const loginUser = (data: { email: string; password: string }) => {
  return api.post("/auth/login", data);
};

export const registerUser = (data: { username: string; email: string; password: string }) => {
  return api.post("/auth/register", data);
};

export const getCurrentUser = () => {
  return api.get("/auth/me");
};

export const uploadTravelLog = (formData: FormData) => {
  return api.post("/travel_logs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getUserTravelLogs = (userId: number) => {
  return api.get(`/travel_logs/user/${userId}`);
};

export const deleteTravelLog = (logId: number) => {
  return api.delete(`/travel_logs/${logId}`);
};


export const getUserTrips = (userEmail: string) => {
  return api.get(`/trips?userEmail=${userEmail}`);
};

export const getTripById = (tripId: string | number) => {
  return api.get(`/trips/${tripId}`);
};

export const createTrip = (data: {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return api.post("/trips", data);
};

export const deleteTrip = (tripId: string | number) => {
  return api.delete(`/trips/${tripId}`);
};

export const getUserWishlist = (userEmail: string) => {
  return api.get(`/wishlist?userEmail=${userEmail}`);
};

export const addWishlistItem = (data: {
  city: string;
  country: string;
  notes?: string;
  priority?: number;
}) => {
  return api.post("/wishlist", data);
};

export const deleteWishlistItem = (itemId: string | number) => {
  return api.delete(`/wishlist/${itemId}`);
};

export const getCountryFacts = (country: string) => {
  return api.get(`/countries/facts/${country}`);
};


export const getUserFriends = (userEmail: string) => {
  return api.get(`/friends?userEmail=${userEmail}`);
};


export const addFriend = (friendEmail: string) => {
  return api.post("/friends", { friendEmail });
};

export const removeFriend = (friendId: string | number) => {
  return api.delete(`/friends/${friendId}`);
};
