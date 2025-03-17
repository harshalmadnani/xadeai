import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { coins } from './coins';
import { Select, MenuItem, InputAdornment, createTheme, ThemeProvider, Alert, Snackbar, Typography, Paper, Link, Tabs, Tab } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';     
import { createContext, useContext } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { styles } from './ChatInterfaceStyles';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import HistoryIcon from '@mui/icons-material/History';
import CodeIcon from '@mui/icons-material/Code';
import Terminal from './terminal';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";
// Create a context for storing fetched data
const DataContext = createContext(null);



const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Add Groq import at the top
const Groq = require('groq-sdk');
const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

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
  selectedAgentName, // Add this prop
  agentDescription, // Add this prop
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

// Add AgentLauncher component before ChatInterfaceUI
const AgentLauncher = ({ open, onClose }) => {
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
        No-Code AI Agent Builder
      </DialogTitle>

      <DialogContent style={{ padding: '0' }}>
        <Typography style={{ 
          color: '#666', 
          marginBottom: '40px',
          fontSize: '15px',
          lineHeight: '1.6',
          letterSpacing: '0.2px'
        }}>
          Create your own AI agent without writing any code. Coming soon!
        </Typography>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px'
        }}>
          <RocketLaunchIcon style={{ 
            fontSize: '64px',
            color: '#666'
          }} />
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
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#222'
            }
          }}
        >
          Close
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

function ChatInterface({ selectedAgent }) {  // Add selectedAgent as a prop
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(coins[0]);
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCoins, setFilteredCoins] = useState(coins);
  const [inputTokens, setInputTokens] = useState(0);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  // Create a data object to store all fetched data
  const [data, setData] = useState({
    priceHistoryData: null,
    cryptoPanicNews: null,
    metadata: null,
    historicPortfolioData: null,
    walletPortfolio: null,
  });
  // Add a new state for error snackbar
  const [errorSnackbar, setErrorSnackbar] = useState({ open: false, message: '' });

  // Add a new state for tracking API response time
  const [responseTime, setResponseTime] = useState(null);

  const messageListRef = useRef(null);

  const [marketData, setMarketData] = useState({});
  const [metadata, setMetadata] = useState({});
  const [totalWalletBalance, setTotalWalletBalance] = useState(0);
  const [totalRealizedPNL, setTotalRealizedPNL] = useState(0);
  const [totalUnrealizedPNL, setTotalUnrealizedPNL] = useState(0);
  const [assets, setAssets] = useState([]);
  const [totalPNLHistory, setTotalPNLHistory] = useState({
    '24h': { realized: 0, unrealized: 0 },
    '7d': { realized: 0, unrealized: 0 },
    '30d': { realized: 0, unrealized: 0 },
    '1y': { realized: 0, unrealized: 0 },
  });
  const [isWalletPortfolioLoading, setIsWalletPortfolioLoading] = useState(true);
  const [historicPortfolioData, setHistoricPortfolioData] = useState(null);
  const [priceHistoryData, setPriceHistoryData] = useState({});

  // Add this constant after the existing state declarations
  const priceHistory = Object.entries(priceHistoryData).map(([coinName, data]) => ({
    coinName,
    data: data.map(item => ({
      date: new Date(item[0]),
      price: item[1],
      volume: item[2],
      marketCap: item[3]
    }))
  }));

  const portfolioBalance = totalWalletBalance?.toFixed(2) ?? 'N/A';
  const portfolioRealizedPNL = totalRealizedPNL?.toFixed(2) ?? 'N/A';
  const portfolioUnrealizedPNL = totalUnrealizedPNL?.toFixed(2) ?? 'N/A';

  const portfolioAssetsList = assets?.map(asset => ({
    name: asset.asset?.name ?? 'Unknown',
    symbol: asset.asset?.symbol ?? 'N/A',
    balance: asset.token_balance?.toFixed(6) ?? 'N/A',
    value: asset.estimated_balance?.toFixed(2) ?? 'N/A'
  })) ?? [];

  const portfolioPNLTimelines = {
    '24h': {
      realized: totalPNLHistory?.['24h']?.realized?.toFixed(2) ?? 'N/A',
      unrealized: totalPNLHistory?.['24h']?.unrealized?.toFixed(2) ?? 'N/A'
    },
    '7d': {
      realized: totalPNLHistory?.['7d']?.realized?.toFixed(2) ?? 'N/A',
      unrealized: totalPNLHistory?.['7d']?.unrealized?.toFixed(2) ?? 'N/A'
    },
    '30d': {
      realized: totalPNLHistory?.['30d']?.realized?.toFixed(2) ?? 'N/A',
      unrealized: totalPNLHistory?.['30d']?.unrealized?.toFixed(2) ?? 'N/A'
    },
    '1y': {
      realized: totalPNLHistory?.['1y']?.realized?.toFixed(2) ?? 'N/A',
      unrealized: totalPNLHistory?.['1y']?.unrealized?.toFixed(2) ?? 'N/A'
    }
  };

  const [walletAddresses] = useState(['']); // Example default address

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);



  useEffect(() => {
    const filtered = coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCoins(filtered);
  }, [searchTerm]);

  // Add the getTokenName function
  const getTokenName = (input) => {
    const lowercaseInput = input.toLowerCase();
    const matchedCoin = coins.find(coin => 
      coin.name.toLowerCase() === lowercaseInput || 
      coin.symbol.toLowerCase() === lowercaseInput
    );
    return matchedCoin ? matchedCoin.name.toLowerCase() : input.toLowerCase();
  };

  // Update the data fetching functions to use getTokenName
  const fetchPriceHistory = async (coinname, from = null, to = null) => {
    try {
      const normalizedCoinName = getTokenName(coinname);
      if (!normalizedCoinName) {
        console.error('Attempted to fetch price history with undefined coinname');
        setErrorSnackbar({
          open: true,
          message: 'Cannot fetch price history: Coin name is undefined'
        });
        return null;
      }

      to = to || Date.now();
      from = from || to - 365 * 24 * 60 * 60 * 1000;

      console.log(`Fetching price history for ${normalizedCoinName}...`);
      const response = await axios.get(`https://api.mobula.io/api/1/market/history`, {
        params: {
          asset: normalizedCoinName,
          from: from,
          to: to,
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });

      if (response.data?.data?.price_history) {
        const formattedData = response.data.data.price_history.map(([timestamp, price]) => ({
          timestamp,
          date: new Date(timestamp),
          price
        }));
        return formattedData;
      } else {
        throw new Error('Invalid price history data structure');
      }
    } catch (error) {
      console.error(`Error fetching price history for ${coinname}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({
        open: true,
        message: `Failed to fetch price history for ${coinname}: ${error.message}`
      });
      return null;
    }
  };

  const fetchCryptoPanicData = async (coinname) => {
    try {
      const normalizedCoinName = getTokenName(coinname);
      if (!normalizedCoinName) {
        console.error('Attempted to fetch CryptoPanic data with undefined coinname');
        setErrorSnackbar({
          open: true,
          message: 'Cannot fetch CryptoPanic data: Coin name is undefined'
        });
        return;
      }

      const coin = coins.find(c => c.name.toLowerCase() === normalizedCoinName.toLowerCase());
      if (!coin) {
        throw new Error(`Coin not found: ${normalizedCoinName}`);
      }

      console.log(`Fetching CryptoPanic data for ${normalizedCoinName} (${coin.symbol})...`);
      const response = await axios.get(`https://cryptopanic.com/api/free/v1/posts/`, {
        params: {
          auth_token: '2c962173d9c232ada498efac64234bfb8943ba70',
          public: 'true',
          currencies: coin.symbol
        }
      });

      if (response.data && response.data.results) {
        const newsItems = response.data.results.map(item => ({
          title: item.title,
          url: item.url
        }));
        setData(prevData => ({ 
          ...prevData, 
          cryptoPanicNews: { 
            ...prevData.cryptoPanicNews, 
            [normalizedCoinName]: newsItems 
          } 
        }));
        console.log(`CryptoPanic data for ${normalizedCoinName} updated successfully.`);
      } else {
        console.error('Invalid CryptoPanic data structure:', response.data);
        throw new Error('Invalid CryptoPanic data structure');
      }
    } catch (error) {
      console.error(`Error fetching CryptoPanic data for ${coinname}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({ 
        open: true, 
        message: `Failed to fetch CryptoPanic data for ${coinname}: ${error.message}`
      });
    }
  };

  const fetchMarketData = async (coinname) => {
    try {
      const normalizedCoinName = getTokenName(coinname);
      if (!normalizedCoinName) {
        console.error('Attempted to fetch market data with undefined coinname');
        setErrorSnackbar({
          open: true,
          message: 'Cannot fetch market data: Coin name is undefined'
        });
        return null;
      }

      console.log(`Fetching market data for ${normalizedCoinName}...`);
      const response = await axios.get(`https://api.mobula.io/api/1/market/data?asset=${normalizedCoinName}`, {
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      
      console.log('Response received:', response);

      if (response.data && response.data.data) {
        console.log(`Market data for ${normalizedCoinName} fetched successfully.`);
        return response.data.data;
      } else {
        console.error('Invalid market data structure:', response.data);
        throw new Error('Invalid market data structure');
      }
    } catch (error) {
      console.error(`Error fetching market data for ${coinname}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({ 
        open: true, 
        message: `Failed to fetch market data for ${coinname}: ${error.message}`
      });
      return null;
    }
  };

  // Function to get market data for a specific coin
  const getMarketData = async (token) => {
    if (!marketData[token]) {
      const data = await fetchMarketData(token);
      console.log('*****Market data*****:', data);
      if (data) {
        setMarketData(prevData => ({
          ...prevData,
          [token]: data
        }));
      console.log('*****Market data*****:', data);
      }
      return data;
    }
    console.log('*****Market data*****:', data);
    return marketData[token] || null;
  };


  const fetchMetadata = async (coinname) => {
    try {
      const normalizedCoinName = getTokenName(coinname);
      if (!normalizedCoinName) {
        console.error('Attempted to fetch metadata with undefined coinname');
        setErrorSnackbar({
          open: true,
          message: 'Cannot fetch metadata: Coin name is undefined'
        });
        return null;
      }

      console.log(`Fetching metadata for ${normalizedCoinName}...`);
      const response = await axios.get(`https://api.mobula.io/api/1/metadata?asset=${normalizedCoinName}`, {
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      
      if (response.data && response.data.data) {
        console.log(`Metadata for ${normalizedCoinName} fetched successfully.`);
        return response.data.data;
      } else {
        console.error('Invalid metadata structure:', response.data);
        throw new Error('Invalid metadata structure');
      }
    } catch (error) {
      console.error(`Error fetching metadata for ${coinname}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({ 
        open: true, 
        message: `Failed to fetch metadata for ${coinname}: ${error.message}`
      });
      return null;
    }
  };

  // Add a function to get metadata for a specific coin
  const getMetadata = async (token) => {
    if (!metadata[token]) {
      const data = await fetchMetadata(token);
      console.log('Metadata fetched:', data);
      if (data) {
        setMetadata(prevData => ({
          ...prevData,
          [token]: data
        }));
      }
      return data;
    }
    return metadata[token] || null;
  };

  const fetchHistoricPortfolioData = async (from = null, to = null, addresses = walletAddresses) => {
    if (!addresses || addresses.length === 0) {
      console.error('Attempted to fetch historic portfolio data with no addresses');
      setErrorSnackbar({
        open: true,
        message: 'Cannot fetch historic portfolio data: No wallet addresses provided'
      });
      return null;
    }

    try {
      to = to || Date.now();
      from = from || to - 365 * 24 * 60 * 60 * 1000;

      console.log(`Fetching historic portfolio data for addresses: ${addresses.join(', ')}`);
      const response = await axios.get(`https://api.mobula.io/api/1/wallet/history`, {
        params: {
          wallets: addresses.join(','),
          from: from,
          to: to
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });

      if (response.data) {
        console.log('Historic portfolio data fetched successfully');
        setHistoricPortfolioData(response.data);
        return response.data;
      } else {
        throw new Error('Invalid historic portfolio data structure');
      }
    } catch (error) {
      console.error('Error fetching historic portfolio data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({ 
        open: true, 
        message: `Failed to fetch historic portfolio data: ${error.message}`
      });
      return null;
    }
  };

  const fetchWalletPortfolio = async (address) => {
    try {
      console.log(`Fetching wallet portfolio for address: ${address}`);
      const response = await axios.get(`https://api.mobula.io/api/1/wallet/multi-portfolio`, {
        params: {
          wallets: address
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      
      if (response.data && response.data.data && response.data.data[0]) {
        console.log('Wallet portfolio fetched successfully');
        return response.data.data[0];
      } else {
        throw new Error('Invalid wallet portfolio data structure');
      }
    } catch (error) {
      console.error('Error fetching wallet portfolio:', error);
      return null;
    }
  };

  // Add this new function
  const getWalletPortfolio = async (address) => {
    const data = await fetchWalletPortfolio(address);
    if (!data) return 'Unable to fetch wallet data';
    
    return {
      balance: data.total_wallet_balance?.toFixed(2) || 'N/A',
      realizedPNL: data.total_realized_pnl?.toFixed(2) || 'N/A',
      unrealizedPNL: data.total_unrealized_pnl?.toFixed(2) || 'N/A',
      assets: data.assets?.map(asset => ({
        name: asset.asset?.name || 'Unknown',
        symbol: asset.asset?.symbol || 'N/A',
        balance: asset.token_balance?.toFixed(6) || 'N/A',
        value: asset.estimated_balance?.toFixed(2) || 'N/A'
      })) || [],
      pnlHistory: data.total_pnl_history || {}
    };
  };

  // Function to get data based on the key
  const getData = (key) => {
    return data[key];
  };

  // Function to get CEX listings
  const cexs = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    
    if (!metadata?.cexs || !Array.isArray(metadata.cexs)) {
      return 'No CEX listing information available';
    }
    
    // Format CEX data
    const formattedCexs = metadata.cexs
      .filter(cex => cex.id) // Filter out null entries
      .map(cex => ({
        name: cex.name || cex.id,
        logo: cex.logo || null
      }));

    return {
      totalListings: formattedCexs.length,
      exchanges: formattedCexs
    };
  };

  // Function to get investor information
  const investors = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    
    if (!metadata?.investors || !Array.isArray(metadata.investors)) {
      return 'No investor information available';
    }
    
    // Format investors data
    const formattedInvestors = metadata.investors.map(investor => ({
      name: investor.name,
      type: investor.type,
      isLead: investor.lead,
      country: investor.country_name || 'Unknown',
      image: investor.image
    }));

    return {
      totalInvestors: formattedInvestors.length,
      leadInvestors: formattedInvestors.filter(inv => inv.isLead).map(inv => inv.name),
      vcInvestors: formattedInvestors.filter(inv => inv.type === 'Ventures Capital').length,
      angelInvestors: formattedInvestors.filter(inv => inv.type === 'Angel Investor').length,
      allInvestors: formattedInvestors
    };
  };

  // Function to get token distribution
  const distribution = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    
    if (!metadata?.distribution || !Array.isArray(metadata.distribution)) {
      return 'No distribution information available';
    }
    
    return metadata.distribution.map(item => ({
      category: item.name,
      percentage: item.percentage
    }));
  };

  // Function to get release schedule
  const releaseSchedule = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    
    if (!metadata?.release_schedule || !Array.isArray(metadata.release_schedule)) {
      return 'No release schedule information available';
    }
    
    const schedule = metadata.release_schedule.map(item => ({
      date: new Date(item.unlock_date).toISOString(),
      tokensToUnlock: item.tokens_to_unlock,
      allocation: item.allocation_details
    }));

    // Calculate some useful metrics
    const totalTokens = schedule.reduce((sum, item) => sum + item.tokensToUnlock, 0);
    const upcomingUnlocks = schedule
      .filter(item => new Date(item.date) > new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      totalTokensInSchedule: totalTokens,
      totalUnlockEvents: schedule.length,
      upcomingUnlocks: upcomingUnlocks.slice(0, 5), // Next 5 unlocks
      fullSchedule: schedule
    };
  };

  // Update the system prompt to include new functions
  const callOpenAIAPI = async (userInput) => {
    try {
      const response = await axios.post('http://13.233.51.247:3004/api/analyze', {
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

    console.log('User input:', userInput);

    try {
      const response = await callOpenAIAPI(userInput);
      console.log('Response from analyze API:', response);

      // Check if response exists and has the expected structure
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

  // Function to execute the code generated by GPT
  const executeCode = async (code) => {
    try {
      const portfolioData = {
        balance: portfolioBalance,
        realizedPNL: portfolioRealizedPNL,
        unrealizedPNL: portfolioUnrealizedPNL,
        assetsList: portfolioAssetsList,
        pnlTimelines: portfolioPNLTimelines,
        walletAddresses: portfolioAddresses
      };

      const wrappedFunctions = {
        priceHistoryData: async (token, period = '1y') => {
          const data = await getPriceHistory(token, period);
          return data.map(item => ({
            date: item.date.toISOString(),
            price: item.price
          }));
        },
        getHistoricPortfolioData: async (addresses, period = '1y') => {
          // Ensure addresses is an array
          const addressArray = Array.isArray(addresses) ? addresses : [addresses];
          if (!addressArray.length) {
            throw new Error('No wallet addresses provided');
          }
          
          const to = Date.now();
          const periods = {
            '1d': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            '1y': 365 * 24 * 60 * 60 * 1000
          };
          const from = to - (periods[period] || periods['1y']);
          
          const data = await fetchHistoricPortfolioData(from, to, addressArray);
          return data;
        },
        getWalletPortfolio: async (address) => {
          const data = await getWalletPortfolio(address);
          return data;
        },
        usePerplexity: async (query) => {
          const response = await usePerplexity(query);
          return response;
        },
        cexs: async (token) => {
          return await cexs(token);
        },
        investors: async (token) => {
          return await investors(token);
        },
        distribution: async (token) => {
          return await distribution(token);
        },
        releaseSchedule: async (token) => {
          return await releaseSchedule(token);
        }
      };

      const wrappedCode = `async function executeAICode() {
        const priceHistoryData = async (token, period) => {
          const data = await wrappedFunctions.priceHistoryData(token, period);
          return data;
        };
        const getHistoricPortfolioData = async (addresses, period) => {
          const data = await wrappedFunctions.getHistoricPortfolioData(addresses, period);
          return data;
        };
        const getWalletPortfolio = async (address) => {
          const data = await wrappedFunctions.getWalletPortfolio(address);
          return data;
        };
        const usePerplexity = async (query) => {
          const data = await wrappedFunctions.usePerplexity(query);
          return data;
        };
        const cexs = async (token) => {
          return await wrappedFunctions.cexs(token);
        };
        const investors = async (token) => {
          return await wrappedFunctions.investors(token);
        };
        const distribution = async (token) => {
          return await wrappedFunctions.distribution(token);
        };
        const releaseSchedule = async (token) => {
          return await wrappedFunctions.releaseSchedule(token);
        };
        ${code}
      }
      return executeAICode();`;

      const func = new Function(
        'wrappedFunctions',
        'data', 'selectedCoin', 'setSelectedCoin', 'getMarketData', 'getMetadata',
        'price', 'volume', 'marketCap', 'marketCapDiluted', 'liquidity', 'liquidityChange24h',
        'offChainVolume', 'volume7d', 'volumeChange24h', 'isListed', 'priceChange24h',
        'priceChange1h', 'priceChange7d', 'priceChange1m', 'priceChange1y', 'ath', 'atl',
        'rank', 'totalSupply', 'circulatingSupply', 'website', 'twitter', 'telegram',
        'discord', 'description', 'portfolioData', 'renderCryptoPanicNews',
        'historicPortfolioData', 'getNews', 'portfolioAddresses',
        'getPriceAtDateTime', 'getPriceGrowth', 'getTechnicalAnalysis',
        'getPortfolioAtDateTime', 'getPortfolioTrends', 'getPortfolioGrowth',
        wrappedCode
      );

      const result = await func(
        wrappedFunctions,
        data, selectedCoin, setSelectedCoin, getMarketData, getMetadata,
        price, volume, marketCap, marketCapDiluted, liquidity, liquidityChange24h,
        offChainVolume, volume7d, volumeChange24h, isListed, priceChange24h,
        priceChange1h, priceChange7d, priceChange1m, priceChange1y, ath, atl,
        rank, totalSupply, circulatingSupply, website, twitter, telegram,
        discord, description, portfolioData, renderCryptoPanicNews,
        historicPortfolioData, getNews, portfolioAddresses,
        getPriceAtDateTime, getPriceGrowth, getTechnicalAnalysis,
        getPortfolioAtDateTime, getPortfolioTrends, getPortfolioGrowth
      );

      if (result === undefined) {
        throw new Error('Execution result is undefined. Make sure the code returns a value.');
      }

      return typeof result === 'string' ? result.replace(/^"|"$/g, '') : JSON.stringify(result, null, 2);
    } catch (error) {
      console.error('Error executing code:', error);
      return `Error: ${error.message}`;
    }
  };

  // Modify the renderMessage function to include response time
  const renderMessage = (message, index) => {
    const formatContent = (content) => {
      // Ensure content is a string
      if (typeof content !== 'string') {
        content = String(content);
      }
      
      // Replace URLs with clickable links
      content = content.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #00a0ff; text-decoration: none;">$1</a>'
      );
      
      // Replace bold text (**text**) with styled spans
      content = content.replace(
        /\*\*(.*?)\*\*/g,
        '<span style="font-weight: 600;">$1</span>'
      );
      
      // Replace headers (###) with styled divs
      content = content.replace(
        /###\s*(.*?)(\n|$)/g,
        '<div style="font-size: 19px; font-weight: 600; margin: 1em 0;">$1</div>'
      );
      
      // Replace code blocks with styled pre elements
      content = content.replace(
        /```(.*?)\n([\s\S]*?)```/g,
        '<pre style="background-color: rgba(0, 0, 0, 0.1); padding: 1em; border-radius: 4px; overflow-x: auto; font-size: 18px;"><code>$2</code></pre>'
      );
      
      // Replace single line code with styled inline code
      content = content.replace(
        /`([^`]+)`/g,
        '<code style="background-color: rgba(0, 0, 0, 0.1); padding: 0.2em 0.4em; border-radius: 3px; font-size: 18px;">$1</code>'
      );
      
      // Replace bullet points with styled lists
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

  // Render the disclaimer dialog
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

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false);
  };

  const fetchCryptoPanicNews = async (coinname) => {
    try {
      const normalizedCoinName = getTokenName(coinname);
      if (!normalizedCoinName) {
        throw new Error('Invalid coin name');
      }

      const coin = coins.find(c => c.name.toLowerCase() === normalizedCoinName.toLowerCase());
      if (!coin) {
        throw new Error(`Coin not found: ${normalizedCoinName}`);
      }

      const response = await axios.get(`https://cryptopanic.com/api/free/v1/posts/`, {
        params: {
          auth_token: '2c962173d9c232ada498efac64234bfb8943ba70',
          public: 'true',
          currencies: coin.symbol
        }
      });

      if (!response.data?.results) {
        throw new Error('Invalid response from CryptoPanic API');
      }

      const newsItems = response.data.results.map(item => ({
        title: item.title,
        url: item.url
      }));

      return newsItems;
    } catch (error) {
      console.error(`Error fetching CryptoPanic news:`, error);
      throw error;
    }
  };

  const getNews = async (token) => {
    try {
      const normalizedToken = getTokenName(token);
      const newsItems = await fetchCryptoPanicNews(normalizedToken);
      
      if (!newsItems || newsItems.length === 0) {
        return 'No news available for this token';
      }

      // Format news items as a numbered list
      return newsItems
        .slice(0, 5) // Limit to 5 news items
        .map((item, index) => `${index + 1}. ${item.title}`)
        .join('\n');
    } catch (error) {
      console.error('Error in getNews:', error);
      return `Unable to fetch news: ${error.message}`;
    }
  };

  // Add a new function to get price history data
  const getPriceHistory = async (token, period = '1y') => {
    const normalizedToken = getTokenName(token);
    if (!priceHistoryData[normalizedToken]) {
      const to = Date.now();
      const periods = {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '1y': 365 * 24 * 60 * 60 * 1000
      };
      const from = to - (periods[period] || periods['1y']);
      
      const data = await fetchPriceHistory(normalizedToken, from, to);
      if (data) {
        setPriceHistoryData(prevData => ({
          ...prevData,
          [normalizedToken]: data
        }));
      }
      return data;
    }
    return priceHistoryData[normalizedToken];
  };

  const getHistoricPortfolioData = async (addresses, period = '1y') => {
    try {
      if (!addresses || addresses.length === 0) {
        throw new Error('No wallet addresses provided');
      }

      // Calculate time range based on period
      const to = Date.now();
      const periods = {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '1y': 365 * 24 * 60 * 60 * 1000
      };
      const from = to - (periods[period] || periods['1y']);

      // Fetch data using existing fetchHistoricPortfolioData
      const response = await fetchHistoricPortfolioData(from, to, addresses);

      if (!response || !response.data || !response.data.balance_history) {
        throw new Error('Invalid response format');
      }

      // Format the data similar to price history
      return {
        wallet: response.data.wallet,
        wallets: response.data.wallets,
        currentBalance: response.data.balance_usd,
        balanceHistory: response.data.balance_history.map(([timestamp, balance]) => ({
          timestamp,
          date: new Date(timestamp),
          balance: parseFloat(balance)
        }))
      };

    } catch (error) {
      console.error('Error in getHistoricPortfolioData:', error);
      throw error;
    }
  };

  // Add these helper functions for token data
  const website = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    return metadata?.website || 'N/A';
  };
  const twitter = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    return metadata?.twitter || 'N/A';
  };
  const telegram = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    return metadata?.telegram || 'N/A';
  };
  const discord = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    return metadata?.discord || 'N/A';
  };
  const description = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    return metadata?.description || 'N/A';
  };
  const price = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    console.log('*****Price*****:', data);
    if (!data) return 'please resend the prompt';
    return data.price !== undefined ? `$${data.price.toFixed(2)}` : 'N/A';
  };
  const volume = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return data?.volume !== undefined ? `$${data.volume.toFixed(2)}` : 'N/A';
  };
  const marketCap = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return data?.market_cap !== undefined ? `$${data.market_cap.toFixed(2)}` : 'N/A';
  };
  const marketCapDiluted = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `$${data?.market_cap_diluted?.toFixed(2) || 'N/A'}`;
  };
  const liquidity = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `$${data?.liquidity?.toFixed(2) || 'N/A'}`;
  };
  const liquidityChange24h = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.liquidity_change_24h?.toFixed(2) || 'N/A'}%`;
  };
  const offChainVolume = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `$${data?.off_chain_volume?.toFixed(2) || 'N/A'}`;
  };
  const volume7d = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `$${data?.volume_7d?.toFixed(2) || 'N/A'}`;
  };
  const volumeChange24h = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.volume_change_24h?.toFixed(2) || 'N/A'}%`;
  };
  const isListed = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return data?.is_listed ? 'Yes' : 'No';
  };
  const priceChange24h = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.price_change_24h?.toFixed(2) || 'N/A'}%`;
  };
  const priceChange1h = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.price_change_1h?.toFixed(2) || 'N/A'}%`;
  };
  const priceChange7d = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.price_change_7d?.toFixed(2) || 'N/A'}%`;
  };
  const priceChange1m = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.price_change_1m?.toFixed(2) || 'N/A'}%`;
  };
  const priceChange1y = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.price_change_1y?.toFixed(2) || 'N/A'}%`;
  };
  const ath = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `$${data?.ath?.toFixed(2) || 'N/A'}`;
  };
  const atl = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `$${data?.atl?.toFixed(2) || 'N/A'}`;
  };
  const rank = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return data?.rank || 'N/A';
  };
  const totalSupply = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return data?.total_supply || 'N/A';
  };
  const circulatingSupply = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return data?.circulating_supply || 'N/A';
  };
  const renderCryptoPanicNews = (coinname) => {
    const newsItems = data.cryptoPanicNews?.[coinname];
    
    if (!newsItems || newsItems.length === 0) {
      return <Typography>No news available for {coinname}</Typography>;
    }

    return (
      <div>
        <Typography variant="h6">Latest News for {coinname}</Typography>
        {newsItems.map((item, index) => (
          <Typography key={index}>
            <Link href={item.url} target="_blank" rel="noopener noreferrer">
              {item.title}
            </Link>
          </Typography>
        ))}
      </div>
    );
  };

  const handleCloseErrorSnackbar = () => {
    setErrorSnackbar({ open: false, message: '' });
  };

  // Add new state for wallet management
  const [portfolioAddresses, setPortfolioAddresses] = useState([]);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');

  // Add wallet management handlers
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

  // Add these new functions after the existing helper functions and before the return statement
  const getPriceAtDateTime = async (token, timestamp) => {
    const normalizedToken = getTokenName(token);
    const data = await getPriceHistory(normalizedToken);
    
    if (!data) return 'N/A';
    
    // Find the closest price point to the requested timestamp
    const closest = data.reduce((prev, curr) => {
      return Math.abs(curr.timestamp - timestamp) < Math.abs(prev.timestamp - timestamp) ? curr : prev;
    });
    
    return closest ? `$${closest.price.toFixed(2)}` : 'N/A';
  };

  const getPriceGrowth = async (token, fromTimestamp, toTimestamp = Date.now()) => {
    const normalizedToken = getTokenName(token);
    const data = await getPriceHistory(normalizedToken);
    
    if (!data) return 'N/A';
    
    const startPrice = data.find(point => Math.abs(point.timestamp - fromTimestamp) < 24 * 60 * 60 * 1000);
    const endPrice = data.find(point => Math.abs(point.timestamp - toTimestamp) < 24 * 60 * 60 * 1000);
    
    if (!startPrice || !endPrice) return 'N/A';
    
    const growthPercent = ((endPrice.price - startPrice.price) / startPrice.price) * 100;
    return {
      startPrice: `$${startPrice.price.toFixed(2)}`,
      endPrice: `$${endPrice.price.toFixed(2)}`,
      growthPercent: `${growthPercent.toFixed(2)}%`,
      absoluteGrowth: `$${(endPrice.price - startPrice.price).toFixed(2)}`
    };
  };

  const getTechnicalAnalysis = async (token, period = '30d') => {
    const normalizedToken = getTokenName(token);
    const data = await getPriceHistory(normalizedToken, period);
    
    if (!data || data.length < 14) return 'Insufficient data for analysis';

    // Calculate basic technical indicators
    const prices = data.map(point => point.price);
    const sma14 = calculateSMA(prices, 14);
    const rsi14 = calculateRSI(prices, 14);
    const macd = calculateMACD(prices);
    
    return {
      sma14: sma14.toFixed(2),
      rsi14: rsi14.toFixed(2),
      macd: {
        macdLine: macd.macdLine.toFixed(2),
        signalLine: macd.signalLine.toFixed(2),
        histogram: macd.histogram.toFixed(2)
      },
      trend: determineTrend(sma14, rsi14, macd)
    };
  };

  const getPortfolioAtDateTime = async (addresses, timestamp) => {
    try {
      // Fetch portfolio history for a wider range to ensure we have the data point
      const data = await getHistoricPortfolioData(addresses, '1y');
      if (!data || !data.balanceHistory) return 'N/A';
      
      // Find the closest data point to the requested timestamp
      const closest = data.balanceHistory.reduce((prev, curr) => {
        return Math.abs(curr.timestamp - timestamp) < Math.abs(prev.timestamp - timestamp) ? curr : prev;
      });
      
      return closest ? {
        timestamp: new Date(closest.timestamp).toISOString(),
        balance: `$${closest.balance.toFixed(2)}`
      } : 'N/A';
    } catch (error) {
      console.error('Error in getPortfolioAtDateTime:', error);
      return 'Error fetching portfolio data';
    }
  };

  const getPortfolioTrends = async (addresses, period = '30d') => {
    try {
      const data = await getHistoricPortfolioData(addresses, period);
      if (!data || !data.balanceHistory) return 'N/A';
      
      const balances = data.balanceHistory.map(point => point.balance);
      const timestamps = data.balanceHistory.map(point => point.timestamp);
      
      return {
        startBalance: `$${balances[0].toFixed(2)}`,
        currentBalance: `$${balances[balances.length - 1].toFixed(2)}`,
        highestBalance: `$${Math.max(...balances).toFixed(2)}`,
        lowestBalance: `$${Math.min(...balances).toFixed(2)}`,
        volatility: calculateVolatility(balances),
        trend: calculateTrend(balances)
      };
    } catch (error) {
      console.error('Error in getPortfolioTrends:', error);
      return 'Error analyzing portfolio trends';
    }
  };

  const getPortfolioGrowth = async (addresses, fromTimestamp, toTimestamp = Date.now()) => {
    try {
      const data = await getHistoricPortfolioData(addresses, '1y');
      if (!data || !data.balanceHistory) return 'N/A';
      
      const startBalance = data.balanceHistory.find(point => 
        Math.abs(point.timestamp - fromTimestamp) < 24 * 60 * 60 * 1000
      );
      const endBalance = data.balanceHistory.find(point => 
        Math.abs(point.timestamp - toTimestamp) < 24 * 60 * 60 * 1000
      );
      
      if (!startBalance || !endBalance) return 'N/A';
      
      const growthPercent = ((endBalance.balance - startBalance.balance) / startBalance.balance) * 100;
      
      return {
        startBalance: `$${startBalance.balance.toFixed(2)}`,
        endBalance: `$${endBalance.balance.toFixed(2)}`,
        growthPercent: `${growthPercent.toFixed(2)}%`,
        absoluteGrowth: `$${(endBalance.balance - startBalance.balance).toFixed(2)}`
      };
    } catch (error) {
      console.error('Error in getPortfolioGrowth:', error);
      return 'Error calculating portfolio growth';
    }
  };

  // Helper functions for technical analysis
  const calculateSMA = (prices, period) => {
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  };

  const calculateRSI = (prices, period) => {
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const difference = prices[i] - prices[i - 1];
      if (difference >= 0) {
        gains += difference;
      } else {
        losses -= difference;
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateMACD = (prices) => {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12 - ema26;
    const signalLine = calculateEMA([macdLine], 9);
    const histogram = macdLine - signalLine;
    
    return { macdLine, signalLine, histogram };
  };

  const calculateEMA = (prices, period) => {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  };

  const determineTrend = (sma, rsi, macd) => {
    let signals = [];
    
    if (rsi > 70) signals.push('Overbought');
    else if (rsi < 30) signals.push('Oversold');
    
    if (macd.macdLine > macd.signalLine) signals.push('Bullish MACD Crossover');
    else if (macd.macdLine < macd.signalLine) signals.push('Bearish MACD Crossover');
    
    return signals.join(', ') || 'Neutral';
  };

  const calculateVolatility = (values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
  };

  const calculateTrend = (values) => {
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    if (change > 5) return 'Upward';
    if (change < -5) return 'Downward';
    return 'Sideways';
  };

  async function usePerplexity(content) {
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "user",
            content: content
          }
        ]
      })
    };

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', options);
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Perplexity API:', error);
      throw error;
    }
  }

  // Example usage:
  // usePerplexity("solana news")
  //   .then(content => console.log(content))
  //   .catch(error => console.error(error));

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

  // Add new dialog state
  const [isThesisDialogOpen, setIsThesisDialogOpen] = useState(false);

  // Add thesis management handlers
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

  // Add settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };
  
  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const [agentPrompt, setAgentPrompt] = useState('');

  // Add new state for agent name
  const [selectedAgentName, setSelectedAgentName] = useState('');

  // Add new state for agent description
  const [agentDescription, setAgentDescription] = useState('');

  // Modify the existing useEffect that fetches agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('agents2')
          .select('prompt, name, description')  // Add description to the selection
          .eq('id', selectedAgent)
          .single();
        
        if (error) throw error;
        if (data) {
          setAgentPrompt(data.prompt);
          setSelectedAgentName(data.name);
          setAgentDescription(data.description);  // Set the agent description
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
      handleCloseAnnouncement={handleCloseAnnouncement}
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
      selectedAgentName={selectedAgentName} // Add this prop
      agentDescription={agentDescription} // Add this prop
    />
  );
}

export default ChatInterface;