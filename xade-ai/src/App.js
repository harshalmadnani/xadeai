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
import Drawer from '@mui/material/Drawer';
import CloseIcon from '@mui/icons-material/Close';

function App() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    if (isMobile) setDrawerOpen(false);
  };

  const NavigationTabs = () => (
    <Tabs
      value={selectedTab}
      onChange={handleTabChange}
      orientation={isMobile ? "horizontal" : "vertical"}
      sx={{
        '& .MuiTabs-indicator': {
          display: 'none',
        },
        '& .MuiTab-root': {
          minWidth: '50px',
          width: '50px',
          minHeight: '50px',
          padding: '12px',
          marginBottom: isMobile ? '0' : '12px',
          marginRight: isMobile ? '12px' : '0',
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
  );

  return (
    <div className="App">
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100%',
        background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
      
        width: '100%',
      }}>
        {isMobile ? (
          // Mobile Topbar
          <div style={{
            height: '60px',
            minHeight: '60px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
            <img 
              src="/1.png" 
              alt="Logo" 
              style={{
                width: '30px',
                height: '30px',
                marginLeft: '16px',
                borderRadius: '50%',
              }}
            />
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{
                sx: {
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  padding: '20px',
                }
              }}
            >
              <NavigationTabs />
            </Drawer>
          </div>
        ) : (
          // Desktop Sidebar
          <div style={{
            width: '80px',
            minWidth: '80px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 0',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
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
              <NavigationTabs />
              <IconButton
                onClick={() => window.close()}
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
        )}

        {/* Main Content */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          height: isMobile ? 'calc(100vh - 60px)' : '100vh',
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
  );
}

export default App;
