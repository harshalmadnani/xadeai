import React, { useState, useRef, useEffect } from 'react';
import { TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbsnlpviggcnwqfyfobh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indic25scHZpZ2djbndxZnlmb2JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc2NTcwNiwiZXhwIjoyMDU0MzQxNzA2fQ.tr6PqbiAXQYSQSpG2wS6I4DZfV1Gc3dLXYhKwBrJLS0';
const supabase = createClient(supabaseUrl, supabaseKey);

function Terminal() {
  const [history, setHistory] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const terminalRef = useRef(null);

  // Add useEffect to fetch messages when component mounts
  useEffect(() => {
    fetchMessages();
  }, []);

  // Function to fetch messages from Supabase
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('terminal')
      .select('agent_2');

    if (error) {
      console.error('Error fetching messages:', error);
      // Set default crypto-related messages
      setHistory([
        { type: 'output', content: 'ETH moving nicely in range post-RL drop. Above MH might see a macro mid push. More breakouts could mean YO and new highs. Keep watching.' },
        { type: 'output', content: '$LTC at $131.40, up 9.32% - testing resistance. Breakout or rejection? Momentum\'s there, but needs confirmation. Big moment for Litecoin\'s direction.' },
        { type: 'output', content: 'Mirai Labs raises $4M in seed to scale AI and Rust teams. Focus on tech could lead to breakthroughs but watch for product-market fit.' },
        { type: 'output', content: 'Fere AI secures funding from Morningstar Ventures - AI in Web3 gaining traction. This could mean smarter trading tools but depends on execution.' },
        { type: 'output', content: 'NodeGo nabs $8M from Hash Capital - bolstering node infrastructure. Investment signals confidence but the real test is in scaling and user adoption.' },
        { type: 'output', content: 'Coinbase acquires Spindl - aiming to shape onchain ad future. Could this blend of crypto and advertising redefine marketing?' },
        { type: 'output', content: 'Tether backs Zengo - pushing for faster stablecoin adoption via self-custody. Could this ease fears around centralized control?' },
        { type: 'output', content: 'Legend secures $15M funding - big vote of confidence. This cash influx could fuel growth or signal project readiness.' },
        { type: 'output', content: 'Bitcoin at a crossroads - smash resistance or retreat? A breakout could signal a bull run, but failure might mean consolidation.' },
        { type: 'output', content: 'Grayscale\'s Cardano ETF filing after Solana, XRP, DOGE - diversifying crypto exposure. Institutional interest in ADA could surge if approved.' }
      ]);
      return;
    }

    if (data) {
      // Convert the fetched data to terminal history format
      const messages = data.map(item => ({
        type: 'output',
        content: item.agent_2
      }));
      setHistory(messages);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#000',
      color: '#fff',
    }}>
      {/* Terminal Top Bar */}
      <div style={{
          backgroundColor: '#1a1a1a',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'  // Increased gap for better spacing
      }}>
        {/* Terminal Controls */}
      
        <div style={{ 
          color: '#fff',
          fontFamily: 'GeneralSans, sans-serif',
          fontSize: '14px',
          fontWeight: 'bold',
        }}>
          {selectedAgent ? `${selectedAgent.name} Terminal` : 'Alphachad Terminal'}
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '14px',
          backgroundColor: '#000',
        }}
      >
        {history.map((entry, index) => (
          <div 
            key={index}
            style={{
              color: entry.type === 'input' ? '#64ff64' : '#fff',
              marginBottom: '8px',
            }}
          >
            {entry.type === 'input' ? '> ' : ''}
            {entry.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Terminal;
