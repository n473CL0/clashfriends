import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Register or fetch existing user
  registerUser: async (username, playerTag) => {
    const formattedTag = playerTag.startsWith('#') ? playerTag : `#${playerTag}`;
    const response = await client.post('/users/', { 
      username, 
      player_tag: formattedTag 
    });
    return response.data;
  },

  // Trigger backend sync
  syncBattles: async (playerTag) => {
    const cleanTag = playerTag.replace('#', '%23');
    const response = await client.post(`/sync/${cleanTag}`);
    return response.data;
  },

  // Get match history
  getMatches: async (playerTag) => {
    const cleanTag = playerTag.replace('#', '%23');
    const response = await client.get(`/players/${cleanTag}/matches`);
    return response.data;
  },

  // Find a user in our local DB by tag
  searchUser: async (playerTag) => {
    const cleanTag = playerTag.replace('#', '%23');
    const response = await client.get(`/search/${cleanTag}`); 
    return response.data;
  },

  // Create friendship link
  addFriend: async (currentUserId, friendId) => {
    const response = await client.post('/friends/', { 
      user_id_1: currentUserId, 
      user_id_2: friendId 
    });
    return response.data;
  },

  // Fetch all friends for the leaderboard
  getFriends: async (userId) => {
    const response = await client.get(`/users/${userId}/friends`);
    return response.data;
  }
};