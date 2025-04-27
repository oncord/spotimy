const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  dataType: {
    type: String,
    enum: ['tracks', 'artists', 'genres'],
    required: true
  },
  timeRange: {
    type: String,
    enum: ['short_term', 'medium_term', 'long_term'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  snapshot: {
    type: String,  // Store Spotify's snapshot ID to track changes over time
    default: null
  }
});

// Compound index to quickly find analytics by user and type
AnalyticsSchema.index({ userId: 1, dataType: 1, timeRange: 1, date: -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);