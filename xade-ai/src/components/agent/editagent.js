import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './SocialAgentLauncher.css'; // Reusing styles from SocialAgentLauncher
import { WalletContext, useWallet } from '../../App';
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

const EditAgent = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Add this line to handle back navigation properly
  const handleBackClick = () => navigate(-1);
  
  // Agent data states
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentImage, setAgentImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [postingClients, setPostingClients] = useState([]);
  const [postingInterval, setPostingInterval] = useState('60');
  const [postingTopics, setPostingTopics] = useState('');
  const [chatClients, setChatClients] = useState([]);
  const [replyToUsernames, setReplyToUsernames] = useState([]);
  const [replyToReplies, setReplyToReplies] = useState(false);
  const [qaList, setQaList] = useState([]);
  const [postList, setPostList] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentPost, setCurrentPost] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [twitterUsername, setTwitterUsername] = useState('');
  const [twitterPassword, setTwitterPassword] = useState('');
  const [twitterEmail, setTwitterEmail] = useState('');
  const [twitter2FASecret, setTwitter2FASecret] = useState('');
  const [twitterCookies, setTwitterCookies] = useState('');
  const { walletAddress } = useWallet();
  const [actualAgentId, setActualAgentId] = useState(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

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

  // Fetch agent data on component mount
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        // First, determine which agent ID to use
        let targetAgentId = agentId;
        
        // If wallet address is available, try to find the agent by user_id
        if (walletAddress && !agentId) {
          const { data: agentData, error: agentError } = await supabase
            .from('agents2')
            .select('id')
            .eq('user_id', walletAddress)
            .single();
            
          if (agentError && agentError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" error, which is expected if user has no agent
            throw agentError;
          }
          
          if (agentData) {
            targetAgentId = agentData.id;
            setActualAgentId(targetAgentId);
          } else {
            // No agent found for this wallet
            setIsLoading(false);
            return;
          }
        }
        
        // If we don't have an agent ID at this point, we can't proceed
        if (!targetAgentId) {
          setIsLoading(false);
          return;
        }

        console.log("Fetching agent data for ID:", targetAgentId);
        
        const { data, error } = await supabase
          .from('agents2')
          .select('*')
          .eq('id', targetAgentId)
          .single();

        if (error) {
          console.error("Error fetching agent data:", error);
          throw error;
        }
        
        console.log("Raw agent data from DB:", data);
        
        if (data) {
          // Parse string data if needed
          const parseJsonField = (field) => {
            if (typeof field === 'string') {
              try {
                return JSON.parse(field);
              } catch (e) {
                console.error(`Error parsing JSON field:`, e);
                return field;
              }
            }
            return field;
          };
          
          // Parse all potentially stringified JSON fields
          const parsedData = {
            ...data,
            data_sources: parseJsonField(data.data_sources),
            activities: parseJsonField(data.activities),
            post_configuration: parseJsonField(data.post_configuration),
            chat_configuration: parseJsonField(data.chat_configuration),
            sample_questions: parseJsonField(data.sample_questions),
            sample_posts: parseJsonField(data.sample_posts)
          };
          
          // Log specific fields before setting state
          console.log("Post configuration (parsed):", parsedData.post_configuration);
          console.log("Chat configuration (parsed):", parsedData.chat_configuration);
          console.log("Data sources (parsed):", parsedData.data_sources);
          console.log("Activities (parsed):", parsedData.activities);
          
          // Ensure all data is properly set with fallbacks for null/undefined values
          setAgentName(parsedData.name || '');
          setAgentDescription(parsedData.description || '');
          setCurrentImageUrl(parsedData.image || '');
          
          // Handle data sources with extra logging
          const sourcesArray = Array.isArray(parsedData.data_sources) ? parsedData.data_sources : [];
          console.log("Setting data sources to:", sourcesArray);
          setSelectedSources(sourcesArray);
          
          // Handle activities with extra logging
          const activitiesArray = Array.isArray(parsedData.activities) ? parsedData.activities : [];
          console.log("Setting activities to:", activitiesArray);
          setSelectedActivities(activitiesArray);
          
          setPrompt(parsedData.prompt || '');
          setSelectedModel(parsedData.model || 'gpt-4o');
          
          // Set posting configuration with proper fallbacks and extra logging
          if (parsedData.post_configuration) {
            const clients = Array.isArray(parsedData.post_configuration.clients) ? parsedData.post_configuration.clients : [];
            const interval = parsedData.post_configuration.interval?.toString() || '60';
            const topics = parsedData.post_configuration.topics || '';
            
            console.log("Setting posting clients to:", clients);
            console.log("Setting posting interval to:", interval);
            console.log("Setting posting topics to:", topics);
            
            setPostingClients(clients);
            setPostingInterval(interval);
            setPostingTopics(topics);
          } else {
            console.log("No post_configuration found in data");
          }
          
          // Set chat configuration with proper fallbacks
          if (parsedData.chat_configuration) {
            const clients = Array.isArray(parsedData.chat_configuration.clients) ? parsedData.chat_configuration.clients : [];
            const usernames = Array.isArray(parsedData.chat_configuration.reply_to_usernames) ? parsedData.chat_configuration.reply_to_usernames : [];
            const replyToRepliesValue = parsedData.chat_configuration.reply_to_replies === true;
            
            console.log("Setting chat clients to:", clients);
            console.log("Setting reply usernames to:", usernames);
            console.log("Setting reply to replies to:", replyToRepliesValue);
            
            setChatClients(clients);
            setReplyToUsernames(usernames);
            setReplyToReplies(replyToRepliesValue);
          } else {
            console.log("No chat_configuration found in data");
          }
          
          // Set sample Q&As with proper validation
          if (parsedData.sample_questions && Array.isArray(parsedData.sample_questions)) {
            setQaList(parsedData.sample_questions.map(q => ({
              question: q.question || '',
              answer: q.answer || ''
            })));
          }
          
          // Set sample posts with proper validation
          if (parsedData.sample_posts && Array.isArray(parsedData.sample_posts)) {
            setPostList(parsedData.sample_posts.filter(post => typeof post === 'string'));
          }
          
          // Set Twitter credentials if they exist
          if (parsedData.twitter_credentials) {
            try {
              const credentials = typeof parsedData.twitter_credentials === 'string' 
                ? JSON.parse(parsedData.twitter_credentials) 
                : parsedData.twitter_credentials;
                
              console.log("Loading Twitter credentials:", credentials);
              setTwitterUsername(credentials['TWITTER_USERNAME'] || '');
              setTwitterPassword(credentials['TWITTER_PASSWORD'] || '');
              setTwitterEmail(credentials['TWITTER_EMAIL'] || '');
              setTwitter2FASecret(credentials['TWITTER_2FA_SECRET'] || '');
              
              // Log the credentials to verify they're being set correctly
              console.log("Twitter credentials set:", {
                username: credentials['TWITTER_USERNAME'],
                email: credentials['TWITTER_EMAIL'],
                password: credentials['TWITTER_PASSWORD'] ? '(password set)' : '(no password)',
                twoFA: credentials['TWITTER_2FA_SECRET'] ? '(2FA set)' : '(no 2FA)'
              });
            } catch (e) {
              console.error('Error parsing Twitter credentials:', e);
            }
          }
          
          // Set Twitter cookies if they exist
          if (parsedData.cookies && Array.isArray(parsedData.cookies)) {
            setTwitterCookies(parsedData.cookies.join('\n'));
          }
          
          // Log the entire agent data for debugging
          console.log("Loaded agent data:", {
            name: parsedData.name,
            description: parsedData.description,
            data_sources: parsedData.data_sources,
            activities: parsedData.activities,
            post_configuration: parsedData.post_configuration,
            chat_configuration: parsedData.chat_configuration,
            sample_questions: parsedData.sample_questions?.length,
            sample_posts: parsedData.sample_posts?.length,
            twitter_credentials: !!parsedData.twitter_credentials,
            cookies: !!parsedData.cookies
          });
        }
      } catch (error) {
        console.error('Error fetching agent data:', error);
        alert('Failed to load agent data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentData();
  }, [agentId, walletAddress]);

  // Add debugging in render to see what values are actually in state
  useEffect(() => {
    console.log("Current state values:");
    console.log("- selectedSources:", selectedSources);
    console.log("- selectedActivities:", selectedActivities);
    console.log("- postingClients:", postingClients);
    console.log("- postingInterval:", postingInterval);
    console.log("- postingTopics:", postingTopics);
    console.log("- chatClients:", chatClients);
    console.log("- replyToUsernames:", replyToUsernames);
    console.log("- replyToReplies:", replyToReplies);
  }, [selectedSources, selectedActivities, postingClients, postingInterval, postingTopics, chatClients, replyToUsernames, replyToReplies]);

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

  const handleAddQA = () => {
    if (currentQuestion.trim() && currentAnswer.trim()) {
      const newQA = {
        question: currentQuestion.trim(),
        answer: currentAnswer.trim()
      };
      setQaList([...qaList, newQA]);
      setCurrentQuestion('');
      setCurrentAnswer('');
    }
  };

  const handleAddPost = () => {
    if (currentPost.trim()) {
      const newPost = currentPost.trim();
      setPostList([...postList, newPost]);
      setCurrentPost('');
    }
  };

  const handleRemoveQA = (index) => {
    const newList = qaList.filter((_, i) => i !== index);
    setQaList(newList);
  };

  const handleRemovePost = (index) => {
    const newList = postList.filter((_, i) => i !== index);
    setPostList(newList);
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
      alert('Failed to improve prompt');
    } finally {
      setIsImprovingPrompt(false);
    }
  };

  const handleSaveAgent = async () => {
    setIsSaving(true);
    try {
      // Validate posting interval
      if (postingInterval && parseInt(postingInterval) < 2) {
        alert('Posting interval must be at least 2 minutes');
        setIsSaving(false);
        return;
      }

      // Ensure selectedSources is always an array
      const sourcesArray = Array.isArray(selectedSources) ? selectedSources : [];

      // Upload image to storage if a new one is selected
      let imageUrl = currentImageUrl;
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

      // Parse Twitter cookies if provided
      let cookies = null;
      if (twitterCookies.trim()) {
        cookies = twitterCookies.split('\n').filter(cookie => cookie.trim());
      }

      // Prepare Twitter credentials if they exist
      let twitter_credentials = null;
      if (postingClients.includes('x') || chatClients.includes('x')) {
        if (twitterUsername && twitterPassword && twitterEmail) {
          twitter_credentials = {
            'TWITTER_USERNAME': twitterUsername.trim(),
            'TWITTER_PASSWORD': twitterPassword,
            'TWITTER_EMAIL': twitterEmail.trim(),
            'TWITTER_2FA_SECRET': twitter2FASecret.trim()
          };
        } else {
          // If X is selected as a client but credentials are not set up
          alert('Please set up X credentials or remove X from the clients');
          setIsSaving(false);
          return;
        }
      }

      // Determine which agent ID to use for the update
      const targetAgentId = actualAgentId || agentId;
      
      if (!targetAgentId) {
        // If we don't have an agent ID, we need to create a new agent
        const { data: newAgentData, error: createError } = await supabase
          .from('agents2')
          .insert({
            name: agentName,
            description: agentDescription,
            prompt: prompt,
            image: imageUrl,
            data_sources: sourcesArray,
            activities: selectedActivities,
            sample_questions: qaList,
            sample_posts: postList,
            post_configuration: postConfiguration,
            chat_configuration: chatConfiguration,
            twitter_credentials: twitter_credentials ? JSON.stringify(twitter_credentials) : null,
            cookies: cookies,
            model: selectedModel,
            user_id: walletAddress,
            created_at: new Date(),
            updated_at: new Date()
          })
          .select();

        if (createError) throw createError;
        
        alert('Agent created successfully!');
        navigate(-1);
        return;
      }

      // Update agent data in agents2 table
      const { data: agentData, error } = await supabase
        .from('agents2')
        .update({
          name: agentName,
          description: agentDescription,
          prompt: prompt,
          image: imageUrl,
          data_sources: sourcesArray,
          activities: selectedActivities,
          sample_questions: qaList,
          sample_posts: postList,
          post_configuration: postConfiguration,
          chat_configuration: chatConfiguration,
          twitter_credentials: twitter_credentials ? JSON.stringify(twitter_credentials) : null,
          cookies: cookies,
          model: selectedModel,
          updated_at: new Date()
        })
        .eq('id', targetAgentId)
        .select();

      if (error) throw error;

      // Update posting schedule if posting is enabled
      if (postConfiguration.enabled) {
        try {
          // Format the topics and prompt to be more API-friendly
          const sanitizedTopics = postingTopics.trim().replace(/\s+/g, ' ');
          const sanitizedPrompt = prompt.trim().replace(/\s+/g, ' ');
          
          const postingPayload = {
            userId: targetAgentId,
            interval: parseInt(postingInterval),
            query: sanitizedTopics ? `speak about ${sanitizedTopics} while you have access to access to these data sources: ${sourcesArray.join(', ')}` : 'speak about general topics',
            systemPrompt: `You are an AI agent who tweets. ${sanitizedPrompt} Keep all tweets under 260 characters. Here are some example posts to guide your style and tone:\n${postList.map(post => `- "${post}"`).join('\n')}`
          };
          
          const response = await fetch(
            'https://97m15gg62a.execute-api.ap-south-1.amazonaws.com/prod/create',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(postingPayload),
              signal: AbortSignal.timeout(30000)
            }
          );
          
          if (!response.ok) {
            console.error('Failed to update posting schedule:', response.statusText);
          }
        } catch (postingError) {
          console.error('Error updating posting schedule:', postingError);
        }
      }

      alert('Agent updated successfully!');
      navigate(-1);
    } catch (error) {
      console.error('Error updating agent:', error);
      alert(`Failed to update agent: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="agent-launcher-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ ...loadingAnimation, width: '40px', height: '40px', margin: '0 auto 20px' }}></div>
          <p>Loading agent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-launcher-container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <IconButton 
            onClick={handleBackClick}
            sx={{ color: 'white' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <h2 style={{ margin: 0, color: 'white' }}>Edit Agent: {agentName}</h2>
        </div>
        <button 
          onClick={handleSaveAgent}
          disabled={isSaving}
          style={{
            backgroundColor: isSaving ? '#666' : 'white',
            color: 'black',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: isSaving ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isSaving ? (
            <>
              Saving changes
              <div style={loadingAnimation} />
            </>
          ) : 'Save Changes'}
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        height: 'calc(100vh - 80px)'
      }}>
        {/* Sidebar navigation */}
        <div style={{ 
          width: '250px', 
          borderRight: '1px solid #333',
          padding: '20px 0',
          backgroundColor: '#111'
        }}>
          <div 
            onClick={() => setActiveTab('basic')}
            style={{ 
              padding: '12px 20px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'basic' ? '#222' : 'transparent',
              color: 'white',
              borderLeft: activeTab === 'basic' ? '3px solid white' : '3px solid transparent'
            }}
          >
            Basic Information
          </div>
          <div 
            onClick={() => setActiveTab('prompt')}
            style={{ 
              padding: '12px 20px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'prompt' ? '#222' : 'transparent',
              color: 'white',
              borderLeft: activeTab === 'prompt' ? '3px solid white' : '3px solid transparent'
            }}
          >
            Prompt & Model
          </div>
          <div 
            onClick={() => setActiveTab('sources')}
            style={{ 
              padding: '12px 20px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'sources' ? '#222' : 'transparent',
              color: 'white',
              borderLeft: activeTab === 'sources' ? '3px solid white' : '3px solid transparent'
            }}
          >
            Data Sources
          </div>
          <div 
            onClick={() => setActiveTab('activities')}
            style={{ 
              padding: '12px 20px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'activities' ? '#222' : 'transparent',
              color: 'white',
              borderLeft: activeTab === 'activities' ? '3px solid white' : '3px solid transparent'
            }}
          >
            Activities
          </div>
          <div 
            onClick={() => setActiveTab('posting')}
            style={{ 
              padding: '12px 20px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'posting' ? '#222' : 'transparent',
              color: 'white',
              borderLeft: activeTab === 'posting' ? '3px solid white' : '3px solid transparent'
            }}
          >
            Posting Configuration
          </div>
          <div 
            onClick={() => setActiveTab('chat')}
            style={{ 
              padding: '12px 20px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'chat' ? '#222' : 'transparent',
              color: 'white',
              borderLeft: activeTab === 'chat' ? '3px solid white' : '3px solid transparent'
            }}
          >
            Chat Configuration
          </div>
          <div 
            onClick={() => setActiveTab('examples')}
            style={{ 
              padding: '12px 20px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'examples' ? '#222' : 'transparent',
              color: 'white',
              borderLeft: activeTab === 'examples' ? '3px solid white' : '3px solid transparent'
            }}
          >
            Examples
          </div>
          <div 
            onClick={() => setActiveTab('twitter')}
            style={{ 
              padding: '12px 20px',
              cursor: 'pointer',
              backgroundColor: activeTab === 'twitter' ? '#222' : 'transparent',
              color: 'white',
              borderLeft: activeTab === 'twitter' ? '3px solid white' : '3px solid transparent'
            }}
          >
            X Configuration
          </div>
        </div>

        {/* Main content area */}
        <div style={{ 
          flex: 1, 
          padding: '30px', 
          overflowY: 'auto',
          backgroundColor: '#0a0a0a'
        }}>
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>Basic Information</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>Agent Name</p>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter agent name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>Description</p>
                <textarea
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  placeholder="Add some description about the agent that everyone will see"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    minHeight: '100px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>Agent Image</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {(currentImageUrl || agentImage) && (
                    <img 
                      src={agentImage ? URL.createObjectURL(agentImage) : currentImageUrl}
                      alt="Agent"
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button 
                      onClick={handleUploadClick}
                      style={{
                        backgroundColor: '#1a1a1a',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {currentImageUrl ? 'Change Image' : 'Upload Image'}
                    </button>
                    {agentImage && (
                      <p style={{ color: 'green', marginTop: '8px' }}>
                        New image selected: {agentImage.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prompt & Model Tab */}
          {activeTab === 'prompt' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>Prompt & Model</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>System Prompt</p>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Be as specific as possible about how your agent should behave"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    minHeight: '200px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginTop: '10px'
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
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>Language Model</p>
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
                    cursor: 'pointer'
                  }}
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="io-net">Llama-3.3-70B-Instruct by io-net</option>
                </select>
              </div>
            </div>
          )}

          {/* Data Sources Tab */}
          {activeTab === 'sources' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>Data Sources</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>Search Data Sources</p>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for data sources"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginTop: '20px'
              }}>
                {filteredSources.map((source, index) => (
                  <span
                    key={index}
                    onClick={() => handleSourceClick(source)}
                    style={{
                      backgroundColor: selectedSources.includes(source) ? '#333' : '#1a1a1a',
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
              
              <div style={{ marginTop: '20px' }}>
                <p style={{ color: '#999' }}>Selected Sources:</p>
                <p style={{ color: 'white' }}>
                  {selectedSources.length > 0 ? selectedSources.join(', ') : 'No sources selected'}
                </p>
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>Activities</h3>
              
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
                  <p style={{ margin: 0, textAlign: 'center', color: 'white' }}>Post sentiently</p>
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
                  <p style={{ margin: 0, textAlign: 'center', color: 'white' }}>Chat and Interact</p>
                </div>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <p style={{ color: '#999' }}>Selected Activities:</p>
                <p style={{ color: 'white' }}>
                  {selectedActivities.length > 0 ? 
                    selectedActivities.map(activity => 
                      activity === 'post' ? 'Post sentiently' : 'Chat and Interact'
                    ).join(', ') 
                    : 'No activities selected'}
                </p>
              </div>
            </div>
          )}

          {/* Posting Configuration Tab */}
          {activeTab === 'posting' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>Posting Configuration</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>Posting Clients</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div
                    onClick={() => setPostingClients(prev => 
                      prev.includes('terminal') ? prev.filter(c => c !== 'terminal') : [...prev, 'terminal']
                    )}
                    style={{
                      backgroundColor: postingClients.includes('terminal') ? '#333' : '#1a1a1a',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: postingClients.includes('terminal') ? '1px solid white' : '1px solid transparent',
                      color: 'white'
                    }}
                  >
                    Xade Terminal
                  </div>
                  <div
                    onClick={() => setPostingClients(prev => 
                      prev.includes('x') ? prev.filter(c => c !== 'x') : [...prev, 'x']
                    )}
                    style={{
                      backgroundColor: postingClients.includes('x') ? '#333' : '#1a1a1a',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: postingClients.includes('x') ? '1px solid white' : '1px solid transparent',
                      color: 'white'
                    }}
                  >
                    X (Twitter)
                  </div>
                </div>
                <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                  Selected clients: {postingClients.length > 0 ? postingClients.join(', ') : 'None'}
                </p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>Posting Interval (minutes)</p>
                <input
                  type="number"
                  min="2"
                  value={postingInterval}
                  onChange={(e) => setPostingInterval(e.target.value)}
                  placeholder="Enter interval in minutes (minimum 2)"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
                <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                  Minimum interval is 2 minutes
                </p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>Posting Topics</p>
                <textarea
                  value={postingTopics}
                  onChange={(e) => setPostingTopics(e.target.value)}
                  placeholder="Enter topics for your agent to post about (comma separated)"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    minHeight: '100px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          )}

          {/* Chat Configuration Tab */}
          {activeTab === 'chat' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>Chat Configuration</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>Chat Clients</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div
                    onClick={() => setChatClients(prev => 
                      prev.includes('terminal') ? prev.filter(c => c !== 'terminal') : [...prev, 'terminal']
                    )}
                    style={{
                      backgroundColor: chatClients.includes('terminal') ? '#333' : '#1a1a1a',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: chatClients.includes('terminal') ? '1px solid white' : '1px solid transparent',
                      color: 'white'
                    }}
                  >
                    Xade Terminal
                  </div>
                  <div
                    onClick={() => setChatClients(prev => 
                      prev.includes('x') ? prev.filter(c => c !== 'x') : [...prev, 'x']
                    )}
                    style={{
                      backgroundColor: chatClients.includes('x') ? '#333' : '#1a1a1a',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: chatClients.includes('x') ? '1px solid white' : '1px solid transparent',
                      color: 'white'
                    }}
                  >
                    X (Twitter)
                  </div>
                </div>
                <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                  Selected clients: {chatClients.length > 0 ? chatClients.join(', ') : 'None'}
                </p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>Reply to Usernames</p>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={currentUsername}
                    onChange={(e) => setCurrentUsername(e.target.value)}
                    placeholder="Enter username (without @)"
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={handleAddUsername}
                    disabled={!currentUsername.trim()}
                    style={{
                      backgroundColor: currentUsername.trim() ? 'white' : '#333',
                      color: currentUsername.trim() ? 'black' : '#666',
                      padding: '0 20px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: currentUsername.trim() ? 'pointer' : 'default'
                    }}
                  >
                    Add
                  </button>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px',
                  marginTop: '10px'
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
                      <span style={{ color: 'white' }}>@{username}</span>
                      <span 
                        onClick={() => handleRemoveUsername(username)}
                        style={{ 
                          color: '#999', 
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="replyToReplies"
                    checked={replyToReplies}
                    onChange={(e) => setReplyToReplies(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="replyToReplies" style={{ color: 'white' }}>
                    Reply to replies and quotes
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Examples Tab */}
          {activeTab === 'examples' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>Examples</h3>
              
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ color: 'white', marginBottom: '15px' }}>Sample Q&A</h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ color: '#999', marginBottom: '8px' }}>Question</p>
                  <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="Enter a sample question"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ color: '#999', marginBottom: '8px' }}>Answer</p>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Enter the answer to the question"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      minHeight: '100px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <button
                  onClick={handleAddQA}
                  disabled={!currentQuestion.trim() || !currentAnswer.trim()}
                  style={{
                    backgroundColor: currentQuestion.trim() && currentAnswer.trim() ? 'white' : '#333',
                    color: currentQuestion.trim() && currentAnswer.trim() ? 'black' : '#666',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: currentQuestion.trim() && currentAnswer.trim() ? 'pointer' : 'default'
                  }}
                >
                  Add Q&A
                </button>
                
                <div style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                  {qaList && qaList.length > 0 ? (
                    qaList.map((qa, index) => (
                      <div 
                        key={index}
                        style={{
                          backgroundColor: '#1a1a1a',
                          padding: '15px',
                          borderRadius: '10px',
                          marginBottom: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <p style={{ color: 'white', fontWeight: 'bold', margin: 0, wordBreak: 'break-word' }}>Q: {qa.question}</p>
                          <span 
                            onClick={() => handleRemoveQA(index)}
                            style={{ 
                              color: '#999', 
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              marginLeft: '10px',
                              flexShrink: 0
                            }}
                          >
                            ×
                          </span>
                        </div>
                        <p style={{ color: '#ccc', margin: 0, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>A: {qa.answer}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#666', textAlign: 'center' }}>No sample Q&As added yet</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 style={{ color: 'white', marginBottom: '15px' }}>Sample Posts</h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ color: '#999', marginBottom: '8px' }}>Post</p>
                  <textarea
                    value={currentPost}
                    onChange={(e) => setCurrentPost(e.target.value)}
                    placeholder="Enter a sample post (max 280 characters)"
                    maxLength={280}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      minHeight: '100px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                  <p style={{ color: '#666', fontSize: '12px', textAlign: 'right' }}>
                    {currentPost.length}/280
                  </p>
                </div>
                
                <button
                  onClick={handleAddPost}
                  disabled={!currentPost.trim()}
                  style={{
                    backgroundColor: currentPost.trim() ? 'white' : '#333',
                    color: currentPost.trim() ? 'black' : '#666',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: currentPost.trim() ? 'pointer' : 'default'
                  }}
                >
                  Add Post
                </button>
                
                <div style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                  {postList && postList.length > 0 ? (
                    postList.map((post, index) => (
                      <div 
                        key={index}
                        style={{
                          backgroundColor: '#1a1a1a',
                          padding: '15px',
                          borderRadius: '10px',
                          marginBottom: '10px',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <p style={{ color: 'white', margin: 0, wordBreak: 'break-word', whiteSpace: 'pre-wrap', flex: 1 }}>{post}</p>
                        <span 
                          onClick={() => handleRemovePost(index)}
                          style={{ 
                            color: '#999', 
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginLeft: '10px',
                            flexShrink: 0
                          }}
                        >
                          ×
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#666', textAlign: 'center' }}>No sample posts added yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* X Configuration Tab */}
          {activeTab === 'twitter' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>X Configuration</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>X Username</p>
                <input
                  type="text"
                  value={twitterUsername}
                  onChange={(e) => setTwitterUsername(e.target.value)}
                  placeholder="Enter X username"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>X Email</p>
                <input
                  type="email"
                  value={twitterEmail}
                  onChange={(e) => setTwitterEmail(e.target.value)}
                  placeholder="Enter X account email"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>X Password</p>
                <input
                  type="password"
                  value={twitterPassword}
                  onChange={(e) => setTwitterPassword(e.target.value)}
                  placeholder="Enter X account password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>2FA Secret (optional)</p>
                <input
                  type="password"
                  value={twitter2FASecret}
                  onChange={(e) => setTwitter2FASecret(e.target.value)}
                  placeholder="Enter 2FA secret if enabled"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#999', marginBottom: '8px' }}>X Cookies (optional)</p>
                <textarea
                  value={twitterCookies}
                  onChange={(e) => setTwitterCookies(e.target.value)}
                  placeholder="Enter X cookies (one per line)"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    minHeight: '150px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'monospace'
                  }}
                />
                <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                  Paste each cookie on a new line. These are used to maintain the Twitter session.
                </p>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Note: Your credentials and cookies are encrypted and only used to authenticate with X.
                  They are required if you want your agent to post or interact on X.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditAgent;