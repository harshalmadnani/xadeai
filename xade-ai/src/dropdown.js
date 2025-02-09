import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbsnlpviggcnwqfyfobh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indic25scHZpZ2djbndxZnlmb2JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc2NTcwNiwiZXhwIjoyMDU0MzQxNzA2fQ.tr6PqbiAXQYSQSpG2wS6I4DZfV1Gc3dLXYhKwBrJLS0';
const supabase = createClient(supabaseUrl, supabaseKey);

const AgentDropdown = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id,agent_name,image');
      
      if (error) throw error;
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleSelect = (agentId) => {
    setSelectedAgent(agentId);
    setIsOpen(false);
  };

  const selectedAgentData = agents.find(agent => agent.id === parseInt(selectedAgent));

  return (
    <div style={{ position: 'relative', width: '200px' }}>
      {/* Selected Agent Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'black',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {selectedAgentData && (
          <>
            <img
              src={selectedAgentData.image}
              alt={selectedAgentData.agent_name}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <span>{selectedAgentData.agent_name}</span>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            background: '#1a1a1a',

            borderRadius: '4px',
            marginTop: '4px',

            zIndex: 1000
          }}
        >
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => handleSelect(agent.id)}
              style={{
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#333'
                }
              }}
            >
              <img
                src={agent.image}
                alt={agent.agent_name}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <span>{agent.agent_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentDropdown;