import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("riibah_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('riizaa_token');
      localStorage.removeItem("riibah_user");
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Users API calls
export const usersAPI = {
  searchUsers: (query) => api.get(`/users/search?query=${encodeURIComponent(query)}`),
  getUserById: (userId) => api.get(`/users/${userId}`),
  getFriendsList: () => api.get('/users/friends/list'),
  updateStatus: (status) => api.put('/users/status', { status }),
};

// Friends API calls
export const friendsAPI = {
  sendFriendRequest: (recipientId, message) => 
    api.post('/friends/request', { recipientId, message }),
  getReceivedRequests: () => api.get('/friends/requests/received'),
  getSentRequests: () => api.get('/friends/requests/sent'),
  acceptFriendRequest: (requestId) => api.put(`/friends/request/${requestId}/accept`),
  rejectFriendRequest: (requestId) => api.put(`/friends/request/${requestId}/reject`),
  removeFriend: (friendId) => api.delete(`/friends/${friendId}`),
};

// Messages API calls
export const messagesAPI = {
  sendMessage: (recipientId, content, messageType = 'text') => 
    api.post('/messages/send', { recipientId, content, messageType }),
  getConversation: (userId, page = 1, limit = 50) => 
    api.get(`/messages/conversation/${userId}?page=${page}&limit=${limit}`),
  getConversations: () => api.get('/messages/conversations'),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  getUnreadCount: () => api.get('/messages/unread/count'),
};

export default api;

