import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Dashboard = ({ user, onBackToQuiz }) => {
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [behavioralInsights, setBehavioralInsights] = useState([]);

  useEffect(() => {
    // Simulate fetching analytics and recommendations
    fetchAnalytics();
    generateRecommendations();
    analyzeBehavior();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Simulate API call
      setAnalytics({
        engagementScore: Math.floor(Math.random() * 40) + 60,
        personalityType: getPersonalityType(),
        moodTrend: 'Positive',
        interactionCount: Math.floor(Math.random() * 20) + 5
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const getPersonalityType = () => {
    const types = {
      'Happy': 'Optimistic Explorer',
      'Excited': 'Energetic Innovator', 
      'Calm': 'Peaceful Thinker',
      'Curious': 'Knowledge Seeker',
      'Creative': 'Artistic Visionary',
      'Focused': 'Goal-Oriented Achiever'
    };
    return types[user.mood] || 'Unique Individual';
  };

  const generateRecommendations = () => {
    const baseRecommendations = [
      'Try a new creative project based on your interests',
      'Explore mindfulness techniques to enhance your current mood',
      'Connect with like-minded people in your area',
      'Set small daily goals aligned with your personality type'
    ];

    const personalizedRecs = user.interests.map(interest => 
      `Discover new ${interest.toLowerCase()} communities and resources`
    );

    setRecommendations([...baseRecommendations, ...personalizedRecs].slice(0, 6));
  };

  const analyzeBehavior = () => {
    setBehavioralInsights([
      `You show high engagement with ${user.interests[0] || 'creative'} content`,
      `Your ${user.mood.toLowerCase()} mood suggests optimal learning times in the morning`,
      `Based on your preferences, you're likely to enjoy collaborative activities`,
      `Your interaction pattern indicates a preference for visual learning`
    ]);
  };

  const moodColors = {
    'Happy': '#FFD93D',
    'Excited': '#FF6B6B', 
    'Calm': '#4ECDC4',
    'Curious': '#45B7D1',
    'Creative': '#96CEB4',
    'Focused': '#FFEAA7'
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#667eea', marginBottom: '10px' }}>
              Welcome back, {user.name}! 
            </h1>
            <p style={{ color: '#666', fontSize: '18px' }}>
              Your personalized dashboard awaits
            </p>
          </div>
          <button 
            className="btn"
            onClick={onBackToQuiz}
            style={{ background: '#f8f9fa', color: '#333' }}
          >
            Retake Quiz
          </button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Personality Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 style={{ color: '#667eea', marginBottom: '15px' }}>🎯 Your Profile</h2>
          <div style={{ marginBottom: '15px' }}>
            <strong>Personality Type:</strong>
            <div style={{ 
              background: moodColors[user.mood] || '#667eea',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '20px',
              display: 'inline-block',
              marginLeft: '10px',
              fontSize: '14px'
            }}>
              {analytics?.personalityType}
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Current Mood:</strong> {user.mood}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Favorite Color:</strong> 
            <span style={{ 
              background: user.favoriteColor.toLowerCase(),
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              marginLeft: '8px'
            }}>
              {user.favoriteColor}
            </span>
          </div>
          <div>
            <strong>Interests:</strong> {user.interests.join(', ')}
          </div>
        </motion.div>

        {/* Analytics */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 style={{ color: '#667eea', marginBottom: '15px' }}>📊 Analytics</h2>
          {analytics && (
            <div>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Engagement Score</span>
                  <span style={{ fontWeight: 'bold' }}>{analytics.engagementScore}%</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  background: '#e1e5e9', 
                  borderRadius: '4px', 
                  overflow: 'hidden',
                  marginTop: '5px'
                }}>
                  <div style={{ 
                    width: `${analytics.engagementScore}%`, 
                    height: '100%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    transition: 'width 1s ease'
                  }} />
                </div>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Mood Trend:</strong> {analytics.moodTrend}
              </div>
              <div>
                <strong>Interactions:</strong> {analytics.interactionCount} this session
              </div>
            </div>
          )}
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 style={{ color: '#667eea', marginBottom: '15px' }}>💡 Personalized Recommendations</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                style={{
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  borderLeft: '4px solid #667eea'
                }}
              >
                {rec}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Behavioral Insights */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 style={{ color: '#667eea', marginBottom: '15px' }}>🧠 Behavioral Insights</h2>
          <div>
            {behavioralInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                style={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  border: '1px solid rgba(102, 126, 234, 0.2)'
                }}
              >
                <span style={{ fontSize: '14px' }}>💭</span> {insight}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Device & Location Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 style={{ color: '#667eea', marginBottom: '15px' }}>🔧 Session Info</h2>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {user.deviceInfo && (
              <div>
                <div><strong>Platform:</strong> {user.deviceInfo.platform}</div>
                <div><strong>Language:</strong> {user.deviceInfo.language}</div>
                <div><strong>Timezone:</strong> {user.deviceInfo.timezone}</div>
                <div><strong>Screen:</strong> {user.deviceInfo.screenResolution}</div>
              </div>
            )}
            {user.location && (
              <div style={{ marginTop: '10px' }}>
                <strong>Location:</strong> Latitude {user.location.latitude.toFixed(2)}, 
                Longitude {user.location.longitude.toFixed(2)}
              </div>
            )}
            <div style={{ marginTop: '10px' }}>
              <strong>Session ID:</strong> {user.sessionId}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Real-time Features Simulation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
        style={{ marginTop: '20px' }}
      >
        <h2 style={{ color: '#667eea', marginBottom: '15px' }}>🚀 Adaptive Features</h2>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          This dashboard adapts in real-time based on your interactions, preferences, and behavioral patterns.
          The system uses machine learning to optimize your experience continuously.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ background: '#e8f4fd', color: '#1976d2', padding: '6px 12px', borderRadius: '16px', fontSize: '12px' }}>
            🎯 Micro-personalization Active
          </span>
          <span style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '6px 12px', borderRadius: '16px', fontSize: '12px' }}>
            🧠 Sentiment Analysis Running
          </span>
          <span style={{ background: '#e8f5e8', color: '#388e3c', padding: '6px 12px', borderRadius: '16px', fontSize: '12px' }}>
            📊 Behavioral Tracking Enabled
          </span>
          <span style={{ background: '#fff3e0', color: '#f57c00', padding: '6px 12px', borderRadius: '16px', fontSize: '12px' }}>
            ⚡ Real-time Adaptation
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
