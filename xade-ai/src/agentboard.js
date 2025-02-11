import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FaTwitter, FaComments, FaTerminal } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

const supabaseUrl = 'https://wbsnlpviggcnwqfyfobh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indic25scHZpZ2djbndxZnlmb2JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc2NTcwNiwiZXhwIjoyMDU0MzQxNzA2fQ.tr6PqbiAXQYSQSpG2wS6I4DZfV1Gc3dLXYhKwBrJLS0';
const supabase = createClient(supabaseUrl, supabaseKey);

function Agentboard() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*');
      if (error) throw error;
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
        padding: '1rem'
      }}>
        {agents.map((agent) => (
          <div key={agent.id} style={{
            backgroundColor: '#1f2937',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={agent.image}
                alt={agent.agent_name}
                style={{
                  width: '4rem',
                  height: '4rem',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>{agent.agent_name}</h3>
                <div style={{ 
                  display: 'flex',
                  gap: '0.75rem',
                  marginTop: '0.5rem'
                }}>
                  <FaTwitter style={{ color: '#60a5fa', cursor: 'pointer' }} />
                  <FaComments style={{ color: '#4ade80', cursor: 'pointer' }} />
                  <FaTerminal style={{ color: '#c084fc', cursor: 'pointer' }} />
                </div>
              </div>
            </div>
            <p style={{
              marginTop: '1rem',
              color: '#d1d5db',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
              onClick={() => {
                setSelectedAgent(agent);
                setShowModal(true);
              }}>
              {agent.description}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedAgent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            maxWidth: '42rem',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                color: '#9ca3af',
                cursor: 'pointer'
              }}
            >
              <IoClose size={24} />
            </button>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <img
                src={selectedAgent.image}
                alt={selectedAgent.agent_name}
                style={{
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white'
              }}>{selectedAgent.agent_name}</h2>
            </div>
            <p style={{
              color: '#d1d5db',
              whiteSpace: 'pre-wrap'
            }}>{selectedAgent.description}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default Agentboard;
