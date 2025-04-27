// dependencies
const express = require('express');
const router = express.Router();
const axios = require('axios');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

// Spotify authentication routes
router.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email user-top-read user-read-recently-played user-library-read playlist-read-private';
 
  const params = querystring.stringify({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope,
    show_dialog: true,
  });

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${params}`;

  console.log(`Authorization URL: ${spotifyAuthUrl}`);
  console.log(`Redirect URI being used: ${process.env.SPOTIFY_REDIRECT_URI}`);

  res.redirect(spotifyAuthUrl);
});

// callback route
router.get('/callback', async (req, res) => {
  console.log('callback hit');

  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}?error=access_denied`);
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user profile from Spotify
    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    const userProfile = profileResponse.data;

    // Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    // Store or update user in database
    const user = await User.findOneAndUpdate(
      { spotifyId: userProfile.id },
      {
        email: userProfile.email,
        displayName: userProfile.display_name,
        profileImage: userProfile.images?.[0]?.url,
        country: userProfile.country,
        premium: userProfile.product === 'premium',
        lastLogin: new Date()
      },
      { upsert: true, new: true }
    );

    // Store session in database
    const session = await Session.findOneAndUpdate(
      { userId: userProfile.id },
      {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt
      },
      { upsert: true, new: true }
    );

    // Store just the minimal info in the session cookie
    req.session.spotify = {
      userId: userProfile.id
    };

    console.log(`Session set:`, JSON.stringify(req.session.spotify, null, 2));

    // Redirect to client
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (error) {
    console.error('Spotify authentication error:', error);
    res.redirect(`${process.env.CLIENT_URL}?error=authentication_failed`);
  }
});

// check authentication status
router.get('/status', async (req, res) => {
  if (!req.session.spotify || !req.session.spotify.userId) {
    return res.status(401).json({ isAuthenticated: false });
  }
  
  try {
    // Check if there's a valid session in the database
    const session = await Session.findOne({ 
      userId: req.session.spotify.userId,
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) {
      return res.status(401).json({ isAuthenticated: false });
    }
    
    return res.status(200).json({ isAuthenticated: true });
  } catch (error) {
    console.error('Error checking auth status:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// logout route
router.get('/logout', async (req, res) => {
  try {
    if (req.session.spotify && req.session.spotify.userId) {
      // Optional: Mark the session as expired in the database
      await Session.updateMany(
        { userId: req.session.spotify.userId },
        { expiresAt: new Date() }
      );
    }
    
    req.session.destroy();
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

module.exports = router;