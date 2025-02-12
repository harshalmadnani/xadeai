import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import OpenAI from "openai";
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
  selectedAgent
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
            <Typography variant="h5" style={{ color: 'white', marginBottom: '20px', fontSize: '18px' }}>
              Welcome to Xade AI! 👋
            </Typography>
            <Typography style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '30px', fontSize: '14px' }}>
              I can help you with:
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
                {
                  question: "Price of Ethereum with the marketcap of Bitcoin?",
                  icon: "💰"
                },
                {
                  question: "Aptos Investors?",
                  icon: "🔍"
                },
                {
                  question: "Solana 7d technical Analysis?",
                  icon: "📊"
                },
                {
                  question: "What is EigenLayer?",
                  icon: "ℹ️"
                },
                {
                  question: "Latest news about Ethereum?",
                  icon: "📰"
                },
                {
                  question: "SUI token distribution?",
                  icon: "📈"
                }
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
        placeholder={selectedAgent?.name ? `Ask ${selectedAgent.name} anything...` : "Ask me anything about crypto..."}
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

  </div>
);

// Add AgentLauncher component before ChatInterfaceUI

function ChatInterface({ selectedAgent }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorSnackbar, setErrorSnackbar] = useState({ open: false, message: '' });
  const messageListRef = useRef(null);

  const callOpenAIAPI = async (userInput) => {
    try {
      const response = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768",  // Groq's Mixtral model
        messages: [
          { 
            role: "system",
            content: "You are Xade AI, a helpful assistant focused on cryptocurrency and blockchain technology."
          },
          { role: "user", content: userInput }
        ],
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Groq API:', error);
      throw new Error('Failed to get AI response');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const aiResponse = await callOpenAIAPI(input);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setError(error.message);
      setErrorSnackbar({ open: true, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseErrorSnackbar = () => {
    setErrorSnackbar({ open: false, message: '' });
  };

  const renderMessage = (message, index) => (
    <div key={index} style={{
      ...styles.message,
      maxWidth: '95%',
      marginLeft: message.role === 'user' ? 'auto' : '0',
      marginRight: '0'
    }}>
      {message.role === 'assistant' && (
        <img 
          src={selectedAgent?.image || '/1.png'}
          alt={selectedAgent?.agent_name || "Xade AI"}
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
          dangerouslySetInnerHTML={{ __html: message.content }}
          style={{
            lineHeight: '1.6',
            fontSize: '18px',
            textAlign: 'left'
          }}
        />
      </div>
    </div>
  );

  return (
    <div style={{
      ...styles.chatInterface,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        ...styles.messageListContainer,
        padding: '20px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
        flex: 1,
        overflowY: 'auto',
      }}>
        <div style={styles.messageList} ref={messageListRef}>
          {messages.map((message, index) => renderMessage(message, index))}
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
          placeholder={selectedAgent?.name ? `Ask ${selectedAgent.name} anything...` : "Ask me anything about crypto..."}
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

      <Snackbar
        open={errorSnackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseErrorSnackbar}
      >
        <Alert onClose={handleCloseErrorSnackbar} severity="error">
          {errorSnackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ChatInterface;