import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://buc-india-backend.onrender.com/api");

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add interceptor to include token in headers if available
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("buc_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    if (response.data.token) {
      sessionStorage.setItem("buc_admin_token", response.data.token);
    }
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    sessionStorage.removeItem("buc_admin_token");
    sessionStorage.removeItem("buc_admin_authenticated");
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

export const galleryService = {
  getAll: async () => {
    const response = await api.get("/gallery");
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post("/gallery", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/gallery/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/gallery/${id}`);
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
    const params = {};
    if (eventId && eventId !== "all") {
      params.eventId = eventId;
    }
    const response = await api.get("/registrations", { params });
    return response.data;
  },
  getByUser: async (email, phone) => {
    const response = await api.get("/registrations/user", {
      params: { email, phone },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/registrations/${id}`);
    return response.data;
  },
};

export const profileService = {
  get: async (email, phone) => {
    const params = {};
    if (email) params.email = email;
    if (phone) params.phone = phone;
    const response = await api.get("/profile", { params });
    return response.data;
  },
  getAllAdmin: async () => {
    const response = await api.get("/profile/all");
    return response.data;
  },
  signup: async (formData) => {
    const response = await api.post("/profile/signup", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post("/profile/login", { email, password });
    return response.data;
  },
  update: async (formData) => {
    const response = await api.put("/profile/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export const clubService = {
  getPublic: async () => {
    const response = await api.get("/clubs/public");
    return response.data;
  },
  createRequest: async (formData) => {
    const response = await api.post("/clubs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  getAllAdmin: async () => {
    const response = await api.get("/clubs");
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/clubs/${id}/status`, { status });
    return response.data;
  },
};

export const clubMembershipService = {
  getMyClub: async (email, phone) => {
    const response = await api.get("/club-memberships/me", {
      params: { email, phone },
    });
    return response.data;
  },
  join: async (clubId, email, phone) => {
    const response = await api.post(`/club-memberships/${clubId}/join`, {
      email,
      phone,
    });
    return response.data;
  },
  leave: async (clubId, email, phone, reason) => {
    const response = await api.post(`/club-memberships/${clubId}/leave`, {
      email,
      phone,
      reason,
    });
    return response.data;
  },
  getAllAdmin: async () => {
    const response = await api.get("/club-memberships");
    return response.data;
  },
};

export const otpService = {
  send: async (email, type) => {
    const response = await api.post("/otp/send", { email, type });
    return response.data;
  },
  verify: async (email, otp, type) => {
    const response = await api.post("/otp/verify", { email, otp, type });
    return response.data;
  },
};

export const userAuthService = {
  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post("/user-auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },
};

export const certificateService = {
  getAll: async () => {
    const response = await api.get("/certificates");
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/certificates/stats");
    return response.data;
  },
};

export const talentService = {
  submit: async (formData) => {
    const response = await api.post("/talent", formData);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get("/talent");
    return response.data;
  },
};

export default api;
