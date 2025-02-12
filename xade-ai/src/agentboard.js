import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FaTwitter, FaComments, FaTerminal } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = 'https://wbsnlpviggcnwqfyfobh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indic25scHZpZ2djbndxZnlmb2JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc2NTcwNiwiZXhwIjoyMDU0MzQxNzA2fQ.tr6PqbiAXQYSQSpG2wS6I4DZfV1Gc3dLXYhKwBrJLS0';
const supabase = createClient(supabaseUrl, supabaseKey);

function Agentboard() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

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
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      width: '100%'
    }}>
      <h1 style={{
        fontSize: '3rem',
        color: 'white',
        textAlign: 'center',
        margin: '2rem 0'
      }}>Agent Board</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {agents.map((agent) => (
          <div key={agent.id} style={{
            backgroundColor: '#121212',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            ':hover': {
              transform: 'scale(1.02)'
            }
          }}
          onClick={() => {
            setSelectedAgent(agent);
            setShowModal(true);
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <img
                src={agent.image}
                alt={agent.agent_name}
                style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <img 
                src="1111.png"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/chat');
                }}
                style={{ 
                  width: '2.5rem',
                  height: '2.5rem',
                  cursor: 'pointer'
                }} 
                alt="chat"
              />
            </div>
            
            <div>
              <h3 style={{ 
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.5rem',
                textAlign: 'left',
                fontFamily: 'GeneralSans-Medium'
              }}>{agent.agent_name}</h3>
              <p style={{
                color: '#888',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                marginBottom: '1rem',
                textAlign: 'left',
                fontFamily: 'GeneralSans-Medium'
              }}>{agent.description}</p>
            </div>

            <div style={{ 
              display: 'flex',
              gap: '0.75rem'
            }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(agent.twitter, '_blank');
                }}
                style={{
                  backgroundColor: '#222',
                  color: '#888',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer'
                }}>Follow on X</button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/terminal');
                }}
                style={{
                  backgroundColor: '#222',
                  color: '#888',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer'
                }}>Terminal</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedAgent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#121212',
            borderRadius: '1rem',
            padding: '2rem',
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
    </div>
  );
}

export default Agentboard;
