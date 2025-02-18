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

  // Add useEffect for Perplexity API calls
  useEffect(() => {
    fetchMessages();
    // Set up interval for Perplexity API calls
    const interval = setInterval(fetchCryptoNews, 30000);
    return () => clearInterval(interval);
  }, []);

  // Function to fetch crypto news from Perplexity
  const fetchCryptoNews = async () => {
    try {
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content: "You are Alphachad, a degenerate and fun assistant focused on crypto. Give one brief piece of recent crypto news or market update in a degen manner."
            },
            { 
              role: "user", 
              content: "Give me one piece of recent crypto news or market update." 
            }
          ]
        })
      };

      const response = await fetch('https://api.perplexity.ai/chat/completions', options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get AI response');
      }

      // Add new message to history
      setHistory(prev => [...prev, {
        type: 'output',
        content: data.choices[0].message.content
      }]);

      // Scroll to bottom
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error fetching crypto news:', error);
    }
  };

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
      {/* Terminal Output with modified styling */}
      <div 
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '14px',
          backgroundColor: '#000',
          lineHeight: '1.8',
        }}
      >
        {history.map((entry, index) => (
          <div 
            key={index}
            style={{
              color: entry.type === 'input' ? '#64ff64' : '#fff',
              marginBottom: '16px',
            }}
          >
            <span style={{ color: '#64ff64' }}>{entry.type === 'input' ? '> ' : 'Alphachad: '}</span>
            {entry.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Terminal;
