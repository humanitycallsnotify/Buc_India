import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api-buc-india.onrender.com/api";

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
  getHomepage: async () => {
    const response = await api.get("/events/homepage");
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
  getAll: async (eventId, filters = {}) => {
    const params = { ...filters };
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
  getPublicBySlug: async (slug) => {
    const response = await api.get(`/clubs/public/${slug}`);
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
    return response.data;
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
  delete: async (id) => {
    const response = await api.delete(`/talent/${id}`);
    return response.data;
  },
};

const multipartConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const internationalProfileService = {
  getPublic: async () => {
    const response = await api.get("/international-profiles/public");
    return response.data;
  },
  getAll: async () => {
    const response = await api.get("/international-profiles");
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post("/international-profiles", formData, multipartConfig);
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/international-profiles/${id}`, formData, multipartConfig);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/international-profiles/${id}`);
    return response.data;
  },
};

export const safetyInfluencerService = {
  getPublic: async () => {
    const response = await api.get("/safety-influencers/public");
    return response.data;
  },
  getAll: async () => {
    const response = await api.get("/safety-influencers");
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post("/safety-influencers", formData, multipartConfig);
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/safety-influencers/${id}`, formData, multipartConfig);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/safety-influencers/${id}`);
    return response.data;
  },
};

export const membersService = {
  getPublic: async () => {
    const response = await api.get("/members/public");
    return response.data;
  },
};

export const usersService = {
  getPublic: async () => {
    const response = await api.get("/users/public");
    return response.data;
  },
};

export const membershipApplicationService = {
  submit: async (data) => {
    const response = await api.post("/membership-applications", data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get("/membership-applications");
    return response.data;
  },
  updateStatus: async (id, status, adminNotes = "") => {
    const response = await api.patch(`/membership-applications/${id}/status`, {
      status,
      adminNotes,
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/membership-applications/${id}`);
    return response.data;
  },
};

export const forumService = {
  getCategories: async () => {
    const response = await api.get("/forum/categories");
    return response.data;
  },
  getTopics: async (params = {}) => {
    const response = await api.get("/forum/topics", { params });
    return response.data;
  },
  getRecent: async () => {
    const response = await api.get("/forum/topics/recent");
    return response.data;
  },
  getTopic: async (id) => {
    const response = await api.get(`/forum/topics/${id}`);
    return response.data;
  },
  createTopic: async (data) => {
    const response = await api.post("/forum/topics", data);
    return response.data;
  },
  createReply: async (topicId, data) => {
    const response = await api.post(`/forum/topics/${topicId}/replies`, data);
    return response.data;
  },
  likeTopic: async (topicId, email) => {
    const response = await api.post(`/forum/topics/${topicId}/like`, { email });
    return response.data;
  },
  likeReply: async (replyId, email) => {
    const response = await api.post(`/forum/replies/${replyId}/like`, { email });
    return response.data;
  },
  adminUpdateTopic: async (id, data) => {
    const response = await api.patch(`/forum/topics/${id}`, data);
    return response.data;
  },
  adminDeleteTopic: async (id) => {
    const response = await api.delete(`/forum/topics/${id}`);
    return response.data;
  },
  adminDeleteReply: async (id) => {
    const response = await api.delete(`/forum/replies/${id}`);
    return response.data;
  },
};

export const partnerService = {
  getAll: async () => {
    const response = await api.get("/partners");
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post("/partners", formData, multipartConfig);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/partners/${id}`);
    return response.data;
  },
};

export default api;
