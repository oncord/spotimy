// src/services/spotifyService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const spotifyService = {
  // Get user's top tracks
  getTopTracks: async (timeRange = 'medium_term') => {
    const response = await axios.get(`${API_URL}/api/spotify/top-tracks?time_range=${timeRange}`, {
      withCredentials: true
    });
    return response.data;
  },
  
  // Get user's top artists
  getTopArtists: async (timeRange = 'medium_term') => {
    const response = await axios.get(`${API_URL}/api/spotify/top-artists?time_range=${timeRange}`, {
      withCredentials: true
    });
    return response.data;
  },
  
  // Get user profile
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/api/spotify/profile`, {
      withCredentials: true
    });
    return response.data;
  }
};

export default spotifyService;