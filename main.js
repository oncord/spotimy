const express = require('express');
const session = require('express-session');
const axios = require('axios');
const querystring = require('querystring');
const dotenv = require('dotenv');
const path = require('path');

// load environment variables from .env file
dotenv.config();

const app = express();
const port = 5000;

// spotify api credentials
const CLIENT_ID = process.env.CLIENT_ID || '3ca7761aaef0477bb0c7755f34f1e842';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'b3094fd2d69648819d4f2f8c72c34e88';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5000/callback';

const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE_URL = 'https://api.spotify.com/v1/';

// middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'kazyfygsxadknqcvzslkcmdqmgupkutz', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // after development set true
  })
);



// home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// login route
app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email playlist-read-private';
  const params = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope,
    show_dialog: true,
  });

  res.sendFile(path.join(__dirname, 'public', 'login.html'));

  res.redirect(`${AUTH_URL}?${params}`);
});

// callback route
app.get('/callback', async (req, res) => {
  const { error, code } = req.query;

  if (error) {
    return res.json({ error });
  }

  if (code) {
    try {
      const response = await axios.post(
        TOKEN_URL,
        querystring.stringify({
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      req.session.access_token = access_token;
      req.session.refresh_token = refresh_token;
      req.session.expires_at = Date.now() + expires_in * 1000;

      res.redirect('/playlists');
    } catch (err) {
      res.status(500).json({ error: 'Failed to exchange token', details: err.message });
    }
  }
});

// playlists route
app.get('/api/playlists', async (req, res) => {
  if (!req.session.access_token) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    const response = await axios.get(`${API_BASE_URL}me/playlists`, {
      headers: {Authorization: `Bearer ${req.session.access_token}` },
    });

    res.json(response.data); // sending playlists to frontend
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch playlists', details: err.message });
  }
});

// serve playlists route
app.get('/playlists', (req,res) => {
  res.sendFile(path.join(__dirname, 'playlists.html'));
});

// refresh token route
app.get('/refresh-token', async (req, res) => {
  if (!req.session.refresh_token) {
    return res.redirect('/login');
  }

  try {
    const response = await axios.post(
      TOKEN_URL,
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: req.session.refresh_token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token, expires_in } = response.data;

    req.session.access_token = access_token;
    req.session.expires_at = Date.now() + expires_in * 1000;

    res.redirect('/playlists');
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh token', details: err.message });
  }
});

// initialize server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
