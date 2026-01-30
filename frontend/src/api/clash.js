import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Add Interceptor to inject JWT Token
client.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('clash_user');
    if (user) {
      const { access_token } = JSON.parse(user);
      if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = {
  // --- Auth & User ---
  
  // POST /auth/login
  login: async (username, password) => {
    // Login returns { access_token, token_type }
    const response = await client.post('/auth/login', 
      new URLSearchParams({ username, password }), // OAuth2 expects form data
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  },

  // POST /auth/signup
  signup: async (userData) => {
    const response = await client.post('/auth/signup', userData);
    return response.data;
  },

  // GET /users/me
  getMe: async () => {
    const response = await client.get('/users/me');
    return response.data;
  },

  // PUT /users/link-tag (Protected)
  linkPlayerTag: async (playerTag) => {
    const response = await client.put('/users/link-tag', { player_tag: playerTag });
    return response.data;
  },

  // --- Core Features ---

  // GET /matches (Protected - Gets matches for logged-in user)
  getMatches: async () => {
    const response = await client.get('/matches');
    return response.data;
  },

  // POST /friends/add (Protected)
  addFriend: async (playerTag) => {
    const response = await client.post('/friends/add', { player_tag: playerTag });
    return response.data;
  },
  
  // POST /invites/ (Generate a viral invite link)
  createInvite: async () => {
    const response = await client.post('/invites/');
    return response.data;
  },

  // Helper: Find user by tag (for friend search UI)
  // Note: This assumes you kept a public search or use addFriend directly
  searchUser: async (playerTag) => {
    // We can try to add them directly to check existence, 
    // or implement a specific search endpoint if needed.
    // For now, we'll leave this as a placeholder or remove it 
    // if the UI handles "Add Friend" blindly.
    return { player_tag: playerTag }; 
  }
};