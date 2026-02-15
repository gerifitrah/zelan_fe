import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token && token !== 'authenticated') {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Helper to get full URL for uploaded files
export const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${UPLOADS_BASE_URL}/${path}`;
};

// Categories API
export const categoriesApi = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`)
};

// Menu Items API
export const menuApi = {
    getAll: (params = {}) => api.get('/menu', { params }),
    getByCategory: () => api.get('/menu/by-category'),
    getById: (id) => api.get(`/menu/${id}`),

    create: (formData) => api.post('/menu', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    update: (id, formData) => api.put(`/menu/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    delete: (id) => api.delete(`/menu/${id}`),

    uploadVoice: (id, formData) => api.post(`/menu/${id}/voice`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Image management
    uploadImage: (id, formData) => api.post(`/menu/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    deleteImage: (menuId, imageId) => api.delete(`/menu/${menuId}/images/${imageId}`),

    setMainImage: (menuId, imageId) => api.patch(`/menu/${menuId}/images/${imageId}/main`)
};

// Specials API
export const specialsApi = {
    getAll: (params = {}) => api.get('/specials', { params }),
    getById: (id) => api.get(`/specials/${id}`),
    create: (data) => api.post('/specials', data),
    update: (id, data) => api.put(`/specials/${id}`, data),
    delete: (id) => api.delete(`/specials/${id}`)
};

// Auth API
export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    register: (data) => api.post('/auth/register', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    getAllAdmins: () => api.get('/auth/admins')
};

// Stats API
export const statsApi = {
    get: () => api.get('/stats')
};

// FAQ API
export const faqApi = {
    getAll: () => api.get('/faqs'),
    getById: (id) => api.get(`/faqs/${id}`),
    create: (data) => api.post('/faqs', data),
    update: (id, data) => api.put(`/faqs/${id}`, data),
    delete: (id) => api.delete(`/faqs/${id}`)
};

// Gallery API
export const galleryApi = {
    getAll: () => api.get('/gallery'),
    getById: (id) => api.get(`/gallery/${id}`),
    create: (formData) => api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/gallery/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/gallery/${id}`)
};

export default api;
