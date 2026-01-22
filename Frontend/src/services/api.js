import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:5000/api" : "https://buc-india-backend.onrender.com/api");

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add interceptor to include token in headers if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("buc_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    if (response.data.token) {
      localStorage.setItem("buc_admin_token", response.data.token);
    }
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    localStorage.removeItem("buc_admin_token");
    localStorage.removeItem("buc_admin_authenticated");
    return response.data;
  },
  checkAuth: async () => {
    const response = await api.get("/auth/check");
    return response.data;
  },
};

export const eventService = {
  getAll: async () => {
    const response = await api.get("/events");
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post("/events", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/events/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

export const registrationService = {
  create: async (formData) => {
    const response = await api.post("/registrations", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getAll: async (eventId) => {
    const response = await api.get("/registrations", {
      params: { eventId },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/registrations/${id}`);
    return response.data;
  },
};

export default api;
