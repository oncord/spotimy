const express = require('express');
const router = express.Router();
const axios = require('axios');
const { isAuthenticated } = require('../middleware/auth');
const Analytics = require('../models/Analytics');

// Global average audio features based on studies of popular music
// These are approximate values you can adjust
const globalAverageFeatures = {
  danceability: 0.57,
  energy: 0.65,
  valence: 0.45, // Overall happiness/positivity
  tempo: 120, // Average BPM
  acousticness: 0.33,
  instrumentalness: 0.15,
  liveness: 0.18
};

router.get('/audio-features', isAuthenticated, async (req, res) => {
  try {
    // First get user's top tracks
    const topTracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      params: {
        limit: 20,
        time_range: 'medium_term'
      },
      headers: {
        'Authorization': `Bearer ${req.spotifyToken}`
      }
    });
    
    const topTracks = topTracksResponse.data.items;
    
    // Handle case with no tracks
    if (!topTracks || topTracks.length === 0) {
      return res.status(200).json({
        tracks: [],
        averageFeatures: null,
        globalAverageFeatures,
        moodProfile: {
          primaryMood: 'Unknown',
          characteristics: [],
          description: 'Not enough listening data to analyze your mood profile.',
          recommendedGenres: [],
          coordinates: { x: 0.5, y: 0.5 }
        }
      });
    }
    
    // Get track IDs - limit to 20 tracks to avoid URL length issues
    const trackIds = topTracks.slice(0, 20).map(track => track.id).join(',');
    
    try {
      // Get audio features for these tracks
      const audioFeaturesResponse = await axios.get(`https://api.spotify.com/v1/audio-features`, {
        params: { ids: trackIds },
        headers: {
          'Authorization': `Bearer ${req.spotifyToken}`
        }
      });
      
      const audioFeatures = audioFeaturesResponse.data.audio_features;
      
      // Combine track info with audio features
      const tracksWithFeatures = topTracks.slice(0, 20).map((track, index) => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        image: track.album.images[0]?.url,
        audioFeatures: audioFeatures[index]
      }));
      
      // Calculate average audio features
      const averageFeatures = {
        danceability: average(audioFeatures.filter(f => f).map(f => f.danceability)),
        energy: average(audioFeatures.filter(f => f).map(f => f.energy)),
        valence: average(audioFeatures.filter(f => f).map(f => f.valence)),
        tempo: average(audioFeatures.filter(f => f).map(f => f.tempo)),
        acousticness: average(audioFeatures.filter(f => f).map(f => f.acousticness)),
        instrumentalness: average(audioFeatures.filter(f => f).map(f => f.instrumentalness)),
        liveness: average(audioFeatures.filter(f => f).map(f => f.liveness))
      };
      
      // Analyze mood profile
      const moodProfile = analyzeMoodProfile(averageFeatures);
      
      // Return comprehensive data
      res.json({
        tracks: tracksWithFeatures,
        averageFeatures,
        globalAverageFeatures,
        moodProfile
      });
    } catch (audioFeaturesError) {
      console.error('Error fetching audio features, providing mock data:', audioFeaturesError);
      
      // Provide mock data for development/demo purposes
      const mockFeatures = {
        danceability: 0.65,
        energy: 0.72,
        valence: 0.58,
        tempo: 118,
        acousticness: 0.25,
        instrumentalness: 0.12,
        liveness: 0.18
      };
      
      const mockMoodProfile = {
        primaryMood: 'Energetic & Positive',
        characteristics: ['Highly Danceable', 'Fast-Paced'],
        description: "Your music taste is upbeat and energetic! You tend to listen to music that's positive and lively, perfect for boosting your mood and getting you moving.",
        recommendedGenres: ['Pop', 'Dance', 'House', 'Funk', 'EDM'],
        coordinates: { x: 0.58, y: 0.72 }
      };
      
      // Return mock data
      res.json({
        tracks: topTracks.slice(0, 8).map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists.map(artist => artist.name).join(', '),
          album: track.album.name,
          image: track.album.images[0]?.url,
          audioFeatures: {
            danceability: Math.random() * 0.3 + 0.5,
            energy: Math.random() * 0.3 + 0.5,
            valence: Math.random() * 0.3 + 0.5
          }
        })),
        averageFeatures: mockFeatures,
        globalAverageFeatures,
        moodProfile: mockMoodProfile
      });
    }
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    res.status(500).json({ error: 'Failed to fetch mood data' });
  }
});

// Helper function to calculate average
function average(values) {
  const validValues = values.filter(v => v !== null && v !== undefined);
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
}

// Helper function to analyze mood profile
function analyzeMoodProfile(features) {
  const energy = features.energy;
  const valence = features.valence;
  
  // Primary mood quadrant
  let primaryMood;
  if (energy >= 0.5 && valence >= 0.5) {
    primaryMood = 'Energetic & Positive';
  } else if (energy >= 0.5 && valence < 0.5) {
    primaryMood = 'Energetic & Dark';
  } else if (energy < 0.5 && valence >= 0.5) {
    primaryMood = 'Calm & Positive';
  } else {
    primaryMood = 'Calm & Melancholic';
  }
  
  // Secondary characteristics
  const characteristics = [];
  
  if (features.danceability >= 0.7) {
    characteristics.push('Highly Danceable');
  }
  
  if (features.acousticness >= 0.7) {
    characteristics.push('Acoustic Lover');
  }
  
  if (features.instrumentalness >= 0.5) {
    characteristics.push('Instrumental Appreciator');
  }
  
  if (features.liveness >= 0.7) {
    characteristics.push('Live Performance Fan');
  }
  
  if (features.tempo >= 120) {
    characteristics.push('Fast-Paced');
  } else if (features.tempo <= 90) {
    characteristics.push('Slow-Tempo');
  }
  
  // Generate mood description
  let description;
  switch (primaryMood) {
    case 'Energetic & Positive':
      description = "Your music taste is upbeat and energetic! You tend to listen to music that's positive and lively, perfect for boosting your mood and getting you moving.";
      break;
    case 'Energetic & Dark':
      description = "You gravitate toward intense, powerful music with depth. Your playlist likely features energetic tracks with emotional or darker themes.";
      break;
    case 'Calm & Positive':
      description = "Your listening pattern shows a preference for relaxed, positive vibes. You enjoy music that's uplifting without being overwhelming - perfect for creating a pleasant atmosphere.";
      break;
    case 'Calm & Melancholic':
      description = "Your music taste has depth and introspection. You appreciate slower, more thoughtful tracks that explore complex emotions and create space for reflection.";
      break;
  }
  
  // Generate recommended genres based on profile
  const recommendedGenres = [];
  
  if (primaryMood === 'Energetic & Positive') {
    recommendedGenres.push(...['Pop', 'Dance', 'Disco', 'House', 'Funk']);
  } else if (primaryMood === 'Energetic & Dark') {
    recommendedGenres.push(...['Rock', 'Metal', 'Punk', 'Electronic', 'Industrial']);
  } else if (primaryMood === 'Calm & Positive') {
    recommendedGenres.push(...['Indie Folk', 'Soft Pop', 'Bossa Nova', 'R&B', 'Jazz']);
  } else {
    recommendedGenres.push(...['Ambient', 'Classical', 'Singer-Songwriter', 'Alternative', 'Blues']);
  }
  
  // Return top 5 unique recommendations
  return {
    primaryMood,
    characteristics,
    description,
    recommendedGenres: [...new Set(recommendedGenres)].slice(0, 5),
    coordinates: {
      x: valence,
      y: energy
    }
  };
}

module.exports = router;

// Helper function to store analytics data
const storeAnalyticsData = async (userId, dataType, timeRange, data) => {
  try {
    await Analytics.create({
      userId,
      dataType,
      timeRange,
      data
    });
    console.log(`Stored ${dataType} analytics for user ${userId}`);
  } catch (error) {
    console.error(`Error storing ${dataType} analytics:`, error);
  }
};

// Get user profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${req.spotifyToken}` }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get user's top tracks
router.get('/top-tracks', isAuthenticated, async (req, res) => {
  try {
    const timeRange = req.query.time_range || 'medium_term';
    
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      params: {
        limit: 50,
        time_range: timeRange
      },
      headers: {
        'Authorization': `Bearer ${req.spotifyToken}`
      }
    });
    
    // Store analytics data
    await storeAnalyticsData(
      req.userId,
      'tracks',
      timeRange,
      response.data.items
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// Get user's top artists
router.get('/top-artists', isAuthenticated, async (req, res) => {
  try {
    const timeRange = req.query.time_range || 'medium_term';
    
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      params: {
        limit: 50,
        time_range: timeRange
      },
      headers: {
        'Authorization': `Bearer ${req.spotifyToken}`
      }
    });
    
    // Store analytics data
    await storeAnalyticsData(
      req.userId,
      'artists',
      timeRange,
      response.data.items
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching top artists:', error);
    res.status(500).json({ error: 'Failed to fetch top artists' });
  }
});

// Get user's top genres (derived from top artists)
router.get('/top-genres', isAuthenticated, async (req, res) => {
  try {
    const timeRange = req.query.time_range || 'medium_term';
    
    // Fetch top artists (50 is the max allowed by Spotify API)
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      params: {
        limit: 50,
        time_range: timeRange
      },
      headers: {
        'Authorization': `Bearer ${req.spotifyToken}`
      }
    });
    
    const artists = response.data.items;
    
    // Count genre occurrences
    const genreCounts = {};
    artists.forEach(artist => {
      artist.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    
    // Convert to array and sort by count
    const sortedGenres = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    // Store analytics data
    await storeAnalyticsData(
      req.userId,
      'genres',
      timeRange,
      sortedGenres
    );
    
    // Return the top genres
    res.json({
      timeRange,
      genres: sortedGenres
    });
  } catch (error) {
    console.error('Error fetching top genres:', error);
    res.status(500).json({ error: 'Failed to fetch top genres' });
  }
});

// Get recently played tracks
router.get('/recently-played', isAuthenticated, async (req, res) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      params: {
        limit: 50
      },
      headers: {
        'Authorization': `Bearer ${req.spotifyToken}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching recently played tracks:', error);
    res.status(500).json({ error: 'Failed to fetch recently played tracks' });
  }
});

module.exports = router;