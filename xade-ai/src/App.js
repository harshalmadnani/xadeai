import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate, useLocation } from 'react-router-dom';
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
import AgentDropdown from './dropdown';
import Agentboard from './agentboard';
import profile from './profile';
import DashboardIcon from '@mui/icons-material/Leaderboard';
import PersonIcon from '@mui/icons-material/Person';
import { supabase } from './lib/supabase';

function App() {
  const { ready, authenticated, login, user } = usePrivy();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState(1);
  const [selectedAgentName, setSelectedAgentName] = useState('ALPHACHAD');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from('agents2')
          .select('id,name,image')
          .order('id', { ascending: true });
        
        if (error) throw error;
        setAgents(data);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };
    
    fetchAgents();
  }, []);

  useEffect(() => {
    if (authenticated && user) {
      const walletAddress = user.wallet?.address;
      console.log('User wallet address:', walletAddress);
    }
  }, [authenticated, user]);

  const getTabName = (index) => {
    const tabs = ['Chat', 'Terminal', 'Agent Builder', 'Agent Board'];
    return tabs[index] || '';
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSidebarVisible(false);
  };
  useEffect(() => {
    const tabName = getTabName(selectedTab).toLowerCase().replace(/\s+/g, '-');
    let agentParam = '';
    
    // Only add agent parameter for Chat and Terminal tabs
    if (selectedTab === 0 || selectedTab === 1) {
      if (selectedAgent && selectedAgentName) {
        const formattedAgentName = selectedAgentName.toLowerCase().replace(/\s+/g, '-');
        agentParam = `/${formattedAgentName}`;
      }
    }
    
    navigate(`/${tabName}${agentParam}`, { replace: true });
  }, [selectedTab, selectedAgent, selectedAgentName, navigate]);

  // Update URL parsing logic
  useEffect(() => {
    const pathParts = location.pathname.slice(1).split('/');
    const tabs = ['chat', 'terminal', 'agent-builder', 'agent-board'];
    const tabIndex = tabs.indexOf(pathParts[0]);
    
    if (tabIndex !== -1) {
      setSelectedTab(tabIndex);
    }

    // Only set agent name for Chat and Terminal tabs
    if (pathParts[1] && (tabIndex === 0 || tabIndex === 1)) {
      const agentName = pathParts[1];
      setSelectedAgentName(agentName.toUpperCase());
    }
  }, [location]);

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
      <Tab 
        icon={<DashboardIcon sx={{ fontSize: 24 }} />}
        label="Agent Board"
        iconPosition="start"
        aria-label="agent-board"
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

  // Modify AgentDropdown to update selectedAgent
  const handleAgentChange = (agent) => {
    setSelectedAgent(agent);
  };

  // If Privy is not ready or user is not authenticated, show login page
  if (!ready || !authenticated) {
    return (
      <div className="App" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '90vh',
        background: '#000000',
        color: 'white',
        padding: '5% 20px',
        fontFamily: 'GeneralSans-Medium, "General Sans", sans-serif', 
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1200px',
          gap: isMobile ? '24px' : '40px',
        }}>
          {/* Left side - Image */}
          <div style={{
            flex: '1',
            position: 'relative',
            textAlign: 'left',
            width: '100%',
          }}>
            <img 
              src="https://res.cloudinary.com/dcrfpsiiq/image/upload/v1739882221/svgucknbn67gqb1m7xfm.png" 
              alt="AI Agent Launcher"
              style={{
                width: '100%',
                height: isMobile ? '50%' : '80%',
                borderRadius: '20px',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Right side - Updated button loading state */}
          <div style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '24px',
            textAlign: 'left',
            width: '100%',
          }}>
            <h1 style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: 'bold',
              marginBottom: isMobile ? '8px' : '16px',
              lineHeight: '1.2',
              fontFamily: 'GeneralSans-Variable, "General Sans", sans-serif',
              textAlign: 'left',
            }}>
              The easiest way to discover, launch and trade AI agents
            </h1>
            <p style={{
              fontSize: isMobile ? '16px' : '18px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: isMobile ? '16px' : '32px',
              fontFamily: 'GeneralSans-Variable, "General Sans", sans-serif',
              textAlign: 'left',
            }}>
              Launch and scale your AI-Agents with unprecedented ease and speed
            </p>
            <button 
              onClick={login}
              disabled={!ready}
              style={{
                padding: isMobile ? '12px 24px' : '16px 32px',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                backgroundColor: !ready ? 'rgba(255, 255, 255, 0.5)' : 'white',
                color: !ready ? 'rgba(0, 0, 0, 0.5)' : 'black',
                border: 'none',
                borderRadius: '50px',
                cursor: !ready ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                width: 'fit-content',
                fontFamily: 'GeneralSans-Variable, "General Sans", sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseOver={(e) => {
                if (ready) e.target.style.transform = 'scale(1.05)'
              }}
              onMouseOut={(e) => {
                if (ready) e.target.style.transform = 'scale(1)'
              }}
            >
              {!ready ? (
                <>
                  <div className="loading-dots">
                    <style>
                      {`
                        .loading-dots {
                          display: flex;
                          gap: 4px;
                          align-items: center;
                        }
                        .loading-dots::after {
                          content: '...';
                          animation: dots 1.5s steps(4, end) infinite;
                          letter-spacing: 2px;
                        }
                        @keyframes dots {
                          0%, 20% { content: '.'; }
                          40% { content: '..'; }
                          60% { content: '...'; }
                          80%, 100% { content: ''; }
                        }
                      `}
                    </style>
                    Loading
                  </div>
                </>
              ) : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          {selectedTab !== 2 && selectedTab !== 3 && (
            <AgentDropdown 
              onAgentSelect={(id, name) => {
                setSelectedAgent(id);
                setSelectedAgentName(name);
              }} 
              defaultAgent={1}
            />
          )}
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
              <ChatInterface selectedAgent={selectedAgent} />
            ) : selectedTab === 1 ? (
              <Terminal selectedAgent={selectedAgent} />
            ) : selectedTab === 2 ? (
              <AgentLauncher />
            ) : (
              <Agentboard />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
