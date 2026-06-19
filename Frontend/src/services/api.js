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

export const ensureArrayResponse = (data, label = "API response") => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.data)) return data.data;
  console.error(`[API] Expected array for ${label}, received:`, data);
  return [];
};

// Add interceptor to include token in headers if available
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("buc_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    console.error(
      `[API Error] ${config?.method?.toUpperCase() || "REQUEST"} ${config?.url || ""}`,
      response?.status,
      response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

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
    return ensureArrayResponse(response.data, "events");
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
  getAll: async (eventId, filters = {}) => {
    const params = { ...filters };
    if (eventId && eventId !== "all") {
      params.eventId = eventId;
    }
    const response = await api.get("/registrations", { params });
    return ensureArrayResponse(response.data, "registrations");
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
    return ensureArrayResponse(response.data, "profile/all");
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
  createOrUpdate: async (formData) => {
    return profileService.update(formData);
  },
  delete: async (id) => {
    const response = await api.delete(`/profile/${id}`);
    return response.data;
  },
  checkPhoneRegistered: async (phone, registrationType, category = "User") => {
    const response = await api.get("/profile/phone-registered", {
      params: { phone, registrationType, category },
    });
    return response.data;
  },
  checkEmailRegistered: async (email, registrationType, category = "User") => {
    const response = await api.get("/profile/email-registered", {
      params: { email, registrationType, category },
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
    return ensureArrayResponse(response.data, "clubs");
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/clubs/${id}/status`, { status });
    return response.data;
  },
  deleteAdmin: async (id) => {
    const response = await api.delete(`/clubs/${id}`);
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
    return ensureArrayResponse(response.data, "club-memberships");
  },
};

export const otpService = {
  send: async (email, type, registrationType = null) => {
    const payload = { email, type };
    if (registrationType) {
      payload.registrationType = registrationType;
    }
    const response = await api.post("/otp/send", payload);
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
    return ensureArrayResponse(response.data, "certificates");
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
    return ensureArrayResponse(response.data, "talent");
  },
  delete: async (id) => {
    const response = await api.delete(`/talent/${id}`);
    return response.data;
  },
};
export default api;
