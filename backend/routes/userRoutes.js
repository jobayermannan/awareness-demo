const express = require('express');
const { body, validationResult } = require('express-validator');
const UserSession = require('../models/UserSession');
const { analyzeSentiment } = require('../services/sentimentService');
const { calculatePersonalityTraits } = require('../services/personalityService');
const { hashIP } = require('../utils/privacy');

const router = express.Router();

// Create new user session
router.post('/session', [
  body('deviceInfo').optional().isObject(),
  body('preferences').optional().isObject(),
  body('permissions').optional().isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const sessionData = {
      deviceInfo: req.body.deviceInfo || {},
      preferences: req.body.preferences || {},
      permissions: req.body.permissions || {},
      location: {
        ...req.body.location,
        ipHash: req.ip ? hashIP(req.ip) : null,
      },
    };

    const userSession = new UserSession(sessionData);
    
    // Anonymize personal data if enabled
    if (process.env.ANONYMIZE_DATA === 'true') {
      userSession.anonymizePersonalData();
    }

    await userSession.save();

    res.status(201).json({
      success: true,
      sessionId: userSession.sessionId,
      message: 'Session created successfully',
    });
  } catch (error) {
    console.error('Error creating user session:', error);
    res.status(500).json({
      error: 'Failed to create session',
      message: error.message,
    });
  }
});

// Update user session with new data
router.put('/session/:sessionId', [
  body('preferences').optional().isObject(),
  body('interactions').optional().isArray(),
  body('engagement').optional().isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { sessionId } = req.params;
    const updateData = {};

    // Handle preferences update
    if (req.body.preferences) {
      updateData.preferences = { ...req.body.preferences };
    }

    // Handle new interactions
    if (req.body.interactions) {
      const processedInteractions = await Promise.all(
        req.body.interactions.map(async (interaction) => {
          const sentiment = await analyzeSentiment(interaction.value);
          return {
            ...interaction,
            timestamp: new Date(),
            sentiment,
          };
        })
      );

      updateData.$push = {
        interactions: { $each: processedInteractions },
      };
    }

    // Handle engagement metrics
    if (req.body.engagement) {
      updateData.engagement = { ...req.body.engagement };
    }

    const userSession = await UserSession.findOneAndUpdate(
      { sessionId, isActive: true },
      updateData,
      { new: true }
    );

    if (!userSession) {
      return res.status(404).json({
        error: 'Session not found',
      });
    }

    // Calculate personality traits if we have enough data
    if (userSession.interactions.length >= 3) {
      const personalityTraits = calculatePersonalityTraits(userSession);
      userSession.personalityProfile.traits = personalityTraits;
      await userSession.save();
    }

    res.json({
      success: true,
      message: 'Session updated successfully',
      personalityProfile: userSession.personalityProfile,
    });
  } catch (error) {
    console.error('Error updating user session:', error);
    res.status(500).json({
      error: 'Failed to update session',
      message: error.message,
    });
  }
});

// Get user session data
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const userSession = await UserSession.findOne({
      sessionId,
      isActive: true,
    }).select('-interactions -location.ipHash'); // Exclude sensitive data

    if (!userSession) {
      return res.status(404).json({
        error: 'Session not found',
      });
    }

    res.json({
      success: true,
      data: userSession,
    });
  } catch (error) {
    console.error('Error fetching user session:', error);
    res.status(500).json({
      error: 'Failed to fetch session',
      message: error.message,
    });
  }
});

// Record user interaction
router.post('/session/:sessionId/interaction', [
  body('action').notEmpty().trim().escape(),
  body('elementId').optional().trim().escape(),
  body('value').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { sessionId } = req.params;
    const { action, elementId, value } = req.body;

    // Analyze sentiment if there's text content
    let sentiment = null;
    if (typeof value === 'string' && value.trim()) {
      sentiment = await analyzeSentiment(value);
    }

    const interaction = {
      action,
      elementId,
      value,
      sentiment,
      timestamp: new Date(),
    };

    const userSession = await UserSession.findOneAndUpdate(
      { sessionId, isActive: true },
      {
        $push: { interactions: interaction },
        $inc: { 'engagement.actionsCompleted': 1 },
      },
      { new: true }
    );

    if (!userSession) {
      return res.status(404).json({
        error: 'Session not found',
      });
    }

    res.json({
      success: true,
      message: 'Interaction recorded',
      sentiment: sentiment,
    });
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({
      error: 'Failed to record interaction',
      message: error.message,
    });
  }
});

// Complete user session
router.post('/session/:sessionId/complete', [
  body('completionRate').optional().isFloat({ min: 0, max: 1 }),
  body('satisfactionScore').optional().isFloat({ min: 0, max: 10 }),
  body('feedback').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { sessionId } = req.params;
    const { completionRate, satisfactionScore, feedback } = req.body;

    const updateData = {
      'engagement.completionRate': completionRate || 1,
      'engagement.satisfactionScore': satisfactionScore,
    };

    // Add feedback as an interaction if provided
    if (feedback) {
      const sentiment = await analyzeSentiment(feedback);
      updateData.$push = {
        interactions: {
          action: 'feedback',
          value: feedback,
          sentiment,
          timestamp: new Date(),
        },
      };
    }

    const userSession = await UserSession.findOneAndUpdate(
      { sessionId, isActive: true },
      updateData,
      { new: true }
    );

    if (!userSession) {
      return res.status(404).json({
        error: 'Session not found',
      });
    }

    res.json({
      success: true,
      message: 'Session completed successfully',
      personalityProfile: userSession.personalityProfile,
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({
      error: 'Failed to complete session',
      message: error.message,
    });
  }
});

module.exports = router;
