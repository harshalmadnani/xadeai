import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './AgentLauncher.css';
import { useNavigate } from 'react-router-dom';


const AgentLauncher = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentImage, setAgentImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const Groq = require('groq-sdk');
  const groq = new Groq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    dangerouslyAllowBrowser: true 
  });
  
  const slides = [
    { image: '/picture.png', title: 'Create your own\nAI-agent in a few clicks', content: 'Launch and scale your AI-Agents with unprecedented ease and speed' },
    { 
      image: '/picture2.png', 
      title: 'It all starts with a name', 
      content: 'How should we call your Agent?',
      hasForm: true 
    },
    { 
      image: '/picture3.png', 
      title: `Let's upload the picture\nof ${agentName || 'your agent'}`, 
      content: '',
      hasUpload: true 
    },
    { 
      image: '/picture4.png', 
      title: `What do you want ${agentName || 'your agent'} to do?`, 
      content: 'Enter the prompt',
      hasPrompt: true 
    },
    { 
      image: '/picture5.png', 
      title: `What data sources do you want\n${agentName || 'your agent'} to use?`, 
      content: 'You can search for actions and sources',
      hasDataSources: true 
    },
    { 
      image: '/picture6.png', 
      title: `Would you like to\nconfigure X account\nfor ${agentName || 'your agent'} now?`, 
      content: '',
      hasXConfig: true 
    },
    { 
      image: '/picture7.png', 
      title: `What kind of activity do you want\n${agentName || 'your agent'} to do?`, 
      content: '',
      hasActivities: true 
    },
    {
      image: '/picture10.png',
      title: 'Review',
      content: '',
      hasReview: true
    },
    {
      image: '/picture11.png',
      title: `${agentName || 'Your agent'} is live`,
      content: 'Congratulations, you\'ve just created a new agent!',
      hasSuccess: true
    }
  ];

  const dataSources = [
    'Market data',
    'Social sentiment',
    'News feeds',
    'Financial reports',
    'Trading signals',
    'Economic indicators',
    'Company filings',
    'Technical analysis'
  ];

  const filteredSources = dataSources.filter(source =>
    source.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB check
        alert('File size must be less than 1MB');
        return;
      }
      setAgentImage(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSourceClick = (source) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleActivitySelect = (activity) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const improvePrompt = async () => {
    setIsImprovingPrompt(true);
    try {
      const response = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content: "You are an expert at improving AI agent prompts. Make the provided prompt more specific, detailed, and effective while maintaining its core intent."
          },
          {
            role: "user",
            content: `Please improve this AI agent prompt: "${prompt}"`
          }
        ],
        temperature: 0.7
      });
      setPrompt(response.choices[0].message.content);
    } catch (error) {
      console.error('Error improving prompt:', error);
      alert('Failed to improve prompt');
    } finally {
      setIsImprovingPrompt(false);
    }
  };

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

      {currentStep > 0 && (
        <IconButton 
          className="back-button"
          onClick={handleBack}
          sx={{ 
            color: 'white',
            position: 'absolute',
            top: '20px',
            left: '40px',
            zIndex: 1,
            '@media (max-width: 768px)': {
              display: 'none'
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      
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
                style={{ 
                  width: '90%',
                  height: '50%',
                  objectFit: "contain",
                  borderRadius: '12px'
                }}
              />
   
            </div>
            
            <div className="content-container">
              <h2 style={{ marginBottom: '1.5rem' }}>{slides[currentStep].title}</h2>
              {slides[currentStep].hasForm ? (
                <>
                  <p>{slides[currentStep].content}</p>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Enter agent name"
                    style={{
                      width: '90%',
                      padding: '10px 12px',
                      marginBottom: '16px',
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      height: '40px',
                      fontSize: '14px'
                    }}
                  />
                  <p>{`What should people know about ${agentName || 'your agent'}?`}</p>
                  <textarea
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                    placeholder="Add some description about the agent that everyone will see"
                    style={{
                      width: '90%',
                      padding: '12px',
                      marginBottom: '20px',
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      minHeight: '50%',
                      resize: 'vertical'
                    }}
                  />
                </>
              ) : slides[currentStep].hasUpload ? (
                <>
                  <p>{slides[currentStep].content}</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
                    <button 
                      className="next-button"
                      onClick={handleUploadClick}
                      style={{ flex: 1 }}
                    >
                      Upload
                    </button>
                    <button 
                      className="next-button"
                      onClick={handleNext}
                      style={{ 
                        flex: 1,
                        backgroundColor: 'transparent',
                        border: '1px solid white',
                        color:'#FFF'
                      }}
                    >
                      Maybe later
                    </button>
                  </div>
                  {agentImage && (
                    <p style={{ marginTop: '10px', color: 'green' }}>
                      Image uploaded: {agentImage.name}
                    </p>
                  )}
                  <button 
                    className="next-button"
                    onClick={handleNext}
                    style={{ 
                      marginTop: '20px',
                      width: '100%'
                    }}
                  >
                    Continue
                  </button>
                </>
              ) : slides[currentStep].hasPrompt ? (
                <>
                  <p>{slides[currentStep].content}</p>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Be as specific as possible"
                    style={{
                      width: '90%',
                      padding: '12px',
                      marginBottom: '20px',
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      minHeight: '150px',
                      resize: 'vertical',
                      fontSize: '14px'
                    }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    color: '#666',
                    fontSize: '14px',
                    marginBottom: '20px'
                  }}>
                    <span 
                      onClick={improvePrompt}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: '#1a1a1a',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {isImprovingPrompt ? (
                        <span>Improving...</span>
                      ) : (
                        <>
                          <img src="pen-loading.png" alt="Improve" style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                          Improve Prompt
                        </>
                      )}
                    </span>
                  </div>
                </>
              ) : slides[currentStep].hasDataSources ? (
                <>
                  <p>{slides[currentStep].content}</p>
                  <div style={{
                    width: '90%',
                    marginBottom: '20px'
                  }}>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="What are you looking for?"
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#1a1a1a',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        height: '40px',
                        fontSize: '14px',
                        marginBottom: '16px'
                      }}
                    />
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '20px'
                    }}>
                      {filteredSources.map((source, index) => (
                        <span
                          key={index}
                          onClick={() => handleSourceClick(source)}
                          style={{
                            backgroundColor: '#1a1a1a',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            color: 'white',
                            fontSize: '14px',
                            cursor: 'pointer',
                            border: selectedSources.includes(source) ? '1px solid white' : '1px solid transparent'
                          }}
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : slides[currentStep].hasActivities ? (
                <>
                  <p>{slides[currentStep].content}</p>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    width: '90%'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '16px'
                    }}>
                      <div 
                        onClick={() => handleActivitySelect('post')}
                        style={{
                          flex: 1,
                          backgroundColor: '#1a1a1a',
                          padding: '16px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          border: selectedActivities.includes('post') ? '1px solid white' : '1px solid transparent'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Post on X</span>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: '2px solid white',
                            backgroundColor: selectedActivities.includes('post') ? 'white' : 'transparent'
                          }} />
                        </div>
                        <img 
                          src="picture8.png" 
                          alt="Post on X" 
                          style={{
                            width: '100%',
                            marginTop: '12px',
                            borderRadius: '8px'
                          }}
                        />
                      </div>
                      <div 
                        onClick={() => handleActivitySelect('trade')}
                        style={{
                          flex: 1,
                          backgroundColor: '#1a1a1a',
                          padding: '16px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          border: selectedActivities.includes('trade') ? '1px solid white' : '1px solid transparent'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Make Trades</span>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: '2px solid white',
                            backgroundColor: selectedActivities.includes('trade') ? 'white' : 'transparent'
                          }} />
                        </div>
                        <img 
                          src="picture9.png" 
                          alt="Make Trades" 
                          style={{
                            width: '100%',
                            marginTop: '12px',
                            borderRadius: '8px'
                          }}
                        />
                      </div>
                    </div>
                    <button 
                      className="next-button"
                      onClick={handleNext}
                      style={{
                        width: '100%',
                        backgroundColor: 'white',
                        color: 'black'
                      }}
                    >
                      Review and Bring {agentName || 'your agent'} to Life
                    </button>
                  </div>
                </>
              ) : slides[currentStep].hasXConfig ? (
                <>
                  <p>{slides[currentStep].content}</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button 
                      className="next-button"
                      onClick={handleNext}
                      style={{ flex: 1 }}
                    >
                      Let's do this
                    </button>
                    <button 
                      className="next-button"
                      onClick={handleNext}
                      style={{ 
                        flex: 1,
                        backgroundColor: 'transparent',
                        border: '1px solid white',
                        color: '#FFF'
                      }}
                    >
                      Maybe later
                    </button>
                  </div>
                </>
              ) : slides[currentStep].hasReview ? (
                <>
                  <div style={{ width: '90%' }}>
                    <div style={{ 
                      backgroundColor: '#111',
                      borderRadius: '16px',
                      padding: '24px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        marginBottom: '24px' 
                      }}>
                        {agentImage ? (
                          <img 
                            src={URL.createObjectURL(agentImage)} 
                            alt="Agent profile" 
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#1a1a1a'
                          }} />
                        )}
                        <h3 style={{ margin: 0 }}>{agentName}</h3>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#666', marginBottom: '8px' }}>Description:</p>
                        <p style={{ margin: 0 }}>{agentDescription}</p>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#666', marginBottom: '8px' }}>Prompt:</p>
                        <p style={{ margin: 0 }}>{/* Add prompt state variable and display here */}</p>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#666', marginBottom: '8px' }}>Sources:</p>
                        <p style={{ margin: 0 }}>{selectedSources.join(', ')}</p>
                      </div>

                      <div>
                        <p style={{ color: '#666', marginBottom: '8px' }}>Activity:</p>
                        <p style={{ margin: 0 }}>{selectedActivities.map(activity => 
                          activity === 'trade' ? 'Making trades' : 'Posting on X'
                        ).join(', ')}</p>
                      </div>
                    </div>

                    <button 
                      className="next-button"
                      onClick={handleNext}
                      style={{
                        width: '100%',
                        backgroundColor: 'white',
                        color: 'black',
                        marginBottom: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Create {agentName || 'Agent'}
                    </button>

                    <button 
                      onClick={handleBack}
                      style={{
                        width: '100%',
                        backgroundColor: '#1a1a1a',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '12px',
                        borderRadius: '8px'
                      }}
                    >
                      Change Info
                    </button>
                  </div>
                </>
              ) : slides[currentStep].hasSuccess ? (
                <>
                  <div style={{ width: '90%', textAlign: 'center' }}>
                    <button 
                      className="next-button"
                      onClick={() => navigate('/chat/alphachad')}
                      style={{
                        width: '100%',
                        backgroundColor: 'white',
                        color: 'black',
                        marginTop: '20px',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                     Talk to {agentName || 'your agent'}
                    </button>
                  </div>
                </>
              ) : (
                <p style={{ marginBottom: '1.5rem' }}>{slides[currentStep].content}</p>
              )}
              <button 
                className="next-button"
                onClick={handleNext}
                disabled={currentStep === slides.length - 1}
                style={{ 
                  marginTop: '1rem',
                  display: (currentStep === slides.length - 1 || currentStep === 5 || currentStep === 2) ? 'none' : 'block' 
                }}
              >
                {currentStep === 0 ? "Let's get started" : 'Continue'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AgentLauncher;
