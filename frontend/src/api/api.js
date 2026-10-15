import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — only clear if it was a protected route check
      const isAuthCheck = error.config?.url === '/auth/me';
      if (isAuthCheck) {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ── Products ──
export const productsAPI = {
  list: (params) => api.get('/products', { params }),
  trending: () => api.get('/products/trending'),
  deals: (params) => api.get('/products/deals', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  recentlyViewed: (visitorId) => api.get('/products/recently-viewed', { params: { visitorId } }),
  recordView: (visitorId, productId) => api.post('/products/recently-viewed', { visitorId, productId }),
};

// ── Stores ──
export const storesAPI = {
  list: () => api.get('/stores'),
  getBySlug: (slug) => api.get(`/stores/${slug}`),
};

// ── Categories ──
export const categoriesAPI = {
  list: () => api.get('/categories'),
};

// ── Alerts ──
export const alertsAPI = {
  list: () => api.get('/alerts'),
  create: (data) => api.post('/alerts', data),
  update: (id, data) => api.put(`/alerts/${id}`, data),
  delete: (id) => api.delete(`/alerts/${id}`),
};

// ── Wishlist ──
export const wishlistAPI = {
  list: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

// ── Coupons ──
export const couponsAPI = {
  list: (params) => api.get('/coupons', { params }),
};

// ── Admin ──
export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  upload: (formData) => api.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Products
  listProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Categories
  listCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Stores
  listStores: () => api.get('/admin/stores'),
  createStore: (data) => api.post('/admin/stores', data),
  updateStore: (id, data) => api.put(`/admin/stores/${id}`, data),
  deleteStore: (id) => api.delete(`/admin/stores/${id}`),

  // Prices
  updatePrice: (data) => api.post('/admin/prices', data),
  priceHistory: (params) => api.get('/admin/price-history', { params }),

  // Coupons
  listCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  // Users
  listUsers: () => api.get('/admin/users'),
};

export default api;
