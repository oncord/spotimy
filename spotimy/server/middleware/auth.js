const axios = require('axios');
const User = require('../models/User');
const Session = require('../models/Session');

const isAuthenticated = async (req, res, next) => {
  try {
    // Check for session
    if (!req.session.spotify || !req.session.spotify.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get user's session from database
    const session = await Session.findOne({ 
      userId: req.session.spotify.userId,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!session) {
      // Try to find any session with a refresh token
      const expiredSession = await Session.findOne({ 
        userId: req.session.spotify.userId 
      }).sort({ createdAt: -1 });
      
      if (!expiredSession) {
        return res.status(401).json({ error: 'No valid session found' });
      }
      
      // Try to refresh the token
      try {
        const refreshedSession = await refreshSpotifyToken(expiredSession);
        req.spotifyToken = refreshedSession.accessToken;
        next();
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        return res.status(401).json({ error: 'Session expired' });
      }
    } else {
      // Valid session found
      req.spotifyToken = session.accessToken;
      req.userId = session.userId;
      next();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to refresh token
const refreshSpotifyToken = async (session) => {
  const response = await axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    params: {
      grant_type: 'refresh_token',
      refresh_token: session.refreshToken
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`
    }
  });
  
  const { access_token, expires_in } = response.data;
  
  // Calculate new expiration
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);
  
  // Update session in database
  const updatedSession = await Session.findByIdAndUpdate(
    session._id,
    {
      accessToken: access_token,
      expiresAt
    },
    { new: true }
  );
  
  return updatedSession;
};

module.exports = { isAuthenticated, refreshSpotifyToken };