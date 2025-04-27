const cron = require('node-cron');
const User = require('../models/User');
const Session = require('../models/Session');
const axios = require('axios');
const Analytics = require('../models/Analytics');

// Helper function to store analytics data
const storeAnalyticsData = async (userId, accessToken, dataType, timeRange) => {
  try {
    let endpoint;
    
    switch (dataType) {
      case 'tracks':
        endpoint = 'https://api.spotify.com/v1/me/top/tracks';
        break;
      case 'artists':
        endpoint = 'https://api.spotify.com/v1/me/top/artists';
        break;
      default:
        throw new Error(`Invalid data type: ${dataType}`);
    }
    
    const response = await axios.get(endpoint, {
      params: {
        limit: 50,
        time_range: timeRange
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // For genres, we need to process the artist data
    if (dataType === 'artists') {
      // Also store genres data based on artists
      const artists = response.data.items;
      const genreCounts = {};
      
      artists.forEach(artist => {
        artist.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      });
      
      const sortedGenres = Object.entries(genreCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      
      // Save genres data
      await Analytics.create({
        userId,
        dataType: 'genres',
        timeRange,
        data: sortedGenres,
        snapshot: response.data.snapshot_id || null
      });
    }
    
    // Save the original data
    await Analytics.create({
      userId,
      dataType,
      timeRange,
      data: response.data.items,
      snapshot: response.data.snapshot_id || null
    });
    
    console.log(`Stored ${dataType} analytics for user ${userId} with timeRange ${timeRange}`);
  } catch (error) {
    console.error(`Error storing ${dataType} analytics:`, error);
  }
};

// Function to refresh token - simplified version
const refreshSpotifyToken = async (session) => {
  try {
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
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Schedule analytics collection for all active users
const scheduleAnalyticsCollection = () => {
  // Run once per day at 3 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('Running scheduled analytics collection');
    
    try {
      // Get all users with active sessions
      const sessions = await Session.find({
        expiresAt: { $gt: new Date() }
      });
      
      // For each user with an active session
      for (const session of sessions) {
        try {
          // Ensure token is fresh
          let accessToken = session.accessToken;
          
          // If token is about to expire, refresh it
          if (new Date(session.expiresAt).getTime() - Date.now() < 3600000) {
            const refreshedSession = await refreshSpotifyToken(session);
            accessToken = refreshedSession.accessToken;
          }
          
          // Store data for each time range and type
          const timeRanges = ['short_term', 'medium_term', 'long_term'];
          const dataTypes = ['tracks', 'artists'];
          
          for (const timeRange of timeRanges) {
            for (const dataType of dataTypes) {
              await storeAnalyticsData(session.userId, accessToken, dataType, timeRange);
            }
          }
          
          console.log(`Completed analytics collection for user ${session.userId}`);
        } catch (userError) {
          console.error(`Error collecting analytics for user ${session.userId}:`, userError);
        }
      }
      
      console.log('Scheduled analytics collection completed');
    } catch (error) {
      console.error('Error in scheduled analytics collection:', error);
    }
  });
  
  console.log('Analytics collection scheduled');
};

module.exports = { scheduleAnalyticsCollection, refreshSpotifyToken };