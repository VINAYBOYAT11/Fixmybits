import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  register: (email, password, role, profile) => 
    api.post('/auth/register/', { email, password, role, ...profile }),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/me/'),
  updateProfile: (data) => api.patch('/auth/me/', data),
  requestPasswordReset: (email) => api.post('/auth/password-reset/', { email }),
  confirmPasswordReset: (uid, token, newPassword) =>
    api.post('/auth/password-reset/confirm/', { uid, token, new_password: newPassword }),
};

// Projects API
export const projectsAPI = {
  // Startup endpoints
  getMyProjects: () => api.get('/startup/projects/'),
  createProject: (data) => api.post('/startup/projects/', data),
  updateProject: (id, data) => api.patch(`/startup/projects/${id}/`, data),
  deleteProject: (id) => api.delete(`/startup/projects/${id}/`),
  submitProject: (id) => api.post(`/startup/projects/${id}/submit/`),
  
  // Tester endpoints
  getOpenProjects: () => api.get('/tester/projects/open/'),
  applyToProject: (id) => api.post(`/tester/projects/${id}/apply/`),
  getMyApplications: () => api.get('/tester/applications/'),
  cancelApplication: (id) => api.delete(`/tester/applications/${id}/`),
  getAssignedProjects: () => api.get('/tester/projects/assigned/'),
  
  // Admin endpoints
  getAllProjects: (params) => api.get('/admin/projects/', { params }),
  approveProject: (id) => api.post(`/admin/projects/${id}/approve/`, { action: 'approve' }),
  rejectProject: (id, reason) => 
    api.post(`/admin/projects/${id}/approve/`, { action: 'reject', rejection_reason: reason }),
  getApplications: (params) => api.get('/admin/applications/', { params }),
  acceptApplication: (id) => api.post(`/admin/applications/${id}/accept/`),
  rejectApplication: (id) => api.post(`/admin/applications/${id}/reject/`),
};

// Reports API
export const reportsAPI = {
  // Tester endpoints
  submitReport: (projectId, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post(`/tester/projects/${projectId}/reports/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMyReports: () => api.get('/tester/reports/'),
  
  // Startup endpoints
  getProjectReports: (projectId) => api.get(`/startup/projects/${projectId}/reports/`),
  markReportFixed: (id) => api.patch(`/startup/reports/${id}/mark_fixed/`),
  
  // Admin endpoints
  getAllReports: (params) => api.get('/admin/reports/', { params }),
  reviewReport: (id, action, feedback) =>
    api.post(`/admin/reports/${id}/review/`, { action, admin_feedback: feedback }),
  
  // Report messages
  getReportMessages: (reportId) => api.get(`/reports/${reportId}/messages/`),
  sendMessage: (reportId, content) => 
    api.post(`/reports/${reportId}/messages/`, { content }),
};

// Users API (Admin)
export const usersAPI = {
  getAllUsers: (params) => api.get('/admin/users/', { params }),
  approveUser: (id) => api.post(`/admin/users/${id}/approve/`),
  banUser: (id) => api.post(`/admin/users/${id}/ban/`),
  unbanUser: (id) => api.post(`/admin/users/${id}/unban/`),
  getAvailableTesters: (params) => api.get('/admin/available-testers/', { params }),
};

export default api;
