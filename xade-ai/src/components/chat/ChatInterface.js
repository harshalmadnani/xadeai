import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Select, MenuItem, InputAdornment, Typography, Link, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { styles } from './ChatInterfaceStyles';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import { createClient } from '@supabase/supabase-js';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const supabaseUrl = 'https://wbsnlpviggcnwqfyfobh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indic25scHZpZ2djbndxZnlmb2JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc2NTcwNiwiZXhwIjoyMDU0MzQxNzA2fQ.tr6PqbiAXQYSQSpG2wS6I4DZfV1Gc3dLXYhKwBrJLS0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a new component for the UI
const ChatInterfaceUI = ({
  disclaimerAccepted,
  renderDisclaimerDialog,
  showAnnouncement,
  styles,
  messages,
  messageListRef,
  input,
  isLoading,
  error,
  errorSnackbar,
  // Handler functions
  handleCloseAnnouncement,
  handleSubmit,
  setInput,
  handleCloseErrorSnackbar,
  renderMessage,
  portfolioAddresses,
  isWalletDialogOpen,
  newWalletAddress,
  handleOpenWalletDialog,
  handleCloseWalletDialog,
  handleAddWalletAddress,
  handleRemoveWalletAddress,
  setNewWalletAddress,
  isThesisDialogOpen,
  customThesis,
  handleOpenThesisDialog,
  handleCloseThesisDialog,
  handleSaveThesis,
  isSettingsOpen,
  handleOpenSettings,
  handleCloseSettings,
  selectedAgentName,
  agentDescription,
}) => (
  <div style={{
    ...styles.chatInterface,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  }}>
    {renderDisclaimerDialog()}
    <div style={{
      ...styles.messageListContainer,
      padding: '20px',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
      flex: 1,
      overflowY: 'auto',
    }}>
      <div style={styles.messageList} ref={messageListRef}>
        {messages.length === 0 ? (
          <div style={styles.welcomeMessage}>
            <Typography variant="h5" style={{ color: 'white', marginBottom: '20px', fontSize: '24px' }}>
            Welcome to {selectedAgentName || 'Xade'}! 👋
            </Typography>
            <Typography style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '30px', fontSize: '16px' }}>
              {agentDescription || 'I am here to help'}
            </Typography>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '12px',
              width: '100%',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {[
                // Sample questions removed
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => setInput(`${suggestion.question.toLowerCase()}`)}
                  style={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '16px',
                    borderRadius: '12px',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{suggestion.icon}</span>
                    <span style={{ 
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '500',
                      lineHeight: '1.4'
                    }}>
                      {suggestion.question}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
      </div>
    </div>

    <form onSubmit={handleSubmit} style={{
      ...styles.inputForm,
      padding: '20px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'sticky',
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
    }}>
      <TextField
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Ask me anything about crypto..."
        disabled={isLoading}
        multiline
        maxRows={3}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton 
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{ color: isLoading ? 'rgba(255, 255, 255, 0.3)' : 'white' }}
              >
                {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </InputAdornment>
          ),
          style: {
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '12px'
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { border: 'none' },
            '&:hover fieldset': { border: 'none' },
            '&.Mui-focused fieldset': { border: 'none' }
          }
        }}
      />
    </form>

    {/* Enhanced Wallet Dialog */}
    <Dialog 
      open={isWalletDialogOpen} 
      onClose={handleCloseWalletDialog}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: '#1a1a1a',
          color: 'white',
          borderRadius: '16px'
        }
      }}
    >
      <DialogTitle style={{ color: 'white', fontSize: '16px' }}>Manage Wallet Addresses</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ color: '#999', fontSize: '14px' }}>
          Add or remove wallet addresses to analyze your portfolio.
        </DialogContentText>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <TextField
            fullWidth
            value={newWalletAddress}
            onChange={(e) => setNewWalletAddress(e.target.value)}
            placeholder="Enter wallet address"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: '#444',
                },
                '&:hover fieldset': {
                  borderColor: '#666',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#888',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#666',
                opacity: 1,
              },
            }}
          />
          <Button
            onClick={handleAddWalletAddress}
            variant="contained"
            style={{ 
              minWidth: 'auto',
              backgroundColor: '#333',
              color: 'white',
            }}
          >
            <AddIcon />
          </Button>
        </div>
        
        {/* Display list of added addresses */}
        <div style={{ marginTop: '20px' }}>
          {portfolioAddresses.map((address, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '10px',
              backgroundColor: '#333',
              padding: '8px',
              borderRadius: '4px',
            }}>
              <Typography style={{ 
                flex: 1, 
                wordBreak: 'break-all',
                color: 'white',
              }}>
                {address}
              </Typography>
              <IconButton 
                onClick={() => handleRemoveWalletAddress(index)} 
                size="small"
                style={{ color: '#ff4444' }}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          ))}
        </div>
      </DialogContent>
      <DialogActions style={{ padding: '16px' }}>
        <Button 
          onClick={handleCloseWalletDialog}
          style={{
            color: 'white',
            backgroundColor: '#333',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>

    <InvestmentThesisDialog
      open={isThesisDialogOpen}
      onClose={handleCloseThesisDialog}
      onSave={handleSaveThesis}
      currentThesis={customThesis}
    />

    <SettingsDialog
      open={isSettingsOpen}
      onClose={handleCloseSettings}
      portfolioAddresses={portfolioAddresses}
      handleOpenWalletDialog={handleOpenWalletDialog}
      handleOpenThesisDialog={handleOpenThesisDialog}
    />
  </div>
);

// Add this component before the ChatInterface function
const InvestmentThesisDialog = ({ open, onClose, onSave, currentThesis }) => {
  const [thesis, setThesis] = useState(currentThesis);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(thesis);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: '#000000',
          color: 'white',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }
      }}
    >
      <DialogTitle style={{ 
        color: 'white',
        fontSize: '32px',
        fontWeight: '600',
        padding: '0 0 24px 0',
        letterSpacing: '-0.5px'
      }}>
        Investment Strategy
      </DialogTitle>

      <DialogContent style={{ padding: '0' }}>
        <Typography style={{ 
          color: '#666', 
          marginBottom: '40px',
          fontSize: '15px',
          lineHeight: '1.6',
          letterSpacing: '0.2px'
        }}>
          Define your investment parameters for personalized AI recommendations
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '48px' }}>
            <Typography variant="h6" style={{ 
              color: '#fff',
              fontSize: '18px',
              marginBottom: '24px',
              fontWeight: '500',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              Strategy Rules
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Example: Buy when RSI &lt; 30 with increasing volume and MACD bullish crossover"
              value={thesis.buyStrategy}
              onChange={(e) => setThesis({...thesis, buyStrategy: e.target.value})}
              margin="normal"
              label="Entry Strategy"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  background: '#111111',
                  borderRadius: '16px',
                  transition: 'all 0.2s ease',
                  '& fieldset': { 
                    border: '1px solid #222',
                  },
                  '&:hover fieldset': { 
                    borderColor: '#444'
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: '#666'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#666'
                },
                marginBottom: '24px'
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Example: Exit when price drops below 20-day MA or RSI &gt; 70"
              value={thesis.sellStrategy}
              onChange={(e) => setThesis({...thesis, sellStrategy: e.target.value})}
              margin="normal"
              label="Exit Strategy"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  background: '#111111',
                  borderRadius: '16px',
                  transition: 'all 0.2s ease',
                  '& fieldset': { 
                    border: '1px solid #222',
                  },
                  '&:hover fieldset': { 
                    borderColor: '#444'
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: '#666'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#666'
                }
              }}
            />
          </div>

          <div style={{ marginBottom: '48px' }}>
            <Typography variant="h6" style={{ 
              color: '#fff',
              fontSize: '18px',
              marginBottom: '24px',
              fontWeight: '500',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              Risk Parameters
            </Typography>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '24px',
              margin: '0 0' // Ensure no unexpected margins
            }}>
              <div style={{
                background: '#111111',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #222',
                width: '100%', // Ensure full width within grid cell
                boxSizing: 'border-box' // Include padding in width calculation
              }}>
                <Typography style={{ 
                  color: '#666', 
                  marginBottom: '16px',
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  Risk Tolerance
                </Typography>
                <Select
                  fullWidth
                  value={thesis.preferences.riskTolerance}
                  onChange={(e) => setThesis({
                    ...thesis, 
                    preferences: {...thesis.preferences, riskTolerance: e.target.value}
                  })}
                  sx={{ 
                    color: 'white',
                    backgroundColor: '#000',
                    borderRadius: '12px',
                    width: '100%', // Ensure full width
                    '& .MuiOutlinedInput-notchedOutline': { 
                      border: '1px solid #333'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { 
                      borderColor: '#444'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                      borderColor: '#666'
                    }
                  }}
                >
                  <MenuItem value="low">Conservative</MenuItem>
                  <MenuItem value="medium">Moderate</MenuItem>
                  <MenuItem value="high">Aggressive</MenuItem>
                </Select>
              </div>

              <div style={{
                background: '#111111',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #222'
              }}>
                <Typography style={{ 
                  color: '#666', 
                  marginBottom: '16px',
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  Time Horizon
                </Typography>
                <Select
                  fullWidth
                  value={thesis.preferences.timeHorizon}
                  onChange={(e) => setThesis({
                    ...thesis, 
                    preferences: {...thesis.preferences, timeHorizon: e.target.value}
                  })}
                  sx={{ 
                    color: 'white',
                    backgroundColor: '#000',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': { 
                      border: '1px solid #333'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { 
                      borderColor: '#444'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                      borderColor: '#666'
                    }
                  }}
                >
                  <MenuItem value="short">Short Term (&lt; 1 month)</MenuItem>
                  <MenuItem value="medium">Medium Term (1-6 months)</MenuItem>
                  <MenuItem value="long">Long Term (&gt; 6 months)</MenuItem>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Typography variant="h6" style={{ 
              color: '#fff',
              fontSize: '18px',
              marginBottom: '24px',
              fontWeight: '500',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              Performance Metrics
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Example: Weight technical indicators 60%, fundamentals 40%"
              value={thesis.ratingCalculation}
              onChange={(e) => setThesis({...thesis, ratingCalculation: e.target.value})}
              label="Custom Rating Formula"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  background: '#111111',
                  borderRadius: '16px',
                  transition: 'all 0.2s ease',
                  '& fieldset': { 
                    border: '1px solid #222',
                  },
                  '&:hover fieldset': { 
                    borderColor: '#444'
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: '#666'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#666'
                }
              }}
            />
          </div>
        </form>
      </DialogContent>

      <DialogActions style={{ 
        padding: '32px 0 0 0',
        borderTop: '1px solid #222',
        marginTop: '48px',
        gap: '16px'
      }}>
        <Button 
          onClick={onClose}
          style={{
            color: '#999',
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '12px 24px',
            textTransform: 'none',
            fontSize: '15px',
            fontWeight: '500',
            border: '1px solid #222',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#222'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          style={{ 
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '12px',
            padding: '12px 32px',
            textTransform: 'none',
            fontSize: '15px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#e0e0e0'
            }
          }}
        >
          Save Strategy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Add new Settings component
const SettingsDialog = ({
  open,
  onClose,
  portfolioAddresses,
  handleOpenWalletDialog,
  handleOpenThesisDialog,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      style: {
        backgroundColor: '#000000',
        color: 'white',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }
    }}
  >
    <DialogTitle style={{ 
      color: 'white',
      fontSize: '32px',
      fontWeight: '600',
      padding: '0 0 24px 0',
      letterSpacing: '-0.5px'
    }}>
      Settings
    </DialogTitle>

    <DialogContent style={{ padding: '0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Button
          onClick={() => {
            handleOpenWalletDialog();
            onClose();
          }}
          variant="outlined"
          style={{
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            textTransform: 'none',
            padding: '16px 20px',
            fontSize: '14px',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <WalletIcon />
            <span>Portfolio Settings</span>
          </div>
          <span>({portfolioAddresses.length} addresses)</span>
        </Button>

        <Button
          onClick={() => {
            handleOpenThesisDialog();
            onClose();
          }}
          variant="outlined"
          style={{
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            textTransform: 'none',
            padding: '16px 20px',
            fontSize: '14px',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RocketLaunchIcon />
            <span>Investment Strategy</span>
          </div>
        </Button>
      </div>
    </DialogContent>

    <DialogActions style={{ 
      padding: '32px 0 0 0',
      borderTop: '1px solid #222',
      marginTop: '48px'
    }}>
      <Button 
        onClick={onClose}
        style={{
          color: '#999',
          backgroundColor: '#111',
          borderRadius: '12px',
          padding: '12px 24px',
          textTransform: 'none',
          fontSize: '15px',
          fontWeight: '500',
          border: '1px solid #222',
        }}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

function ChatInterface({ selectedAgent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [errorSnackbar, setErrorSnackbar] = useState({ open: false, message: '' });
  const [responseTime, setResponseTime] = useState(null);
  const messageListRef = useRef(null);
  const [portfolioAddresses, setPortfolioAddresses] = useState([]);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [customThesis, setCustomThesis] = useState({
    buyStrategy: '',
    sellStrategy: '',
    ratingCalculation: '',
    preferences: {
      riskTolerance: 'medium',
      timeHorizon: 'medium',
      preferredMetrics: []
    }
  });
  const [isThesisDialogOpen, setIsThesisDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [agentPrompt, setAgentPrompt] = useState('');
  const [selectedAgentName, setSelectedAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('agents2')
          .select('prompt, name, description')
          .eq('id', selectedAgent)
          .single();
        
        if (error) throw error;
        if (data) {
          setAgentPrompt(data.prompt);
          setSelectedAgentName(data.name);
          setAgentDescription(data.description);
        }
      } catch (error) {
        console.error('Error fetching agent details:', error);
        setErrorSnackbar({
          open: true,
          message: 'Failed to fetch agent details'
        });
      }
    };

    if (selectedAgent) {
      fetchAgentDetails();
    }
  }, [selectedAgent]);

  const callOpenAIAPI = async (userInput) => {
    try {
      const response = await axios.post('https://analyze-slaz.onrender.com/analyze', {
        query: userInput,
        systemPrompt: `You are Xade AI's response agent where the user query was ${userInput} and your character prompt is ${agentPrompt}`
      });

      return response.data;
    } catch (error) {
      console.error('Error calling analyze API:', error);
      throw new Error('Failed to get AI response');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    try {
      const response = await callOpenAIAPI(userInput);

      if (response?.success && response?.data?.analysis) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.analysis
        }]);
      } else {
        throw new Error('Invalid response format from API');
      }

      const endTime = Date.now();
      setResponseTime(endTime - startTime);

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message);
      setErrorSnackbar({ open: true, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message, index) => {
    const formatContent = (content) => {
      if (typeof content !== 'string') {
        content = String(content);
      }
      
      content = content.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #00a0ff; text-decoration: none;">$1</a>'
      );
      
      content = content.replace(
        /\*\*(.*?)\*\*/g,
        '<span style="font-weight: 600;">$1</span>'
      );
      
      content = content.replace(
        /###\s*(.*?)(\n|$)/g,
        '<div style="font-size: 19px; font-weight: 600; margin: 1em 0;">$1</div>'
      );
      
      content = content.replace(
        /```(.*?)\n([\s\S]*?)```/g,
        '<pre style="background-color: rgba(0, 0, 0, 0.1); padding: 1em; border-radius: 4px; overflow-x: auto; font-size: 18px;"><code>$2</code></pre>'
      );
      
      content = content.replace(
        /`([^`]+)`/g,
        '<code style="background-color: rgba(0, 0, 0, 0.1); padding: 0.2em 0.4em; border-radius: 3px; font-size: 18px;">$1</code>'
      );
      
      content = content.replace(
        /^\s*[-*]\s(.+)$/gm,
        '<li style="margin-left: 20px; font-size: 18px;">$1</li>'
      );

      return content;
    };

    return (
      <div key={index} style={{
        ...styles.message,
        maxWidth: '95%',
        marginLeft: message.role === 'user' ? 'auto' : '0',
        marginRight: '0'
      }}>
        {message.role === 'assistant' && (
          <img 
            src='/1.png'
            alt="Xade AI" 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              marginRight: '12px'
            }}
          />
        )}
        <div style={{
          ...styles.bubble,
          ...(message.role === 'user' ? styles.userBubble : styles.assistantBubble),
          fontSize: '18px',
          textAlign: 'left',
          maxWidth: '100%',
          padding: '14px 18px',
          lineHeight: '1.6',
        }}>
          <div 
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
            style={{
              lineHeight: '1.6',
              fontSize: '18px',
              textAlign: 'left',
              '& a': {
                color: '#00a0ff',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }
            }}
          />
          {message.role === 'assistant' && index === messages.length - 1 && responseTime && (
            <Typography variant="caption" style={{ 
              marginTop: '8px', 
              color: '#888', 
              fontSize: '13px',
              display: 'block',
              textAlign: 'left' 
            }}>
              Response time: {responseTime}ms
            </Typography>
          )}
        </div>
      </div>
    );
  };

  const handleAcceptDisclaimer = () => {
    setDisclaimerAccepted(true);
  };

  const renderDisclaimerDialog = () => (
    <Dialog
      open={!disclaimerAccepted}
      aria-labelledby="disclaimer-dialog-title"
      aria-describedby="disclaimer-dialog-description"
      PaperProps={{
        style: {
          backgroundColor: 'white',
          color: 'black',
          fontFamily: "'SK Modernist', sans-serif",
        },
      }}
    >
      <DialogTitle id="disclaimer-dialog-title" style={{ 
        textAlign: 'center', 
        fontSize: '24px',
        fontWeight: 'bold',
      }}>
        {"DISCLAIMER"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="disclaimer-dialog-description" style={{ 
          fontSize: '20px', 
          textAlign: 'center',
          color: 'black',
          fontWeight: 'bold',
        }}>
          NOT FINANCIAL ADVICE
        </DialogContentText>
        <DialogContentText style={{ 
          marginTop: '20px',
          color: 'black',
        }}>
          The information provided by this application is for informational purposes only and should not be considered as financial advice. Always conduct your own research and consult with a qualified financial advisor before making any investment decisions.
        </DialogContentText>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center', padding: '20px' }}>
        <Button 
          onClick={handleAcceptDisclaimer} 
          variant="contained" 
          style={{ 
            backgroundColor: 'black',
            color: 'white',
            width: '200px',
          }}
        >
          Accept and Continue
        </Button>
      </DialogActions>
    </Dialog>
  );

  const handleCloseErrorSnackbar = () => {
    setErrorSnackbar({ open: false, message: '' });
  };

  const handleOpenWalletDialog = () => {
    setIsWalletDialogOpen(true);
  };

  const handleCloseWalletDialog = () => {
    setIsWalletDialogOpen(false);
    setNewWalletAddress('');
  };

  const handleAddWalletAddress = () => {
    if (newWalletAddress.trim() && !portfolioAddresses.includes(newWalletAddress.trim())) {
      setPortfolioAddresses([...portfolioAddresses, newWalletAddress.trim()]);
      setNewWalletAddress('');
    }
  };

  const handleRemoveWalletAddress = (index) => {
    setPortfolioAddresses(portfolioAddresses.filter((_, i) => i !== index));
  };

  const handleOpenThesisDialog = () => {
    setIsThesisDialogOpen(true);
  };

  const handleCloseThesisDialog = () => {
    setIsThesisDialogOpen(false);
  };

  const handleSaveThesis = (newThesis) => {
    setCustomThesis(newThesis);
    setIsThesisDialogOpen(false);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };
  
  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <ChatInterfaceUI
      disclaimerAccepted={disclaimerAccepted}
      renderDisclaimerDialog={renderDisclaimerDialog}
      showAnnouncement={showAnnouncement}
      styles={styles}
      messages={messages}
      messageListRef={messageListRef}
      input={input}
      isLoading={isLoading}
      error={error}
      errorSnackbar={errorSnackbar}
      handleSubmit={handleSubmit}
      setInput={setInput}
      handleCloseErrorSnackbar={handleCloseErrorSnackbar}
      renderMessage={renderMessage}
      portfolioAddresses={portfolioAddresses}
      isWalletDialogOpen={isWalletDialogOpen}
      newWalletAddress={newWalletAddress}
      handleOpenWalletDialog={handleOpenWalletDialog}
      handleCloseWalletDialog={handleCloseWalletDialog}
      handleAddWalletAddress={handleAddWalletAddress}
      handleRemoveWalletAddress={handleRemoveWalletAddress}
      setNewWalletAddress={setNewWalletAddress}
      isThesisDialogOpen={isThesisDialogOpen}
      customThesis={customThesis}
      handleOpenThesisDialog={handleOpenThesisDialog}
      handleCloseThesisDialog={handleCloseThesisDialog}
      handleSaveThesis={handleSaveThesis}
      isSettingsOpen={isSettingsOpen}
      handleOpenSettings={handleOpenSettings}
      handleCloseSettings={handleCloseSettings}
      selectedAgentName={selectedAgentName}
      agentDescription={agentDescription}
    />
  );
}

export default ChatInterface;