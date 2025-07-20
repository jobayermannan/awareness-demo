const mongoose = require('mongoose');

const behavioralPatternSchema = new mongoose.Schema({
  patternId: {
    type: String,
    required: true,
    unique: true,
  },
  
  // Pattern identification
  patternType: {
    type: String,
    enum: ['navigation', 'interaction', 'preference', 'engagement', 'sentiment'],
    required: true,
  },
  
  // Pattern data
  triggers: [{
    condition: String,
    threshold: Number,
    weight: Number,
  }],
  
  // Behavioral insights
  insights: {
    frequency: Number,
    confidence: Number,
    userSegments: [String],
    effectivenessScore: Number,
  },
  
  // Adaptation recommendations
  adaptations: [{
    type: String,
    description: String,
    implementation: mongoose.Schema.Types.Mixed,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    expectedImpact: Number,
  }],
  
  // Usage statistics
  usage: {
    timesApplied: Number,
    successRate: Number,
    avgImprovementScore: Number,
    lastUsed: Date,
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
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Indexes
behavioralPatternSchema.index({ patternType: 1 });
behavioralPatternSchema.index({ 'insights.confidence': -1 });
behavioralPatternSchema.index({ 'adaptations.priority': 1 });

// Pre-save middleware
behavioralPatternSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('BehavioralPattern', behavioralPatternSchema);
