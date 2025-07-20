const mongoose = require('mongoose');
const crypto = require('crypto');

const userSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomUUID(),
  },
  
  // User inputs (anonymized)
  preferences: {
    favoriteColor: String,
    name: String, // Will be hashed for privacy
  },
  
  // Technical data
  deviceInfo: {
    userAgent: String,
    screenResolution: String,
    language: String,
    timezone: String,
  },
  
  // Location data (anonymized)
  location: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    ipHash: String, // Hashed IP for privacy
  },
  
  // Behavioral analytics
  interactions: [{
    action: String,
    timestamp: Date,
    elementId: String,
    value: mongoose.Schema.Types.Mixed,
    sentiment: {
      score: Number,
      comparative: Number,
      tokens: [String],
    },
  }],
  
  // Personalization data
  personalityProfile: {
    traits: {
      openness: Number,
      conscientiousness: Number,
      extraversion: Number,
      agreeableness: Number,
      neuroticism: Number,
    },
    preferences: {
      colorScheme: String,
      interactionStyle: String,
      contentType: String,
    },
    adaptations: [{
      type: String,
      value: mongoose.Schema.Types.Mixed,
      effectiveness: Number,
      timestamp: Date,
    }],
  },
  
  // Engagement metrics
  engagement: {
    totalTimeSpent: Number, // in seconds
    pagesVisited: Number,
    actionsCompleted: Number,
    dropoffPoints: [String],
    completionRate: Number,
    satisfactionScore: Number,
  },
  
  // Privacy and compliance
  permissions: {
    location: Boolean,
    camera: Boolean,
    microphone: Boolean,
    analytics: Boolean,
  },
  
  // Meta information
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + (process.env.DATA_RETENTION_DAYS || 365) * 24 * 60 * 60 * 1000),
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Indexes for performance
userSessionSchema.index({ sessionId: 1 });
userSessionSchema.index({ createdAt: 1 });
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
userSessionSchema.index({ 'personalityProfile.traits': 1 });

// Pre-save middleware to update timestamps
userSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods for data anonymization
userSessionSchema.methods.anonymizePersonalData = function() {
  if (this.preferences.name) {
    this.preferences.name = crypto.createHash('sha256')
      .update(this.preferences.name)
      .digest('hex')
      .substring(0, 8);
  }
  
  if (this.location.coordinates) {
    // Round coordinates to reduce precision for privacy
    this.location.coordinates.lat = Math.round(this.location.coordinates.lat * 100) / 100;
    this.location.coordinates.lng = Math.round(this.location.coordinates.lng * 100) / 100;
  }
  
  return this;
};

// Static methods for analytics
userSessionSchema.statics.getEngagementMetrics = async function(timeRange = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate }, isActive: true } },
    {
      $group: {
        _id: null,
        avgTimeSpent: { $avg: '$engagement.totalTimeSpent' },
        avgCompletionRate: { $avg: '$engagement.completionRate' },
        avgSatisfactionScore: { $avg: '$engagement.satisfactionScore' },
        totalSessions: { $sum: 1 },
        uniqueUsers: { $addToSet: '$sessionId' },
      }
    },
  ]);
};

userSessionSchema.statics.getPersonalityDistribution = async function() {
  return this.aggregate([
    { $match: { isActive: true, 'personalityProfile.traits': { $exists: true } } },
    {
      $group: {
        _id: null,
        avgOpenness: { $avg: '$personalityProfile.traits.openness' },
        avgConscientiousness: { $avg: '$personalityProfile.traits.conscientiousness' },
        avgExtraversion: { $avg: '$personalityProfile.traits.extraversion' },
        avgAgreeableness: { $avg: '$personalityProfile.traits.agreeableness' },
        avgNeuroticism: { $avg: '$personalityProfile.traits.neuroticism' },
      }
    },
  ]);
};

module.exports = mongoose.model('UserSession', userSessionSchema);
