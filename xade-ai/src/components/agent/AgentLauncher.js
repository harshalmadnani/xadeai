import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SocialAgentLauncher.css';
import TradingAgentLauncher from './TradingAgentLauncher';
import SocialAgentLauncher from './SocialAgentLauncher';

const AgentLauncher = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAgentType, setSelectedAgentType] = useState(null);

  const slides = [
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture.png', 
      title: 'Create your own\nAI-agent in a few clicks', 
      content: 'Launch and scale your AI-Agents with unprecedented ease and speed' 
    },
    {
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture2.png',
      title: 'What kind of agents do you want to deploy?',
      content: '',
      hasAgentTypes: true
    }
  ];

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAgentTypeSelect = (type) => {
    setSelectedAgentType(type);
  };

  // If a specific agent type is selected, render that component
  if (selectedAgentType === 'trading') {
    return <TradingAgentLauncher />;
  } else if (selectedAgentType === 'social') {
    return <SocialAgentLauncher />;
  }

  // Otherwise, show the selection interface
  return (
    <div className="agent-launcher-container">
      <div className="progress-bar-container">
        <div 
          className="progress-bar"
          style={{
            width: `${((currentStep + 1) / slides.length) * 100}%`,
            height: '4px',
            backgroundColor: '#FFFFFF',
            borderRadius: '2px',
            transition: 'width 0.3s ease-in-out'
          }}
        />
        <div style={{ 
          color: 'white', 
          fontSize: '14px', 
          marginTop: '8px',
          textAlign: 'right'
        }}>
          {`Step ${currentStep + 1} of ${slides.length}`}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="slide-container"
        >
          <div className="slide-content">
            <div className="image-container">
              <img 
                src={slides[currentStep].image} 
                alt={`Step ${currentStep + 1}`}
                className="slide-image"
              />
            </div>
            
            <div className="content-container">
              <h2 style={{ marginBottom: '1.5rem' }}>{slides[currentStep].title}</h2>
              <p style={{ marginBottom: '1.5rem' }}>{slides[currentStep].content}</p>
              
              {currentStep === 0 ? (
                <button 
                  className="next-button"
                  onClick={handleNext}
                  style={{ marginTop: '1rem' }}
                >
                  Let's get started
                </button>
              ) : currentStep === 1 ? (
                <div style={{ width: '90%' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div
                      onClick={() => handleAgentTypeSelect('trading')}
                      style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        border: selectedAgentType === 'trading' ? '1px solid white' : '1px solid transparent'
                      }}
                    >
                      <img 
                        src="https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture8.png" 
                        alt="Trading Agents"
                        style={{
                          width: '100%',
                          height: 'auto',
                          marginBottom: '8px',
                          borderRadius: '8px'
                        }}
                      />
                      <p style={{ margin: 0, textAlign: 'center' }}>Trading Agents</p>
                    </div>
                    
                    <div
                      onClick={() => handleAgentTypeSelect('social')}
                      style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        border: selectedAgentType === 'social' ? '1px solid white' : '1px solid transparent'
                      }}
                    >
                      <img 
                        src="https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture9.png" 
                        alt="Social Agents"
                        style={{
                          width: '100%',
                          height: 'auto',
                          marginBottom: '8px',
                          borderRadius: '8px'
                        }}
                      />
                      <p style={{ margin: 0, textAlign: 'center' }}>Social Agents</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AgentLauncher;