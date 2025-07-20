import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PersonalityQuiz = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    favoriteColor: '',
    interests: [],
    mood: '',
    goals: []
  });
  const [location, setLocation] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    // Collect device info
    setDeviceInfo({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    // Get location if permission granted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.log('Location access denied')
      );
    }
  }, []);

  const steps = [
    {
      title: "Welcome! Let's get to know you",
      component: (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 style={{ marginBottom: '20px', color: '#667eea' }}>What's your name?</h2>
          <input
            type="text"
            className="input"
            placeholder="Enter your name..."
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{ marginBottom: '20px' }}
          />
        </motion.div>
      )
    },
    {
      title: "Tell us about your preferences",
      component: (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 style={{ marginBottom: '20px', color: '#667eea' }}>What's your favorite color?</h2>
          <input
            type="text"
            className="input"
            placeholder="e.g., Blue, Red, Green..."
            value={formData.favoriteColor}
            onChange={(e) => setFormData({...formData, favoriteColor: e.target.value})}
            style={{ marginBottom: '20px' }}
          />
        </motion.div>
      )
    },
    {
      title: "Your interests matter",
      component: (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 style={{ marginBottom: '20px', color: '#667eea' }}>What interests you most?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {['Technology', 'Art', 'Music', 'Sports', 'Reading', 'Travel', 'Cooking', 'Gaming'].map((interest) => (
              <motion.button
                key={interest}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`btn ${formData.interests.includes(interest) ? 'selected' : ''}`}
                style={{
                  background: formData.interests.includes(interest) 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#f8f9fa',
                  color: formData.interests.includes(interest) ? 'white' : '#333'
                }}
                onClick={() => {
                  const newInterests = formData.interests.includes(interest)
                    ? formData.interests.filter(i => i !== interest)
                    : [...formData.interests, interest];
                  setFormData({...formData, interests: newInterests});
                }}
              >
                {interest}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )
    },
    {
      title: "How are you feeling today?",
      component: (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 style={{ marginBottom: '20px', color: '#667eea' }}>Current mood?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
            {[
              { mood: 'Happy', emoji: '😊' },
              { mood: 'Excited', emoji: '🤩' },
              { mood: 'Calm', emoji: '😌' },
              { mood: 'Curious', emoji: '🤔' },
              { mood: 'Creative', emoji: '🎨' },
              { mood: 'Focused', emoji: '🎯' }
            ].map(({ mood, emoji }) => (
              <motion.button
                key={mood}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn"
                style={{
                  background: formData.mood === mood 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#f8f9fa',
                  color: formData.mood === mood ? 'white' : '#333',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px'
                }}
                onClick={() => setFormData({...formData, mood})}
              >
                <span style={{ fontSize: '24px' }}>{emoji}</span>
                {mood}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const userData = {
      ...formData,
      location,
      deviceInfo,
      timestamp: new Date().toISOString(),
      sessionId: Math.random().toString(36).substr(2, 9)
    };

    onComplete(userData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.name.trim() !== '';
      case 1: return formData.favoriteColor.trim() !== '';
      case 2: return formData.interests.length > 0;
      case 3: return formData.mood !== '';
      default: return true;
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {steps[currentStep].component}
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <button 
          className="btn"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          style={{ 
            opacity: currentStep === 0 ? 0.5 : 1,
            background: '#f8f9fa',
            color: '#333'
          }}
        >
          Previous
        </button>

        <span style={{ color: 'white', fontWeight: 'bold' }}>
          Step {currentStep + 1} of {steps.length}
        </span>

        <motion.button 
          className="btn"
          onClick={handleNext}
          disabled={!canProceed()}
          whileHover={canProceed() ? { scale: 1.05 } : {}}
          whileTap={canProceed() ? { scale: 0.95 } : {}}
          style={{ 
            opacity: canProceed() ? 1 : 0.5,
            cursor: canProceed() ? 'pointer' : 'not-allowed'
          }}
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </motion.button>
      </div>
    </div>
  );
};

export default PersonalityQuiz;
