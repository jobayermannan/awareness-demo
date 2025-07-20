import React, { useState, useEffect } from 'react';
import PersonalityQuiz from './components/PersonalityQuiz';
import Dashboard from './components/Dashboard';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('quiz');

  const handleQuizComplete = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/profile', userData);
      setUser(response.data.user);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Fallback to show dashboard anyway for demo purposes
      setUser(userData);
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="App">
      {currentView === 'quiz' && (
        <PersonalityQuiz onComplete={handleQuizComplete} />
      )}
      {currentView === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onBackToQuiz={() => setCurrentView('quiz')}
        />
      )}
    </div>
  );
}

export default App;
