import React, { useState, useRef, useEffect } from 'react';
import { TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbsnlpviggcnwqfyfobh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indic25scHZpZ2djbndxZnlmb2JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc2NTcwNiwiZXhwIjoyMDU0MzQxNzA2fQ.tr6PqbiAXQYSQSpG2wS6I4DZfV1Gc3dLXYhKwBrJLS0';
const supabase = createClient(supabaseUrl, supabaseKey);

function Terminal({ selectedAgent }) {
  const [history, setHistory] = useState([]);
  const [agentTweets, setAgentTweets] = useState([]);
  const [agentNames, setAgentNames] = useState({});
  const terminalRef = useRef(null);

  useEffect(() => {
    fetchAgentNames();
    fetchMessages();
    const interval = setInterval(fetchCryptoNews, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [selectedAgent]);

  const fetchAgentNames = async () => {
    try {
      const { data, error } = await supabase
        .from('agents2')
        .select('id, name');
      
      if (error) throw error;
      
      const namesMap = {};
      data.forEach(agent => {
        namesMap[agent.id] = agent.name;
      });
      setAgentNames(namesMap);
    } catch (error) {
      console.error('Error fetching agent names:', error);
    }
  };

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

  // Modify fetchMessages to get data from terminal2 table
  const fetchMessages = async () => {
    // Only fetch messages if an agent is selected
    if (!selectedAgent) return;

    const { data: agentsData, error: agentsError } = await supabase
      .from('terminal2')
      .select('agent_id, tweet_content, created_at')
      .eq('agent_id', selectedAgent)
      .order('created_at', { ascending: false });

    if (agentsError) {
      console.error('Error fetching messages:', agentsError);
      return;
    }

    if (agentsData) {
      const messages = agentsData.map(item => ({
        type: 'output',
        agentId: item.agent_id,
        content: item.tweet_content,
        timestamp: new Date(item.created_at)
      }));
      setAgentTweets(messages);
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
            <span style={{ color: '#64ff64' }}>
              {entry.type === 'input' ? '> ' : `${agentNames[entry.agentId] || `Agent ${entry.agentId}`}: `}
            </span>
            {entry.content}
            {entry.timestamp && (
              <span style={{ color: '#666', marginLeft: '10px', fontSize: '12px' }}>
                {entry.timestamp.toLocaleString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Terminal;
