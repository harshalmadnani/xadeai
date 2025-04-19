import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './SocialAgentLauncher.css';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import AgentLauncher from './AgentLauncher';

const supabaseUrl = 'https://wbsnlpviggcnwqfyfobh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indic25scHZpZ2djbndxZnlmb2JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc2NTcwNiwiZXhwIjoyMDU0MzQxNzA2fQ.tr6PqbiAXQYSQSpG2wS6I4DZfV1Gc3dLXYhKwBrJLS0';
const supabase = createClient(supabaseUrl, supabaseKey);

const loadingAnimation = {
  display: 'inline-block',
  width: '20px',
  height: '20px',
  marginLeft: '10px',
  border: '3px solid rgba(0, 0, 0, 0.3)',
  borderRadius: '50%',
  borderTopColor: '#000',
  animation: 'spin 1s ease-in-out infinite',
  verticalAlign: 'middle'
};

const TradingAgentLauncher = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentImage, setAgentImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedStrategies, setSelectedStrategies] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAgentLauncher, setShowAgentLauncher] = useState(false);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const trainingFileInputRef = useRef(null);
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [trainingFiles, setTrainingFiles] = useState([]);
  const [customContext, setCustomContext] = useState('');
  const [isUploadingTrainingFiles, setIsUploadingTrainingFiles] = useState(false);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [tradingPairs, setTradingPairs] = useState([]);
  const [currentPair, setCurrentPair] = useState('');
  const [maxPositionSize, setMaxPositionSize] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [agentType, setAgentType] = useState('trading');
  const [selectedChains, setSelectedChains] = useState([]);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [defiStrategy, setDefiStrategy] = useState('');
  const [scanFrequency, setScanFrequency] = useState('60');

  const slides = [
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture2.png', 
      title: 'It all starts with a name', 
      content: 'How should we call your Trading Agent?',
      hasForm: true 
    },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture3.png', 
      title: `Let's upload the picture\nof ${agentName || 'your agent'}`, 
      content: '',
      hasUpload: true 
    },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture7.png', 
      title: `Select the type of agent you want to create`, 
      content: '',
      hasAgentType: true 
    },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture7.png', 
      title: `What trading strategies do you want\n${agentName || 'your agent'} to use?`, 
      content: '',
      hasStrategies: true,
      showIf: () => agentType === 'trading'
    },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture10.png', 
      title: `Trading Configuration`, 
      content: 'Configure your agent\'s trading parameters',
      hasTradingConfig: true,
      showIf: () => agentType === 'trading'
    },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture7.png', 
      title: `What chains do you want your agent to operate in?`, 
      content: '',
      hasChains: true,
      showIf: () => agentType === 'defi'
    },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture7.png', 
      title: `What should your DeFi strategy do?`, 
      content: 'Describe the strategy in detail',
      hasDefiStrategy: true,
      showIf: () => agentType === 'defi'
    },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture5.png', 
      title: `What data sources do you want\n${agentName || 'your agent'} to use?`, 
      content: 'You can search for data sources',
      hasDataSources: true 
    },
    {
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture5.png',
      title: `Add custom training materials for\n${agentName || 'your agent'}`,
      content: 'Upload PDFs or add text to give your agent specific knowledge',
      hasTrainingMaterials: true
    },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture4.png', 
      title: `How do you want ${agentName || 'your agent'} to trade?`, 
      content: 'Enter the trading strategy prompt',
      hasPrompt: true 
    },
    {
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture4.png',
      title: 'Choose the Language Model',
      content: 'Select which LLM you want to power your agent',
      hasModelSelection: true
    },
    {
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture11.png',
      title: 'Review',
      content: '',
      hasReview: true
    },
    {
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture11.png',
      title: `${agentName || 'Your agent'} is live`,
      content: 'Congratulations, you\'ve just created a new trading agent!',
      hasSuccess: true
    }
  ];

  const tradingStrategies = [
    'Technical Analysis',
    'Fundamental Analysis',
    'Sentiment Analysis',
    'Arbitrage',
    'Market Making',
    'Trend Following',
    'Mean Reversion',
    'Momentum Trading',
    'Swing Trading',
    'Scalping'
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

  const blockchainChains = [
    'Ethereum',
    'Arbitrum',
    'Optimism',
    'Base',
    'Polygon',
    'BNB Chain',
    'Solana',
    'Avalanche'
  ];

  const handleAgentTypeSelect = (type) => {
    setAgentType(type);
  };

  const handleChainSelect = (chain) => {
    setSelectedChains(prev => 
      prev.includes(chain) 
        ? prev.filter(c => c !== chain)
        : [...prev, chain]
    );
  };

  const handleGenerateFollowUpQuestions = async () => {
    if (!defiStrategy.trim()) return;
    
    setIsGeneratingQuestions(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at DeFi strategies. Generate 3-5 follow-up questions that would help clarify this DeFi strategy. Return only the questions in bullet point format.'
            },
            {
              role: 'user',
              content: `Based on this DeFi strategy description, what follow-up questions should I ask to improve it: ${defiStrategy}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate follow-up questions');
      }

      const data = await response.json();
      const questionsText = data.choices[0].message.content;
      
      // Parse bullet points into an array
      const questions = questionsText
        .split(/\n+/)
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(line => line);
      
      setFollowUpQuestions(questions);
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const getVisibleSlides = () => {
    return slides.filter(slide => {
      if (slide.showIf) {
        return slide.showIf();
      }
      return true;
    });
  };

  const handleNext = () => {
    const visibleSlides = getVisibleSlides();
    const currentSlide = visibleSlides[currentStep];
    
    // Validate current step before proceeding
    if (currentSlide.hasForm && (!agentName.trim() || !agentDescription.trim())) {
      alert('Please fill in both the agent name and description');
      return;
    }
    
    if (currentSlide.hasDefiStrategy && !defiStrategy.trim()) {
      alert('Please describe your DeFi strategy');
      return;
    }
    
    if (currentSlide.hasTradingConfig && (!maxPositionSize || !stopLoss || !takeProfit)) {
      alert('Please fill in all trading parameters');
      return;
    }
    
    if (currentStep < visibleSlides.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // Show AgentLauncher component
      setShowAgentLauncher(true);
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

  const handleStrategySelect = (strategy) => {
    setSelectedStrategies(prev => 
      prev.includes(strategy) 
        ? prev.filter(s => s !== strategy)
        : [...prev, strategy]
    );
  };

  const handleAddTradingPair = () => {
    const pair = currentPair.trim().toUpperCase();
    if (pair && !tradingPairs.includes(pair)) {
      setTradingPairs([...tradingPairs, pair]);
      setCurrentPair('');
    }
  };

  const handleRemoveTradingPair = (pairToRemove) => {
    setTradingPairs(tradingPairs.filter(pair => pair !== pairToRemove));
  };

  const handleCreateAgent = async () => {
    setIsCreating(true);
    try {
      // Validate trading parameters
      if (tradingPairs.length === 0) {
        alert('Please add at least one trading pair');
        setIsCreating(false);
        return;
      }

      if (!maxPositionSize || !stopLoss || !takeProfit) {
        alert('Please fill in all trading parameters');
        setIsCreating(false);
        return;
      }

      // Check if bucket exists, if not create it
      const { error: bucketError } = await supabase
        .storage
        .createBucket('images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
          fileSizeLimit: 1024 * 1024 * 2 // 2MB
        });

      // Upload image to storage if exists
      let imageUrl = null;
      if (agentImage) {
        const fileExt = agentImage.name.split('.').pop();
        const filePath = `agent-images/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('images')
          .upload(filePath, agentImage, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      // Prepare trading configuration
      const tradingConfiguration = {
        risk_level: riskLevel,
        trading_pairs: tradingPairs,
        max_position_size: parseFloat(maxPositionSize),
        stop_loss: parseFloat(stopLoss),
        take_profit: parseFloat(takeProfit),
        strategies: selectedStrategies
      };

      // Insert agent data into agents2 table
      const { data: agentData, error } = await supabase
        .from('agents2')
        .insert([
          {
            name: agentName,
            description: agentDescription,
            prompt: prompt,
            image: imageUrl,
            user_id: session?.user?.id,
            data_sources: selectedSources,
            trading_configuration: tradingConfiguration,
            model: selectedModel,
            custom_context: customContext,
            type: 'trading'
          }
        ])
        .select();

      if (error) throw error;

      if (agentData && agentData.length > 0) {
        const agentId = agentData[0].id;
        console.log('Trading agent created successfully:', agentId);
        
        // Upload training files if any exist
        if (trainingFiles.length > 0) {
          for (const file of trainingFiles) {
            try {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('agent_id', agentId);
              
              const response = await fetch('https://agentic-context.onrender.com/api/v1/upload', {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(60000)
              });
              
              if (!response.ok) {
                console.error(`Failed to upload file ${file.name}`);
              }
            } catch (uploadError) {
              console.error(`Error uploading file ${file.name}:`, uploadError);
            }
          }
        }
        
        handleNext();
      }
    } catch (error) {
      console.error('Error creating trading agent:', error);
      alert(`Failed to create agent: ${error.message || 'Unknown error'}`);
    }
  };

  // If showing AgentLauncher, render it instead of TradingAgentLauncher content
  if (showAgentLauncher) {
    return <AgentLauncher />;
  }

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

      {(
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
              />
            </div>
            
            <div className="content-container">
              <h2 style={{ marginBottom: '1.5rem' }}>{slides[currentStep].title}</h2>
              <p style={{ marginBottom: '1.5rem' }}>{slides[currentStep].content}</p>
              
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
              ) : slides[currentStep].hasAgentType ? (
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
                        border: agentType === 'trading' ? '1px solid white' : '1px solid transparent'
                      }}
                    >
                      <img 
                        src="https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture8.png" 
                        alt="Trading Agent"
                        style={{
                          width: '100%',
                          height: 'auto',
                          marginBottom: '8px',
                          borderRadius: '8px'
                        }}
                      />
                      <p style={{ margin: 0, textAlign: 'center' }}>Trading Agent</p>
                    </div>
                    
                    <div
                      onClick={() => handleAgentTypeSelect('defi')}
                      style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        border: agentType === 'defi' ? '1px solid white' : '1px solid transparent'
                      }}
                    >
                      <img 
                        src="https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture9.png" 
                        alt="DeFi Agent"
                        style={{
                          width: '100%',
                          height: 'auto',
                          marginBottom: '8px',
                          borderRadius: '8px'
                        }}
                      />
                      <p style={{ margin: 0, textAlign: 'center' }}>DeFi Agent</p>
                    </div>
                  </div>
                  
                  <button 
                    className="next-button"
                    onClick={handleNext}
                    style={{
                      width: '100%',
                      backgroundColor: 'white',
                      color: 'black',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      marginTop: '20px'
                    }}
                  >
                    Continue
                  </button>
                </div>
              ) : slides[currentStep].hasChains ? (
                <div style={{ width: '90%' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    {blockchainChains.map(chain => (
                      <div
                        key={chain}
                        onClick={() => handleChainSelect(chain)}
                        style={{
                          backgroundColor: '#1a1a1a',
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          border: selectedChains.includes(chain) ? '1px solid white' : '1px solid transparent'
                        }}
                      >
                        <p style={{ margin: 0, textAlign: 'center' }}>{chain}</p>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className="next-button"
                    onClick={handleNext}
                    style={{
                      width: '100%',
                      backgroundColor: 'white',
                      color: 'black',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      marginTop: '20px'
                    }}
                  >
                    Continue
                  </button>
                </div>
              ) : slides[currentStep].hasDefiStrategy ? (
                <div style={{ width: '90%' }}>
                  <p style={{ marginBottom: '10px' }}>Describe what your DeFi strategy should do:</p>
                  <textarea
                    value={defiStrategy}
                    onChange={(e) => setDefiStrategy(e.target.value)}
                    placeholder="e.g., Scan for arbitrage opportunities between Uniswap and Sushiswap on Ethereum, look for price differences greater than 2% after gas costs..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      minHeight: '150px',
                      fontSize: '14px',
                      marginBottom: '16px',
                      resize: 'vertical'
                    }}
                  />
                  
                  <p style={{ marginBottom: '10px' }}>How often should the agent scan for opportunities (minutes):</p>
                  <input
                    type="number"
                    value={scanFrequency}
                    onChange={(e) => setScanFrequency(e.target.value)}
                    min="1"
                    placeholder="60"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      height: '40px',
                      fontSize: '14px',
                      marginBottom: '20px'
                    }}
                  />
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '20px'
                  }}>
                    <button 
                      onClick={handleGenerateFollowUpQuestions}
                      disabled={!defiStrategy.trim() || isGeneratingQuestions}
                      style={{ 
                        cursor: defiStrategy.trim() && !isGeneratingQuestions ? 'pointer' : 'default',
                        backgroundColor: defiStrategy.trim() && !isGeneratingQuestions ? 'white' : '#1a1a1a',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        color: defiStrategy.trim() && !isGeneratingQuestions ? '#000' : '#666',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <img src="/pen-loading.png" alt="Generate" style={{ 
                        width: '16px', 
                        height: '16px',
                        filter: defiStrategy.trim() && !isGeneratingQuestions ? 'invert(1)' : 'none'
                      }} />
                      {isGeneratingQuestions ? 'Generating...' : 'Generate Follow-up Questions'}
                    </button>
                  </div>
                  
                  {followUpQuestions.length > 0 && (
                    <div style={{ 
                      backgroundColor: '#1a1a1a',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '20px'
                    }}>
                      <p style={{ 
                        fontSize: '16px',
                        fontWeight: '500',
                        marginBottom: '12px'
                      }}>Consider answering these follow-up questions in your strategy:</p>
                      <ul style={{ 
                        paddingLeft: '20px',
                        margin: '0'
                      }}>
                        {followUpQuestions.map((question, index) => (
                          <li key={index} style={{ marginBottom: '8px' }}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <button 
                    className="next-button"
                    onClick={handleNext}
                    style={{
                      width: '100%',
                      backgroundColor: 'white',
                      color: 'black',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      marginTop: '20px'
                    }}
                  >
                    Continue
                  </button>
                </div>
              ) : slides[currentStep].hasStrategies ? (
                <div style={{ width: '90%' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    {tradingStrategies.map(strategy => (
                      <div
                        key={strategy}
                        onClick={() => handleStrategySelect(strategy)}
                        style={{
                          backgroundColor: '#1a1a1a',
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          border: selectedStrategies.includes(strategy) ? '1px solid white' : '1px solid transparent'
                        }}
                      >
                        <p style={{ margin: 0, textAlign: 'center' }}>{strategy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : slides[currentStep].hasTradingConfig ? (
                <div style={{ width: '90%' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ marginBottom: '8px' }}>Risk Level:</p>
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      marginBottom: '20px'
                    }}>
                      {['low', 'medium', 'high'].map(level => (
                        <button
                          key={level}
                          onClick={() => setRiskLevel(level)}
                          style={{
                            backgroundColor: riskLevel === level ? '#fff' : '#1a1a1a',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            color: riskLevel === level ? '#000' : '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textTransform: 'capitalize'
                          }}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ marginBottom: '8px' }}>Trading Pairs:</p>
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <input
                        type="text"
                        value={currentPair}
                        onChange={(e) => setCurrentPair(e.target.value)}
                        placeholder="e.g., BTC/USDT"
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          backgroundColor: '#1a1a1a',
                          border: 'none',
                          borderRadius: '10px',
                          color: 'white',
                          height: '40px',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        onClick={handleAddTradingPair}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#1a1a1a',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '10px',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '20px'
                    }}>
                      {tradingPairs.map(pair => (
                        <div
                          key={pair}
                          style={{
                            backgroundColor: '#1a1a1a',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {pair}
                          <button
                            onClick={() => handleRemoveTradingPair(pair)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'white',
                              cursor: 'pointer',
                              padding: '0'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ marginBottom: '8px' }}>Max Position Size (USD):</p>
                    <input
                      type="number"
                      value={maxPositionSize}
                      onChange={(e) => setMaxPositionSize(e.target.value)}
                      placeholder="e.g., 1000"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: '#1a1a1a',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        height: '40px',
                        fontSize: '14px',
                        marginBottom: '20px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ marginBottom: '8px' }}>Stop Loss (%):</p>
                    <input
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      placeholder="e.g., 5"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: '#1a1a1a',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        height: '40px',
                        fontSize: '14px',
                        marginBottom: '20px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ marginBottom: '8px' }}>Take Profit (%):</p>
                    <input
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      placeholder="e.g., 10"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: '#1a1a1a',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        height: '40px',
                        fontSize: '14px',
                        marginBottom: '20px'
                      }}
                    />
                  </div>
                </div>
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
                        <p style={{ color: '#666', marginBottom: '8px' }}>Agent Type:</p>
                        <p style={{ margin: 0 }}>{agentType === 'trading' ? 'Trading Agent' : 'DeFi Agent'}</p>
                      </div>

                      {agentType === 'trading' ? (
                        <>
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#666', marginBottom: '8px' }}>Trading Strategies:</p>
                            <p style={{ margin: 0 }}>{selectedStrategies.join(', ')}</p>
                          </div>
                          
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#666', marginBottom: '8px' }}>Trading Configuration:</p>
                            <p style={{ margin: 0 }}>
                              Risk Level: {riskLevel}<br/>
                              Trading Pairs: {tradingPairs.join(', ')}<br/>
                              Max Position Size: ${maxPositionSize}<br/>
                              Stop Loss: {stopLoss}%<br/>
                              Take Profit: {takeProfit}%
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#666', marginBottom: '8px' }}>Blockchain Chains:</p>
                            <p style={{ margin: 0 }}>{selectedChains.join(', ')}</p>
                          </div>
                          
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#666', marginBottom: '8px' }}>DeFi Strategy:</p>
                            <p style={{ margin: 0 }}>{defiStrategy}</p>
                          </div>
                          
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#666', marginBottom: '8px' }}>Scan Frequency:</p>
                            <p style={{ margin: 0 }}>Every {scanFrequency} minutes</p>
                          </div>
                        </>
                      )}

                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#666', marginBottom: '8px' }}>Data Sources:</p>
                        <p style={{ margin: 0 }}>{selectedSources.join(', ')}</p>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#666', marginBottom: '8px' }}>Strategy Prompt:</p>
                        <p style={{ margin: 0 }}>{prompt}</p>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#666', marginBottom: '8px' }}>Model:</p>
                        <p style={{ margin: 0 }}>{selectedModel}</p>
                      </div>
                    </div>

                    <button 
                      className="next-button"
                      onClick={handleCreateAgent}
                      disabled={isCreating}
                      style={{
                        width: '100%',
                        backgroundColor: isCreating ? '#666' : 'white',
                        color: 'black',
                        marginBottom: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: isCreating ? 'default' : 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                      }}
                    >
                      {isCreating ? (
                        <>
                          Creating your agent
                          <div style={loadingAnimation} />
                        </>
                      ) : (
                        `Start your 7 day free trial`
                      )}
                    </button>
                  </div>
                </>
              ) : slides[currentStep].hasSuccess ? (
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
                        <p style={{ color: '#666', marginBottom: '8px' }}>Agent Type:</p>
                        <p style={{ margin: 0 }}>{agentType === 'trading' ? 'Trading Agent' : 'DeFi Agent'}</p>
                      </div>

                      {agentType === 'trading' ? (
                        <>
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#666', marginBottom: '8px' }}>Trading Strategies:</p>
                            <p style={{ margin: 0 }}>{selectedStrategies.join(', ')}</p>
                          </div>
                          
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#666', marginBottom: '8px' }}>Trading Configuration:</p>
                            <p style={{ margin: 0 }}>
                              Risk Level: {riskLevel}<br/>
                              Trading Pairs: {tradingPairs.join(', ')}<br/>
                              Max Position Size: ${maxPositionSize}<br/>
                              Stop Loss: {stopLoss}%<br/>
                              Take Profit: {takeProfit}%
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#666', marginBottom: '8px' }}>Blockchain Chains:</p>
                            <p style={{ margin: 0 }}>{selectedChains.join(', ')}</p>
                          </div>
                          
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#666', marginBottom: '8px' }}>DeFi Strategy:</p>
                            <p style={{ margin: 0 }}>{defiStrategy}</p>
                          </div>
                          
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#666', marginBottom: '8px' }}>Scan Frequency:</p>
                            <p style={{ margin: 0 }}>Every {scanFrequency} minutes</p>
                          </div>
                        </>
                      )}

                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#666', marginBottom: '8px' }}>Data Sources:</p>
                        <p style={{ margin: 0 }}>{selectedSources.join(', ')}</p>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#666', marginBottom: '8px' }}>Strategy Prompt:</p>
                        <p style={{ margin: 0 }}>{prompt}</p>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#666', marginBottom: '8px' }}>Model:</p>
                        <p style={{ margin: 0 }}>{selectedModel}</p>
                      </div>
                    </div>

                    <button 
                      className="next-button"
                      onClick={handleCreateAgent}
                      disabled={isCreating}
                      style={{
                        width: '100%',
                        backgroundColor: isCreating ? '#666' : 'white',
                        color: 'black',
                        marginBottom: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: isCreating ? 'default' : 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                      }}
                    >
                      {isCreating ? (
                        <>
                          Creating your agent
                          <div style={loadingAnimation} />
                        </>
                      ) : (
                        `Start your 7 day free trial`
                      )}
                    </button>
                  </div>
                </>
              ) : null}

              {currentStep === 0 ? (
                <button 
                  className="next-button"
                  onClick={handleNext}
                  style={{ marginTop: '1rem' }}
                >
                  Let's get started
                </button>
              ) : currentStep === slides.length - 2 ? (
                <button 
                  className="next-button"
                  onClick={handleCreateAgent}
                  disabled={isCreating}
                  style={{
                    width: '100%',
                    backgroundColor: isCreating ? '#666' : 'white',
                    color: 'black',
                    marginBottom: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: isCreating ? 'default' : 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  {isCreating ? (
                    <>
                      Creating your agent
                      <div style={loadingAnimation} />
                    </>
                  ) : (
                    `Start your 7 day free trial`
                  )}
                </button>
              ) : currentStep < slides.length - 1 ? (
                <button 
                  className="next-button"
                  onClick={handleNext}
                  style={{ marginTop: '1rem' }}
                >
                  Continue
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TradingAgentLauncher; 