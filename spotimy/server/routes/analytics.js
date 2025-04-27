const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Analytics = require('../models/Analytics');

// Get user's listening history over time
router.get('/history/trend', isAuthenticated, async (req, res) => {
    try {
      const { dataType, itemId, limit = 10 } = req.query;
      
      if (!dataType || !['tracks', 'artists', 'genres'].includes(dataType)) {
        return res.status(400).json({ error: 'Invalid data type' });
      }
      
      let query = {
        userId: req.userId,
        dataType
      };
      
      // Find the item's position over time
      const analyticsRecords = await Analytics.find(query)
        .sort({ date: -1 })
        .limit(parseInt(limit, 10));
      
      // For tracks and artists
      if (dataType !== 'genres' && itemId) {
        const trend = analyticsRecords.map(record => {
          const position = record.data.findIndex(item => item.id === itemId);
          return {
            date: record.date,
            position: position !== -1 ? position + 1 : null,
            timeRange: record.timeRange
          };
        });
        
        return res.status(200).json(trend);
      }
      
      // For genres
      if (dataType === 'genres') {
        const genreName = itemId; // For genres, itemId is the genre name
        
        if (genreName) {
          const trend = analyticsRecords.map(record => {
            const genreItem = record.data.find(g => g.name === genreName);
            return {
              date: record.date,
              count: genreItem ? genreItem.count : 0,
              position: genreItem ? record.data.indexOf(genreItem) + 1 : null,
              timeRange: record.timeRange
            };
          });
          
          return res.status(200).json(trend);
        }
      }
      
      // If no specific item, return the top items for each time period
      const history = analyticsRecords.map(record => ({
        date: record.date,
        timeRange: record.timeRange,
        top5: record.data.slice(0, 5).map(item => {
          if (dataType === 'tracks') {
            return {
              id: item.id,
              name: item.name,
              artist: item.artists.map(a => a.name).join(', ')
            };
          } else if (dataType === 'artists') {
            return {
              id: item.id,
              name: item.name,
              genres: item.genres.slice(0, 2)
            };
          } else {
            return {
              name: item.name,
              count: item.count
            };
          }
        })
      }));
      
      res.status(200).json(history);
    } catch (error) {
      console.error('Error fetching history trend:', error);
      res.status(500).json({ error: 'Failed to fetch history trend' });
    }
  });

// Get global trends data
router.get('/global-trends', isAuthenticated, async (req, res) => {
    try {
      // Get aggregated data from all users
      const topTracksByUsers = await Analytics.aggregate([
        { $match: { dataType: 'tracks', timeRange: 'medium_term' } },
        { $unwind: '$data' },
        { $group: {
            _id: '$data.id',
            name: { $first: '$data.name' },
            artist: { $first: { $arrayElemAt: ['$data.artists.name', 0] } },
            image: { $first: { $arrayElemAt: ['$data.album.images.url', 0] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
  
      const topArtistsByUsers = await Analytics.aggregate([
        { $match: { dataType: 'artists', timeRange: 'medium_term' } },
        { $unwind: '$data' },
        { $group: {
            _id: '$data.id',
            name: { $first: '$data.name' },
            genres: { $first: '$data.genres' },
            image: { $first: { $arrayElemAt: ['$data.images.url', 0] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
  
      const topGenresByUsers = await Analytics.aggregate([
        { $match: { dataType: 'genres', timeRange: 'medium_term' } },
        { $unwind: '$data' },
        { $group: {
            _id: '$data.name',
            name: { $first: '$data.name' },
            count: { $sum: '$data.count' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
  
      // Format the response
      const topTracks = topTracksByUsers.map(track => ({
        id: track._id,
        name: track.name,
        artist: track.artist,
        image: track.image || 'https://via.placeholder.com/50',
        popularity: Math.round((track.count / topTracksByUsers[0].count) * 100)
      }));
  
      const topArtists = topArtistsByUsers.map(artist => ({
        id: artist._id,
        name: artist.name,
        genres: artist.genres || [],
        image: artist.image || 'https://via.placeholder.com/50',
        popularity: Math.round((artist.count / topArtistsByUsers[0].count) * 100)
      }));
  
      const topGenres = topGenresByUsers.map(genre => ({
        name: genre.name,
        count: genre.count,
        popularity: Math.round((genre.count / topGenresByUsers[0].count) * 100)
      }));
  
      // Return formatted data
      res.status(200).json({
        topTracks,
        topArtists,
        topGenres
      });
    } catch (error) {
      console.error('Error fetching global trends:', error);
      res.status(500).json({ error: 'Failed to fetch global trends' });
    }
  });

// Get user's listening history trend
router.get('/analytics/history', isAuthenticated, async (req, res) => {
  try {
    const { dataType, timeRange, limit = 5 } = req.query;
    
    if (!dataType || !['tracks', 'artists', 'genres'].includes(dataType)) {
      return res.status(400).json({ error: 'Invalid data type' });
    }
    
    if (timeRange && !['short_term', 'medium_term', 'long_term'].includes(timeRange)) {
      return res.status(400).json({ error: 'Invalid time range' });
    }
    
    // Build query
    const query = {
      userId: req.userId,
      dataType
    };
    
    if (timeRange) {
      query.timeRange = timeRange;
    }
    
    const analytics = await Analytics.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit, 10));
    
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching analytics history:', error);
    res.status(500).json({ error: 'Failed to fetch analytics history' });
  }
});

// Get trends for a specific track or artist
router.get('/analytics/item-trend/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { dataType } = req.query;
    
    if (!dataType || !['tracks', 'artists'].includes(dataType)) {
      return res.status(400).json({ error: 'Invalid data type' });
    }
    
    const analytics = await Analytics.find({
      userId: req.userId,
      dataType
    })
    .sort({ date: -1 })
    .limit(10);
    
    // Process the analytics to find the position of the specified item over time
    const trend = analytics.map(record => {
      const items = record.data;
      const itemIndex = items.findIndex(item => item.id === id);
      return {
        date: record.date,
        position: itemIndex !== -1 ? itemIndex + 1 : null
      };
    }).filter(entry => entry.position !== null);
    
    res.status(200).json(trend);
  } catch (error) {
    console.error('Error fetching item trend:', error);
    res.status(500).json({ error: 'Failed to fetch item trend' });
  }
});

// Get listening statistics
router.get('/analytics/stats', isAuthenticated, async (req, res) => {
  try {
    // Get most recent analytics entries
    const trackStats = await Analytics.findOne({
      userId: req.userId,
      dataType: 'tracks'
    }).sort({ date: -1 });
    
    const artistStats = await Analytics.findOne({
      userId: req.userId,
      dataType: 'artists'
    }).sort({ date: -1 });
    
    const genreStats = await Analytics.findOne({
      userId: req.userId,
      dataType: 'genres'
    }).sort({ date: -1 });
    
    // Calculate statistics
    const stats = {
      topTrack: trackStats && trackStats.data.length > 0 ? trackStats.data[0] : null,
      topArtist: artistStats && artistStats.data.length > 0 ? artistStats.data[0] : null,
      topGenre: genreStats && genreStats.data.length > 0 ? genreStats.data[0] : null,
      uniqueArtists: artistStats ? artistStats.data.length : 0,
      uniqueGenres: genreStats ? genreStats.data.length : 0,
      lastUpdated: new Date(Math.max(
        trackStats ? trackStats.date.getTime() : 0,
        artistStats ? artistStats.date.getTime() : 0,
        genreStats ? genreStats.date.getTime() : 0
      ))
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;