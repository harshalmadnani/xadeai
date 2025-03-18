import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './AgentLauncher.css';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

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

const AgentLauncher = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentImage, setAgentImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('presets');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [setupX, setSetupX] = useState(false);
  const [postingClients, setPostingClients] = useState([]);
  const [postingInterval, setPostingInterval] = useState('60');
  const [postingTopics, setPostingTopics] = useState('');
  const [chatClients, setChatClients] = useState([]);
  const [replyToUsernames, setReplyToUsernames] = useState([]);
  const [replyToReplies, setReplyToReplies] = useState(false);
  const [exampleQueries, setExampleQueries] = useState('');
  const [examplePosts, setExamplePosts] = useState('');
  const [qaList, setQaList] = useState([]);
  const [postList, setPostList] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentPost, setCurrentPost] = useState('');
  const [twitterUsername, setTwitterUsername] = useState('');
  const [twitterPassword, setTwitterPassword] = useState('');
  const [twitterEmail, setTwitterEmail] = useState('');
  const [twitter2FASecret, setTwitter2FASecret] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  const characterOptions = [
    { value: 'presets', label: 'Presets' },
    { value: 'username', label: 'X username' },
    { value: 'prompt', label: 'From Prompt' }
  ];

  const slides = [
    { image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture.png', title: 'Create your own\nAI-agent in a few clicks', content: 'Launch and scale your AI-Agents with unprecedented ease and speed' },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture2.png', 
      title: 'It all starts with a name', 
      content: 'How should we call your Agent?',
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
      title: `What kind of activity do you want\n${agentName || 'your agent'} to do?`, 
      content: '',
      hasActivities: true 
    },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture10.png', 
      title: `Posting Configuration`, 
      content: 'Configure how your agent will post content',
      hasPostingConfig: true 
    },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture12.png', 
      title: `Chat and Interaction Configuration`, 
      content: 'Configure how your agent will interact with others',
      hasChatConfig: true 
    },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture5.png', 
      title: `What data sources do you want\n${agentName || 'your agent'} to use?`, 
      content: 'You can search for actions and sources',
      hasDataSources: true 
    },
    
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture4.png', 
      title: `How do you want ${agentName || 'your agent'} to sound?`, 
      content: 'Enter the prompt',
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
      title: `Let's see some examples from ${agentName || 'your agent'}`,
      content: 'Add example interactions and posts',
      hasExamples: true
    },
    { 
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture6.png', 
      title: `Would you like to\nconfigure X account\nfor ${agentName || 'your agent'} now?`, 
      content: '',
      hasXConfig: true 
    },
    {
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture10.png',
      title: 'Review',
      content: '',
      hasReview: true
    },
    {
      image: 'https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture11.png',
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
      if (currentStep === 9 && !setupX) {
        setCurrentStep(10);
      } else {
        setCurrentStep(currentStep + 1);
      }
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

  const handleAddUsername = () => {
    const username = currentUsername.trim().replace(/^@+/, '');
    if (username && !replyToUsernames.includes(username)) {
      setReplyToUsernames([...replyToUsernames, username]);
      setCurrentUsername('');
    }
  };

  const handleRemoveUsername = (usernameToRemove) => {
    setReplyToUsernames(replyToUsernames.filter(username => username !== usernameToRemove));
  };

  const handleCreateAgent = async () => {
    setIsCreating(true);
    try {
      // Validate posting interval
      if (postingInterval && parseInt(postingInterval) < 2) {
        alert('Posting interval must be at least 2 minutes');
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
        
        // Get the public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      // Prepare post and chat configurations
      const postConfiguration = {
        clients: postingClients,
        interval: parseInt(postingInterval),
        topics: postingTopics,
        enabled: postingClients.length > 0
      };

      const chatConfiguration = {
        clients: chatClients,
        reply_to_usernames: replyToUsernames,
        reply_to_replies: replyToReplies,
        enabled: chatClients.length > 0
      };

      // Prepare Twitter credentials if they exist
      let twitter_credentials = null;
      if (postingClients.includes('x') || chatClients.includes('x')) {
        if (setupX && twitterUsername && twitterPassword && twitterEmail) {
          twitter_credentials = {
            'TWITTER_USERNAME=': twitterUsername.trim(),
            'TWITTER_PASSWORD=': twitterPassword,
            'TWITTER_EMAIL=': twitterEmail.trim(),
            'TWITTER_2FA_SECRET=': twitter2FASecret.trim()
          };
        } else {
          // If X is selected as a client but credentials are not set up
          alert('Please set up X credentials or remove X from the clients');
          setIsCreating(false);
          return;
        }
      }

      // Insert agent data into agents2 table with model
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
            activities: selectedActivities,
            sample_questions: qaList.map(qa => ({
              question: qa.question,
              answer: qa.answer
            })),
            sample_posts: postList,
            post_configuration: postConfiguration,
            chat_configuration: chatConfiguration,
            twitter_credentials: twitter_credentials ? JSON.stringify(twitter_credentials) : null,
            model: selectedModel
          }
        ])
        .select();

      if (error) throw error;

      // Only log success if we actually have agent data
      if (agentData && agentData.length > 0) {
        console.log('Agent created successfully:', agentData[0].id);
        
        // Set up posting schedule if posting is enabled
        if (postConfiguration.enabled) {
          const agentId = agentData[0].id;
          
          console.log('Posting configuration is enabled. Setting up posting schedule for agent ID:', agentId);
          console.log('Posting clients:', postingClients);
          console.log('Posting interval:', postingInterval);
          console.log('Posting topics:', postingTopics);
          
          // Format the topics and prompt to be more API-friendly
          const sanitizedTopics = postingTopics.trim().replace(/\s+/g, ' ');
          const sanitizedPrompt = prompt.trim().replace(/\s+/g, ' ');
          
          const postingPayload = {
            userId: agentId,
            interval: parseInt(postingInterval),
            query: sanitizedTopics ? `speak about ${sanitizedTopics}` : 'speak about general topics',
            systemPrompt: `You are an AI agent who tweets. ${sanitizedPrompt} Keep all tweets under 260 characters.`
          };
          
          console.log('Sending posting schedule request with payload:', postingPayload);
          
          const response = await fetch(
            'https://97m15gg62a.execute-api.ap-south-1.amazonaws.com/prod/create',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(postingPayload),
              signal: AbortSignal.timeout(1000000)
            }
          );
          
          console.log('Received response from posting schedule API:', response);
          console.log('Response status:', response.status);
          console.log('Response ok:', response.ok);
          
          if (response.ok) {
            const responseText = await response.text();
            console.log('Posting schedule API response text:', responseText);
            
            // Try to parse the response as JSON if it's not empty
            let responseData;
            if (responseText.trim()) {
              try {
                responseData = JSON.parse(responseText);
                console.log('Posting schedule API call successful with parsed response:', responseData);
              } catch (parseError) {
                console.log('Could not parse response as JSON:', parseError);
                console.log('Raw response text was:', responseText);
              }
            } else {
              console.log('Posting schedule API returned empty response with status:', response.status);
            }
          } else {
            console.log('Posting schedule API call failed with status:', response.status);
            const errorText = await response.text();
            console.log('Error response text:', errorText);
            
            // Try to parse error response as JSON if possible
            try {
              const errorJson = JSON.parse(errorText);
              console.log('Parsed error response:', errorJson);
            } catch (e) {
              // If it's not JSON, the raw text is already logged
            }
          }
        } else {
          console.log('Posting configuration is disabled. Skipping posting schedule setup.');
          console.log('Posting clients:', postingClients);
        }
        
        // Move to the success step
        handleNext();
      } else {
        // If we don't have agent data but also no error, something unexpected happened
        throw new Error('Agent creation failed: No agent data returned');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert(`Failed to create agent: ${error.message || 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleImprovePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsImprovingPrompt(true);
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
              content: 'You are an expert at improving AI agent prompts. Make the prompt more specific, detailed, and effective while maintaining its original intent.'
            },
            {
              role: 'user',
              content: `Please improve this prompt: ${prompt}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error('Failed to improve prompt');
      }

      const data = await response.json();
      const improvedPrompt = data.choices[0].message.content;
      setPrompt(improvedPrompt);
    } catch (error) {
      console.error('Error improving prompt:', error);
      // Optionally show an error message to the user
    } finally {
      setIsImprovingPrompt(false);
    }
  };

  const handleAddQA = () => {
    if (currentQuestion.trim() && currentAnswer.trim()) {
      const newQA = {
        question: currentQuestion.trim(),
        answer: currentAnswer.trim()
      };
      setQaList([...qaList, newQA]);
      setCurrentQuestion('');
      setCurrentAnswer('');
      // Update exampleQueries for the final submission
      setExampleQueries(prev => {
        const newQueries = [...qaList, newQA]
          .map(qa => `Q: ${qa.question}\nA: ${qa.answer}`)
          .join('\n\n');
        return newQueries;
      });
    }
  };

  const handleAddPost = () => {
    if (currentPost.trim()) {
      const newPost = currentPost.trim();
      setPostList([...postList, newPost]);
      setCurrentPost('');
      // Update examplePosts for the final submission
      setExamplePosts(prev => {
        const newPosts = [...postList, newPost].join('\n\n');
        return newPosts;
      });
    }
  };

  const handleRemoveQA = (index) => {
    const newList = qaList.filter((_, i) => i !== index);
    setQaList(newList);
    setExampleQueries(
      newList.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')
    );
  };

  const handleRemovePost = (index) => {
    const newList = postList.filter((_, i) => i !== index);
    setPostList(newList);
    setExamplePosts(newList.join('\n\n'));
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
                  borderRadius: '12px',
                }}
                loading="eager"
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
                    <>
                      <p style={{ marginTop: '10px', color: 'green' }}>
                        Image uploaded: {agentImage.name}
                      </p>
                      <button 
                        className="next-button"
                        onClick={handleNext}
                        style={{ marginTop: '20px' }}
                      >
                        Continue
                      </button>
                    </>
                  )}
                </>
              ) : slides[currentStep].hasPrompt ? (
                <div style={{ width: '90%' }}>
                  <p>{slides[currentStep].content}</p>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Be as specific as possible"
                    style={{
                      width: '100%',
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
                    marginBottom: '20px'
                  }}>
                    <button 
                      onClick={handleImprovePrompt}
                      disabled={!prompt.trim() || isImprovingPrompt}
                      style={{ 
                        cursor: prompt.trim() && !isImprovingPrompt ? 'pointer' : 'default',
                        backgroundColor: prompt.trim() && !isImprovingPrompt ? 'white' : '#1a1a1a',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        color: prompt.trim() && !isImprovingPrompt ? '#000' : '#666',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <img src="/pen-loading.png" alt="Improve" style={{ 
                        width: '16px', 
                        height: '16px',
                        filter: prompt.trim() && !isImprovingPrompt ? 'invert(1)' : 'none'
                      }} />
                      {isImprovingPrompt ? 'Improving...' : 'Improve Prompt'}
                    </button>
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
              ) : slides[currentStep].hasExamples ? (
                <div style={{ width: '90%' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ 
                      marginBottom: '12px', 
                      fontSize: '16px',
                      fontWeight: '500' 
                    }}>Example Conversations</p>
                    
                    {/* Q&A Input Section */}
                    <div style={{ 
                      backgroundColor: '#1a1a1a',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px'
                    }}>
                      <input
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        placeholder="Enter a question..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          marginBottom: '8px',
                          fontSize: '14px'
                        }}
                      />
                      <textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Enter the answer..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          minHeight: '80px',
                          fontSize: '14px',
                          marginBottom: '8px',
                          resize: 'vertical'
                        }}
                      />
                      <button
                        onClick={handleAddQA}
                        disabled={!currentQuestion.trim() || !currentAnswer.trim()}
                        style={{
                          backgroundColor: currentQuestion.trim() && currentAnswer.trim() ? 'white' : '#666',
                          color: currentQuestion.trim() && currentAnswer.trim() ? 'black' : '#999',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: currentQuestion.trim() && currentAnswer.trim() ? 'pointer' : 'default',
                          width: '100%'
                        }}
                      >
                        Add Q&A
                      </button>
                    </div>

                    {/* Q&A List */}
                    {qaList.map((qa, index) => (
                      <div key={index} style={{
                        backgroundColor: '#2a2a2a',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '8px',
                        position: 'relative'
                      }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>Q: {qa.question}</p>
                        <p style={{ margin: '0', color: '#ccc' }}>A: {qa.answer}</p>
                        <button
                          onClick={() => handleRemoveQA(index)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            padding: '4px',
                            fontSize: '14px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Posts Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ 
                      marginBottom: '12px',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}>Example Posts</p>

                    {/* Post Input Section */}
                    <div style={{ 
                      backgroundColor: '#1a1a1a',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px'
                    }}>
                      <textarea
                        value={currentPost}
                        onChange={(e) => setCurrentPost(e.target.value)}
                        placeholder="Enter an example post..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          minHeight: '100px',
                          fontSize: '14px',
                          marginBottom: '8px',
                          resize: 'vertical'
                        }}
                      />
                      <button
                        onClick={handleAddPost}
                        disabled={!currentPost.trim()}
                        style={{
                          backgroundColor: currentPost.trim() ? 'white' : '#666',
                          color: currentPost.trim() ? 'black' : '#999',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: currentPost.trim() ? 'pointer' : 'default',
                          width: '100%'
                        }}
                      >
                        Add Post
                      </button>
                    </div>

                    {/* Posts List */}
                    {postList.map((post, index) => (
                      <div key={index} style={{
                        backgroundColor: '#2a2a2a',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '8px',
                        position: 'relative'
                      }}>
                        <p style={{ margin: '0' }}>{post}</p>
                        <button
                          onClick={() => handleRemovePost(index)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            padding: '4px',
                            fontSize: '14px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Tips Section */}
                  <div style={{ 
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <img 
                        src="/info-icon.png" 
                        alt="Info"
                        style={{ 
                          width: '16px',
                          height: '16px',
                          opacity: 0.7
                        }}
                      />
                      <p style={{ 
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>Tips for better results:</p>
                    </div>
                    <ul style={{ 
                      margin: '0',
                      paddingLeft: '24px',
                      color: '#999',
                      fontSize: '14px'
                    }}>
                      <li>Add diverse examples to show different interaction styles</li>
                      <li>Include both technical and casual conversations</li>
                      <li>Use emojis and formatting to make posts engaging</li>
                      <li>Show how to handle different types of questions</li>
                    </ul>
                  </div>

                  <button 
                    className="next-button"
                    onClick={handleNext}
                    style={{
                      width: '100%',
                      backgroundColor: 'white',
                      color: 'black',
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '16px'
                    }}
                  >
                    Continue
                  </button>
                </div>
              ) : slides[currentStep].hasDataSources ? (
                <div style={{ width: '90%' }}>
                  <p>{slides[currentStep].content}</p>
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
              ) : slides[currentStep].hasPostingConfig ? (
                <div style={{ width: '90%' }}>
                  <p style={{ marginBottom: '20px' }}>Choose the clients for posting:</p>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px'
                  }}>
                    <button
                      onClick={() => setPostingClients(prev => 
                        prev.includes('terminal') ? prev.filter(c => c !== 'terminal') : [...prev, 'terminal']
                      )}
                      style={{
                        backgroundColor: postingClients.includes('terminal') ? '#fff' : '#1a1a1a',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        color: postingClients.includes('terminal') ? '#000' : '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Xade Terminal
                    </button>
                    <button
                      onClick={() => setPostingClients(prev => 
                        prev.includes('x') ? prev.filter(c => c !== 'x') : [...prev, 'x']
                      )}
                      style={{
                        backgroundColor: postingClients.includes('x') ? '#fff' : '#1a1a1a',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        color: postingClients.includes('x') ? '#000' : '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      X
                    </button>
                  </div>
                  
                  <p style={{ marginBottom: '10px' }}>Choose posting interval (minutes):</p>
                  <input
                    type="number"
                    value={postingInterval}
                    onChange={(e) => setPostingInterval(e.target.value)}
                    min="2"
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
                  
                  <p style={{ marginBottom: '10px' }}>What should your agent post about?</p>
                  <textarea
                    value={postingTopics}
                    onChange={(e) => setPostingTopics(e.target.value)}
                    placeholder="Enter topics, themes, or specific content your agent should post about. Be as specific as possible."
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      minHeight: '100px',
                      fontSize: '14px',
                      marginBottom: '20px',
                      resize: 'vertical'
                    }}
                  />
                  
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
              ) : slides[currentStep].hasChatConfig ? (
                <div style={{ width: '90%' }}>
                  <p style={{ marginBottom: '20px' }}>Choose the clients for interaction:</p>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px'
                  }}>
                    <button
                      onClick={() => setChatClients(prev => 
                        prev.includes('terminal') ? prev.filter(c => c !== 'terminal') : [...prev, 'terminal']
                      )}
                      style={{
                        backgroundColor: chatClients.includes('terminal') ? '#fff' : '#1a1a1a',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        color: chatClients.includes('terminal') ? '#000' : '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Xade Terminal
                    </button>
                    <button
                      onClick={() => setChatClients(prev => 
                        prev.includes('x') ? prev.filter(c => c !== 'x') : [...prev, 'x']
                      )}
                      style={{
                        backgroundColor: chatClients.includes('x') ? '#fff' : '#1a1a1a',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        color: chatClients.includes('x') ? '#000' : '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      X
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ marginBottom: '10px' }}>Enter usernames to reply to and join their spaces:</p>
                    <div style={{ 
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      <input
                        type="text"
                        value={currentUsername}
                        onChange={(e) => setCurrentUsername(e.target.value)}
                        placeholder="Enter username without @"
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#1a1a1a',
                          border: 'none',
                          borderRadius: '10px',
                          color: 'white',
                          height: '40px',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        onClick={handleAddUsername}
                        disabled={!currentUsername.trim()}
                        style={{
                          padding: '0 20px',
                          backgroundColor: currentUsername.trim() ? 'white' : '#666',
                          color: currentUsername.trim() ? 'black' : '#999',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: currentUsername.trim() ? 'pointer' : 'default'
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      {replyToUsernames.map((username, index) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: '#1a1a1a',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>@{username}</span>
                          <button
                            onClick={() => handleRemoveUsername(username)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#666',
                              cursor: 'pointer',
                              padding: '0',
                              fontSize: '16px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px'
                  }}>
                    <div
                      onClick={() => setReplyToReplies(!replyToReplies)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: '2px solid white',
                        backgroundColor: replyToReplies ? 'white' : 'transparent',
                        cursor: 'pointer'
                      }}
                    />
                    <span>Reply to post replies and quote tweets</span>
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
              ) : slides[currentStep].hasXConfig ? (
                <>
                  <p>{slides[currentStep].content}</p>
                  <div style={{ width: '90%' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ color: '#666', marginBottom: '8px' }}>Twitter Username</p>
                      <input
                        type="text"
                        value={twitterUsername}
                        onChange={(e) => setTwitterUsername(e.target.value)}
                        placeholder="@username"
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
                      <p style={{ color: '#666', marginBottom: '8px' }}>Twitter Email</p>
                      <input
                        type="email"
                        value={twitterEmail}
                        onChange={(e) => setTwitterEmail(e.target.value)}
                        placeholder="email@example.com"
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
                      <p style={{ color: '#666', marginBottom: '8px' }}>Twitter Password</p>
                      <input
                        type="password"
                        value={twitterPassword}
                        onChange={(e) => setTwitterPassword(e.target.value)}
                        placeholder="Enter your password"
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
                      <p style={{ color: '#666', marginBottom: '8px' }}>Twitter 2FA Secret (if applicable)</p>
                      <input
                        type="text"
                        value={twitter2FASecret}
                        onChange={(e) => setTwitter2FASecret(e.target.value)}
                        placeholder="Enter your 2FA secret"
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
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button 
                        className="next-button"
                        onClick={() => {
                          setSetupX(true);
                          handleNext();
                        }}
                        style={{ flex: 1 }}
                      >
                        Save and Continue
                      </button>
                      <button 
                        className="next-button"
                        onClick={() => {
                          setSetupX(false);
                          handleNext();
                        }}
                        style={{ 
                          flex: 1,
                          backgroundColor: 'transparent',
                          border: '1px solid white',
                          color: '#FFF'
                        }}
                      >
                        Skip for now
                      </button>
                    </div>
                  </div>
                </>
              ) : slides[currentStep].hasXLabel ? (
                <div style={{ width: '90%', textAlign: 'center' }}>
                  <img 
                    src={slides[currentStep].previewImage}
                    alt="X Account Preview"
                    style={{
                      width: '100%',
                      marginBottom: '20px',
                      borderRadius: '8px'
                    }}
                  />
                  <a 
                    href="https://devcommunity.x.com/t/introducing-automated-account-labeling/166830"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <button 
                      className="next-button"
                      style={{
                        width: '110%',
                        backgroundColor: 'transparent',
                        color: 'white',
                        marginTop: '20px',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid white',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      Read guide
                     
                    </button>
                  </a>
                </div>
              ) : slides[currentStep].hasXExtension ? (
                <div style={{ width: '90%', textAlign: 'center' }}>
                  <button 
                    className="next-button"
                    onClick={handleNext}
                    style={{
                      width: '110%',
                      backgroundColor: 'transparent',
                      color: 'white',
                      marginTop: '20px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid white',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    Download now
                  </button>
                </div>
              ) : slides[currentStep].hasXDetails ? (
                <div style={{ width: '90%' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#666', marginBottom: '8px' }}>Email address</p>
                    <input
                      type="email"
                      placeholder="satoshi@xade.xyz"
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
                    <p style={{ color: '#666', marginBottom: '8px' }}>Username</p>
                    <input
                      type="text"
                      placeholder="Satoshi"
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
                    <p style={{ color: '#666', marginBottom: '8px' }}>Password</p>
                    <input
                      type="password"
                      placeholder="Satoshi"
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
                    <p style={{ color: '#666', marginBottom: '8px' }}>Auth Code from browser extension</p>
                    <input
                      type="text"
                      placeholder="Satoshi"
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
                      fontWeight: '500'
                    }}
                  >
                    Continue
                  </button>
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

                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#666', marginBottom: '8px' }}>Posting Configuration:</p>
                        <p style={{ margin: 0 }}>
                          Clients: {postingClients.length > 0 ? postingClients.map(c => c === 'terminal' ? 'Xade Terminal' : 'X').join(', ') : 'None'}<br/>
                          Interval: {postingInterval} minutes<br/>
                          Topics: {postingTopics || 'Not specified'}
                        </p>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ color: '#666', marginBottom: '8px' }}>Chat Configuration:</p>
                        <p style={{ margin: 0 }}>
                          Clients: {chatClients.length > 0 ? chatClients.map(c => c === 'terminal' ? 'Xade Terminal' : 'X').join(', ') : 'None'}<br/>
                          Reply to: {replyToUsernames.map(username => `@${username}`).join(', ')}<br/>
                          Reply to replies and quotes: {replyToReplies ? 'Yes' : 'No'}
                        </p>
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
                      onClick={() => navigate(`/chat/${agentName}`)}
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
              ) : slides[currentStep].hasActivities ? (
                <div style={{ width: '90%' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div
                      onClick={() => handleActivitySelect('post')}
                      style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        border: selectedActivities.includes('post') ? '1px solid white' : '1px solid transparent'
                      }}
                    >
                      <img 
                        src="https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture8.png" 
                        alt="Post sentiently"
                        style={{
                          width: '100%',
                          height: 'auto',
                          marginBottom: '8px',
                          borderRadius: '8px'
                        }}
                      />
                      <p style={{ margin: 0, textAlign: 'center' }}>Post sentiently</p>
                    </div>
                    
                    <div
                      onClick={() => handleActivitySelect('chat')}
                      style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        border: selectedActivities.includes('chat') ? '1px solid white' : '1px solid transparent'
                      }}
                    >
                      <img 
                        src="https://wbsnlpviggcnwqfyfobh.supabase.co/storage/v1/object/public/app//picture9.png" 
                        alt="Chat and Interact"
                        style={{
                          width: '100%',
                          height: 'auto',
                          marginBottom: '8px',
                          borderRadius: '8px'
                        }}
                      />
                      <p style={{ margin: 0, textAlign: 'center' }}>Chat and Interact</p>
                    </div>
                  </div>
                </div>
              ) : slides[currentStep].hasModelSelection ? (
                <div style={{ width: '90%' }}>
                  <p>{slides[currentStep].content}</p>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      height: '48px',
                      fontSize: '14px',
                      marginBottom: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="io-net">Llama-3.3-70B-Instruct by io-net</option>
                  </select>
                  
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
              ) : (
                <p style={{ marginBottom: '1.5rem' }}>{slides[currentStep].content}</p>
              )}
              {currentStep === 0 ? (
                <button 
                  className="next-button"
                  onClick={handleNext}
                  style={{ marginTop: '1rem' }}
                >
                  Let's get started
                </button>
              ) : (
                <button 
                  className="next-button"
                  onClick={handleNext}
                  disabled={currentStep === slides.length - 1}
                  style={{ 
                    marginTop: '1rem',
                    display: (currentStep === slides.length - 1 || 
                            currentStep === 5 || 
                            currentStep === 2 ||
                            currentStep === 6 ||
                            currentStep === 7 ||
                            currentStep === 8 ||
                            currentStep === 9 ||
                            currentStep === 4 ||
                            slides[currentStep].hasReview ||
                            slides[currentStep].hasXDetails) ? 'none' : 'block'
                  }}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AgentLauncher;
