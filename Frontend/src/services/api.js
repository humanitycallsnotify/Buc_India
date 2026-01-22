import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  checkAuth: async () => {
    const response = await api.get('/auth/check');
    return response.data;
  }
};

export const eventService = {
  getAll: async () => {
    const response = await api.get('/events');
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/events/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  }
};

export const registrationService = {
  create: async (formData) => {
    const response = await api.post('/registrations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getAll: async (eventId) => {
    const response = await api.get('/registrations', {
      params: { eventId }
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/registrations/${id}`);
    return response.data;
  }
};

export default api;
