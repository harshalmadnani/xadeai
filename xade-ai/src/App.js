import React, { useState, useEffect } from 'react';
import './App.css';
import ChatInterface from './ChatInterface';
import Terminal from './terminal';
import { Tabs, Tab } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CodeIcon from '@mui/icons-material/Code';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AgentLauncher from './AgentLauncher'; 
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

function App() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSidebarVisible(false);
  };

  const NavigationTabs = () => (
    <Tabs
      value={selectedTab}
      onChange={handleTabChange}
      orientation="vertical"
      sx={{
        '& .MuiTabs-indicator': {
          display: 'none',
        },
        '& .MuiTab-root': {
          minWidth: '200px',
          width: '200px',
          minHeight: '50px',
          padding: '12px',
          marginBottom: '12px',
          color: 'rgba(255, 255, 255, 0.5)',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          gap: '12px',
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
        label="Chat"
        iconPosition="start"
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
        label="Terminal"
        iconPosition="start"
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
        label="Agent Builder"
        iconPosition="start"
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
  );

  return (
    <div className="App">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
        width: '100%',
      }}>
        <div style={{
          height: '60px',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          zIndex: 1000,
        }}>
          <IconButton
            onClick={() => setSidebarVisible(!sidebarVisible)}
            sx={{ color: 'white' }}
          >
            <MenuIcon />
          </IconButton>
        </div>

        <div style={{
          display: 'flex',
          flex: 1,
          height: 'calc(100vh - 60px)',
          position: 'relative',
        }}>
          {sidebarVisible && (
            <>
              <div
                onClick={() => setSidebarVisible(false)}
                style={{
                  position: 'fixed',
                  top: '60px',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 100,
                }}
              />
              <div style={{
                position: 'fixed',
                top: '60px',
                left: 0,
                bottom: 0,
                width: isMobile ? '100%' : '250px',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 0',
                zIndex: 1000,
                boxShadow: '4px 0 15px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                }}>
                  <NavigationTabs />
                  <IconButton
                    onClick={() => setSidebarVisible(false)}
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: 'auto',
                      '&:hover': {
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>
            </>
          )}

          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
            minWidth: 0,
            width: '100%'
          }}>
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
    </div>
  );
}

export default App;
