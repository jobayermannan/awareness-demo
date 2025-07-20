const express = require('express');
const router = express.Router();
const BehavioralPattern = require('../models/BehavioralPattern');

// GET /api/analytics/patterns - Get behavioral patterns
router.get('/patterns', async (req, res) => {
  try {
    const patterns = await BehavioralPattern.find()
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json({
      success: true,
      data: patterns,
      total: patterns.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch behavioral patterns'
    });
  }
});

// POST /api/analytics/track - Track user interaction
router.post('/track', async (req, res) => {
  try {
    const { userId, action, data, metadata } = req.body;
    
    const pattern = new BehavioralPattern({
      userId,
      action,
      data,
      metadata,
      timestamp: new Date()
    });
    
    await pattern.save();
    
    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to track interaction'
    });
  }
});

// GET /api/analytics/insights/:userId - Get user insights
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const patterns = await BehavioralPattern.find({ userId })
      .sort({ timestamp: -1 });
    
    // Calculate insights
    const insights = {
      totalInteractions: patterns.length,
      mostCommonAction: getMostCommonAction(patterns),
      activityTimeline: getActivityTimeline(patterns),
      preferences: extractPreferences(patterns)
    };
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights'
    });
  }
});

function getMostCommonAction(patterns) {
  const actionCounts = {};
  patterns.forEach(pattern => {
    actionCounts[pattern.action] = (actionCounts[pattern.action] || 0) + 1;
  });
  
  return Object.keys(actionCounts).reduce((a, b) => 
    actionCounts[a] > actionCounts[b] ? a : b
  );
}

function getActivityTimeline(patterns) {
  return patterns.slice(0, 10).map(pattern => ({
    action: pattern.action,
    timestamp: pattern.timestamp,
    data: pattern.data
  }));
}

function extractPreferences(patterns) {
  const preferences = {};
  patterns.forEach(pattern => {
    if (pattern.data && typeof pattern.data === 'object') {
      Object.keys(pattern.data).forEach(key => {
        if (!preferences[key]) preferences[key] = [];
        preferences[key].push(pattern.data[key]);
      });
    }
  });
  
  return preferences;
}

module.exports = router;
