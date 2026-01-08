import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For mobile devices, use your computer's IP address instead of localhost
// Find your IP: Windows: ipconfig | findstr IPv4
// Example: 'http://192.168.1.100:3000/api'
// For Expo Go on physical device, use your computer's local IP address
// For web/emulator, localhost works
const API_BASE_URL = Platform.select({
  web: 'http://localhost:3000/api',
  default: 'http://10.40.23.208:3000/api', // Change this to your computer's IP if testing on physical device
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.error('Backend server is not running or unreachable. Please start the server with: npm run server');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }).then(res => res.data),
  register: (data) => api.post('/auth/register', data).then(res => res.data),
  verify: (email, code) => api.post('/auth/verify', { email, code }).then(res => res.data),
  logout: (email) => api.post('/auth/logout', { email }).then(res => res.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(res => res.data),
  resetPassword: (email, code, newPassword) => 
    api.post('/auth/reset-password', { email, code, newPassword }).then(res => res.data),
};

export const menuAPI = {
  getAll: () => api.get('/menu/all').then(res => res.data),
  getMain: () => api.get('/menu/main').then(res => res.data),
  getDrinks: () => api.get('/menu/drinks').then(res => res.data),
  getPastry: () => api.get('/menu/pastry').then(res => res.data),
  getLatest: () => api.get('/menu/latest').then(res => res.data),
  getItem: (id) => api.get(`/menu/item/${id}`).then(res => res.data),
  updateRate: (id, rate) => api.put(`/menu/item/${id}/rate`, { rate }).then(res => res.data),
};

export const orderAPI = {
  getUserOrders: (email) => api.get(`/orders/user/${email}`).then(res => res.data),
  createOrder: (data) => api.post('/orders/create', data).then(res => res.data),
  getOrder: (numCommande) => api.get(`/orders/${numCommande}`).then(res => res.data),
};

export const bookingAPI = {
  getTables: () => api.get('/booking/tables').then(res => res.data),
  getAllTables: () => api.get('/booking/tables/all').then(res => res.data),
  createBooking: (data) => api.post('/booking/create', data).then(res => res.data),
  getUserBookings: (email) => api.get(`/booking/user/${email}`).then(res => res.data),
  cancelBooking: (id) => api.put(`/booking/cancel/${id}`).then(res => res.data),
};

export const userAPI = {
  getProfile: (email) => api.get(`/user/profile/${email}`).then(res => res.data),
  updateProfile: (email, data) => api.put(`/user/profile/${email}`, data).then(res => res.data),
  getOpinions: () => api.get('/user/opinions').then(res => res.data),
  createOpinion: (data) => api.post('/user/opinions', data).then(res => res.data),
};

export const paymentAPI = {
  createPayment: (data) => api.post('/payment/create', data).then(res => res.data),
  getUserPayments: (email) => api.get(`/payment/user/${email}`).then(res => res.data),
};

export default api;
