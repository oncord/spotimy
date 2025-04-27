const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const User = require('../models/User');

// Get user data
router.get('/user', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ spotifyId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't send sensitive info
    const userData = {
      id: user._id,
      spotifyId: user.spotifyId,
      email: user.email,
      displayName: user.displayName,
      profileImage: user.profileImage,
      country: user.country,
      premium: user.premium,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      preferences: user.preferences
    };
    
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Get user preferences
router.get('/preferences', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ spotifyId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user.preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update user preferences
router.put('/preferences', isAuthenticated, async (req, res) => {
  try {
    const { theme, defaultTimeRange, showExplicitContent } = req.body;
    
    const preferences = {};
    
    if (theme !== undefined) {
      if (!['light', 'dark'].includes(theme)) {
        return res.status(400).json({ error: 'Invalid theme value' });
      }
      preferences.theme = theme;
    }
    
    if (defaultTimeRange !== undefined) {
      if (!['short_term', 'medium_term', 'long_term'].includes(defaultTimeRange)) {
        return res.status(400).json({ error: 'Invalid time range value' });
      }
      preferences.defaultTimeRange = defaultTimeRange;
    }
    
    if (showExplicitContent !== undefined) {
      if (typeof showExplicitContent !== 'boolean') {
        return res.status(400).json({ error: 'Show explicit content must be boolean' });
      }
      preferences.showExplicitContent = showExplicitContent;
    }
    
    const user = await User.findOneAndUpdate(
      { spotifyId: req.userId },
      { $set: { 'preferences': { ...preferences } } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user.preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;