const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    required: true,
    unique: true
  },
  email: String,
  displayName: String,
  profileImage: String,
  country: String,
  premium: Boolean,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    defaultTimeRange: {
      type: String,
      enum: ['short_term', 'medium_term', 'long_term'],
      default: 'medium_term'
    },
    showExplicitContent: {
      type: Boolean,
      default: true
    }
  }
});

module.exports = mongoose.model('User', UserSchema);
