import React, { useState } from 'react';
import './App.css';
import ChatInterface from './ChatInterface';
import Terminal from './terminal';
import { Tabs, Tab } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CodeIcon from '@mui/icons-material/Code';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AgentLauncher from './AgentLauncher'; // Assuming you'll move this component to its own file

function App() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div className="App">
      <div style={{
        display: 'flex',
        height: '100vh',
        background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
      }}>
        {/* Sidebar */}
        <div style={{
          width: '80px',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0',
        }}>
          <img 
            src="/1.png" 
            alt="Logo" 
            style={{
              width: '40px',
              height: '40px',
              marginBottom: '40px',
              borderRadius: '50%',
            }}
          />
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            orientation="vertical"
            sx={{
              '& .MuiTabs-indicator': {
                display: 'none',
              },
              '& .MuiTab-root': {
                minWidth: '50px',
                width: '50px',
                minHeight: '50px',
                padding: '12px',
                marginBottom: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                },
              },
            }}
          >
            <Tab 
              icon={<ChatIcon sx={{ fontSize: 24 }} />} 
              aria-label="chat"
              sx={{ 
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  color: 'white',
                }
              }}
            />
            <Tab 
              icon={<CodeIcon sx={{ fontSize: 24 }} />} 
              aria-label="terminal"
              sx={{ 
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  color: 'white',
                }
              }}
            />
            <Tab 
              icon={<RocketLaunchIcon sx={{ fontSize: 24 }} />} 
              aria-label="agent-builder"
              sx={{ 
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  color: 'white',
                }
              }}
            />
          </Tabs>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedTab === 0 ? (
            <ChatInterface />
          ) : selectedTab === 1 ? (
            <Terminal />
          ) : (
            <AgentLauncher />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
