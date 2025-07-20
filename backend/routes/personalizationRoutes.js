const express = require('express');
const router = express.Router();
const UserSession = require('../models/UserSession');
const { personalityService } = require('../services/personalityService');
const { personalizationService } = require('../services/personalizationService');

// GET /api/personalization/profile/:userId - Get personalized profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userSession = await UserSession.findOne({ userId })
      .sort({ lastActivity: -1 });
    
    if (!userSession) {
      return res.status(404).json({
        success: false,
        error: 'User session not found'
      });
    }
    
    const personalizedContent = await personalizationService.generateContent(userSession);
    
    res.json({
      success: true,
      data: {
        profile: userSession,
        personalizedContent,
        recommendations: await personalizationService.getRecommendations(userId)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personalized profile'
    });
  }
});

// POST /api/personalization/update-preferences - Update user preferences
router.post('/update-preferences', async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    
    const userSession = await UserSession.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          preferences: { ...preferences },
          lastActivity: new Date()
        }
      },
      { new: true, upsert: true }
    );
    
    res.json({
      success: true,
      data: userSession,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

// POST /api/personalization/adaptive-ui - Get adaptive UI suggestions
router.post('/adaptive-ui', async (req, res) => {
  try {
    const { userId, currentContext } = req.body;
    
    const adaptations = await personalizationService.getUIAdaptations(userId, currentContext);
    
    res.json({
      success: true,
      data: adaptations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate UI adaptations'
    });
  }
});

// GET /api/personalization/recommendations/:userId - Get personalized recommendations
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, limit = 10 } = req.query;
    
    const recommendations = await personalizationService.getRecommendations(
      userId, 
      { category, limit: parseInt(limit) }
    );
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations'
    });
  }
});

module.exports = router;
