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
        backgroundColor: '#333',
        padding: '8px 16px',
        borderBottom: '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'  // Increased gap for better spacing
      }}>
        {/* Terminal Controls */}
      
        <div style={{ 
          color: '#fff',
          fontFamily: 'GeneralSans, sans-serif',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {selectedAgent ? `${selectedAgent.name} Terminal` : 'Terminal'}
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          fontFamily: 'GeneralSans, sans-serif',
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
