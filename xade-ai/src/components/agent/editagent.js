import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useWallet } from '../../App';

function EditAgent() {
  const { walletAddress } = useWallet();
  const [agents, setAgents] = useState([]);
  const [expandedAgentId, setExpandedAgentId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (walletAddress) {
      fetchAgents();
    }
  }, [walletAddress]);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('agents2')
        .select('*')
        .eq('user_id', walletAddress);
      if (error) throw error;
      setAgents(data);
    } catch (err) {
      setError('Failed to fetch agents.');
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = (agent) => {
    setExpandedAgentId(expandedAgentId === agent.id ? null : agent.id);
    setEditData(agent);
    setSuccess(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase
        .from('agents2')
        .update(editData)
        .eq('id', editData.id)
        .eq('user_id', walletAddress);
      if (error) throw error;
      setSuccess('Agent updated!');
      fetchAgents();
    } catch (err) {
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>Manage Your Agents</h1>
      {loading && <p>Loading agents...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'lightgreen' }}>{success}</p>}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {agents.length === 0 && !loading && <p>No agents found for your wallet.</p>}
        {agents.map((agent) => (
          <div key={agent.id} style={{
            background: '#181818',
            borderRadius: '1rem',
            marginBottom: '1.5rem',
            boxShadow: expandedAgentId === agent.id ? '0 0 0 2px #fff' : 'none',
            transition: 'box-shadow 0.2s',
          }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '1.5rem',
                borderBottom: expandedAgentId === agent.id ? '1px solid #333' : 'none',
              }}
              onClick={() => handleExpand(agent)}
            >
              <img src={agent.image} alt={agent.name} style={{ width: 56, height: 56, borderRadius: '50%', marginRight: 24, objectFit: 'cover' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>{agent.name}</h2>
                <p style={{ margin: 0, color: '#aaa' }}>{agent.description}</p>
                {/* Show agent_wallet and balance if trading_agent is true */}
                {agent.trading_agent && (
                  <div style={{
                    marginTop: 16,
                    marginBottom: 16,
                    background: '#181818',
                    borderRadius: 12,
                    padding: '16px 20px',
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.12)',
                    border: '1px solid #333',
                    maxWidth: 480
                  }}>
                    <div style={{ marginBottom: 8, color: '#aaa', fontSize: 14, fontWeight: 500 }}>Agent Address</div>
                    <div style={{ color: '#fff', fontWeight: 600, wordBreak: 'break-all', fontSize: 16, marginBottom: 8 }}>{agent.agent_wallet || 'N/A'}</div>
                    <div style={{ color: '#8aff8a', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
                      Balance: <span style={{ color: '#fff' }}>$0.00</span> {/* TODO: Replace with real balance */}
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <button style={{ background: '#fff', color: '#000', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 15, boxShadow: '0 1px 4px 0 #0002' }}>Deposit</button>
                      <button style={{ background: '#fff', color: '#000', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 15, boxShadow: '0 1px 4px 0 #0002' }}>Withdraw</button>
                      <button style={{ background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 8, padding: '10px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>Export</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {expandedAgentId === agent.id && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid #222', background: '#222' }}>
                {/* Name */}
                <label style={{ display: 'block', marginBottom: 8 }}>Name</label>
                <input
                  name="name"
                  value={editData.name || ''}
                  onChange={handleChange}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginBottom: 16, background: '#181818', color: '#fff' }}
                />
                {/* Description */}
                <label style={{ display: 'block', marginBottom: 8 }}>Description</label>
                <textarea
                  name="description"
                  value={editData.description || ''}
                  onChange={handleChange}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginBottom: 16, background: '#181818', color: '#fff', minHeight: 60 }}
                />
                {/* Image URL */}
                <label style={{ display: 'block', marginBottom: 8 }}>Image URL</label>
                <input
                  name="image"
                  value={editData.image || ''}
                  onChange={handleChange}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginBottom: 16, background: '#181818', color: '#fff' }}
                />
                {/* Prompt */}
                <label style={{ display: 'block', marginBottom: 8 }}>Prompt</label>
                <textarea
                  name="prompt"
                  value={editData.prompt || ''}
                  onChange={handleChange}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginBottom: 16, background: '#181818', color: '#fff', minHeight: 60 }}
                />
                {/* Model */}
                <label style={{ display: 'block', marginBottom: 8 }}>Model</label>
                <input
                  name="model"
                  value={editData.model || ''}
                  onChange={handleChange}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginBottom: 16, background: '#181818', color: '#fff' }}
                />
                {/* Data Sources (List) */}
                <label style={{ display: 'block', marginBottom: 8 }}>Data Sources</label>
                {(Array.isArray(editData.data_sources) ? editData.data_sources : (editData.data_sources ? JSON.parse(editData.data_sources) : [])).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', marginBottom: 8 }}>
                    <input
                      type="text"
                      value={item}
                      onChange={e => {
                        const newArr = [...(Array.isArray(editData.data_sources) ? editData.data_sources : JSON.parse(editData.data_sources) || [])];
                        newArr[idx] = e.target.value;
                        setEditData(prev => ({ ...prev, data_sources: newArr }));
                      }}
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#181818', color: '#fff' }}
                    />
                    <button onClick={() => {
                      const newArr = [...(Array.isArray(editData.data_sources) ? editData.data_sources : JSON.parse(editData.data_sources) || [])];
                      newArr.splice(idx, 1);
                      setEditData(prev => ({ ...prev, data_sources: newArr }));
                    }} style={{ marginLeft: 8, background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
                <button onClick={() => setEditData(prev => ({ ...prev, data_sources: [...(Array.isArray(prev.data_sources) ? prev.data_sources : (prev.data_sources ? JSON.parse(prev.data_sources) : [])), ''] }))} style={{ marginBottom: 16, background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Add Data Source</button>
                {/* Activities (List) */}
                <label style={{ display: 'block', marginBottom: 8 }}>Activities</label>
                {(Array.isArray(editData.activities) ? editData.activities : (editData.activities ? JSON.parse(editData.activities) : [])).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', marginBottom: 8 }}>
                    <input
                      type="text"
                      value={item}
                      onChange={e => {
                        const newArr = [...(Array.isArray(editData.activities) ? editData.activities : JSON.parse(editData.activities) || [])];
                        newArr[idx] = e.target.value;
                        setEditData(prev => ({ ...prev, activities: newArr }));
                      }}
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#181818', color: '#fff' }}
                    />
                    <button onClick={() => {
                      const newArr = [...(Array.isArray(editData.activities) ? editData.activities : JSON.parse(editData.activities) || [])];
                      newArr.splice(idx, 1);
                      setEditData(prev => ({ ...prev, activities: newArr }));
                    }} style={{ marginLeft: 8, background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
                <button onClick={() => setEditData(prev => ({ ...prev, activities: [...(Array.isArray(prev.activities) ? prev.activities : (prev.activities ? JSON.parse(prev.activities) : [])), ''] }))} style={{ marginBottom: 16, background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Add Activity</button>
                {/* Sample Questions (List of pairs) */}
                <label style={{ display: 'block', marginBottom: 8 }}>Sample Questions</label>
                {(Array.isArray(editData.sample_questions) ? editData.sample_questions : (editData.sample_questions ? JSON.parse(editData.sample_questions) : [])).map((qa, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      placeholder="Question"
                      value={qa.question}
                      onChange={e => {
                        const newArr = [...(Array.isArray(editData.sample_questions) ? editData.sample_questions : JSON.parse(editData.sample_questions) || [])];
                        newArr[idx] = { ...newArr[idx], question: e.target.value };
                        setEditData(prev => ({ ...prev, sample_questions: newArr }));
                      }}
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#181818', color: '#fff' }}
                    />
                    <input
                      type="text"
                      placeholder="Answer"
                      value={qa.answer}
                      onChange={e => {
                        const newArr = [...(Array.isArray(editData.sample_questions) ? editData.sample_questions : JSON.parse(editData.sample_questions) || [])];
                        newArr[idx] = { ...newArr[idx], answer: e.target.value };
                        setEditData(prev => ({ ...prev, sample_questions: newArr }));
                      }}
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#181818', color: '#fff' }}
                    />
                    <button onClick={() => {
                      const newArr = [...(Array.isArray(editData.sample_questions) ? editData.sample_questions : JSON.parse(editData.sample_questions) || [])];
                      newArr.splice(idx, 1);
                      setEditData(prev => ({ ...prev, sample_questions: newArr }));
                    }} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
                <button onClick={() => setEditData(prev => ({ ...prev, sample_questions: [...(Array.isArray(prev.sample_questions) ? prev.sample_questions : (prev.sample_questions ? JSON.parse(prev.sample_questions) : [])), { question: '', answer: '' }] }))} style={{ marginBottom: 16, background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Add Q&A</button>
                {/* Sample Posts (List) */}
                <label style={{ display: 'block', marginBottom: 8 }}>Sample Posts</label>
                {(Array.isArray(editData.sample_posts) ? editData.sample_posts : (editData.sample_posts ? JSON.parse(editData.sample_posts) : [])).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', marginBottom: 8 }}>
                    <input
                      type="text"
                      value={item}
                      onChange={e => {
                        const newArr = [...(Array.isArray(editData.sample_posts) ? editData.sample_posts : JSON.parse(editData.sample_posts) || [])];
                        newArr[idx] = e.target.value;
                        setEditData(prev => ({ ...prev, sample_posts: newArr }));
                      }}
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#181818', color: '#fff' }}
                    />
                    <button onClick={() => {
                      const newArr = [...(Array.isArray(editData.sample_posts) ? editData.sample_posts : JSON.parse(editData.sample_posts) || [])];
                      newArr.splice(idx, 1);
                      setEditData(prev => ({ ...prev, sample_posts: newArr }));
                    }} style={{ marginLeft: 8, background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
                <button onClick={() => setEditData(prev => ({ ...prev, sample_posts: [...(Array.isArray(prev.sample_posts) ? prev.sample_posts : (prev.sample_posts ? JSON.parse(prev.sample_posts) : [])), ''] }))} style={{ marginBottom: 16, background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Add Sample Post</button>
                {/* Training Files (List) */}
                <label style={{ display: 'block', marginBottom: 8 }}>Training Files</label>
                {(Array.isArray(editData.trainingfiles) ? editData.trainingfiles : (editData.trainingfiles ? JSON.parse(editData.trainingfiles) : [])).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', marginBottom: 8 }}>
                    <input
                      type="text"
                      value={item}
                      onChange={e => {
                        const newArr = [...(Array.isArray(editData.trainingfiles) ? editData.trainingfiles : JSON.parse(editData.trainingfiles) || [])];
                        newArr[idx] = e.target.value;
                        setEditData(prev => ({ ...prev, trainingfiles: newArr }));
                      }}
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#181818', color: '#fff' }}
                    />
                    <button onClick={() => {
                      const newArr = [...(Array.isArray(editData.trainingfiles) ? editData.trainingfiles : JSON.parse(editData.trainingfiles) || [])];
                      newArr.splice(idx, 1);
                      setEditData(prev => ({ ...prev, trainingfiles: newArr }));
                    }} style={{ marginLeft: 8, background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
                <button onClick={() => setEditData(prev => ({ ...prev, trainingfiles: [...(Array.isArray(prev.trainingfiles) ? prev.trainingfiles : (prev.trainingfiles ? JSON.parse(prev.trainingfiles) : [])), ''] }))} style={{ marginBottom: 16, background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Add Training File</button>
                {/* Post Configuration (JSON) */}
                <label style={{ display: 'block', marginBottom: 8 }}>Post Configuration (JSON object)</label>
                <textarea
                  name="post_configuration"
                  value={typeof editData.post_configuration === 'string' ? editData.post_configuration : JSON.stringify(editData.post_configuration || {}, null, 2)}
                  onChange={handleChange}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginBottom: 16, background: '#181818', color: '#fff', minHeight: 40 }}
                />
                {/* Chat Configuration (JSON) */}
                <label style={{ display: 'block', marginBottom: 8 }}>Chat Configuration (JSON object)</label>
                <textarea
                  name="chat_configuration"
                  value={typeof editData.chat_configuration === 'string' ? editData.chat_configuration : JSON.stringify(editData.chat_configuration || {}, null, 2)}
                  onChange={handleChange}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginBottom: 16, background: '#181818', color: '#fff', minHeight: 40 }}
                />
                {/* Twitter Credentials (JSON) */}
                <label style={{ display: 'block', marginBottom: 8 }}>Twitter Credentials (JSON object)</label>
                <textarea
                  name="twitter_credentials"
                  value={typeof editData.twitter_credentials === 'string' ? editData.twitter_credentials : JSON.stringify(editData.twitter_credentials || {}, null, 2)}
                  onChange={handleChange}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginBottom: 16, background: '#181818', color: '#fff', minHeight: 40 }}
                />
                {/* Cookies (multi-line) */}
                <label style={{ display: 'block', marginBottom: 8 }}>Cookies (one per line)</label>
                <textarea
                  name="cookies"
                  value={Array.isArray(editData.cookies) ? editData.cookies.join('\n') : (editData.cookies || '')}
                  onChange={e => setEditData(prev => ({ ...prev, cookies: e.target.value.split('\n') }))}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginBottom: 16, background: '#181818', color: '#fff', minHeight: 40 }}
                />
                {/* Custom Context */}
                <label style={{ display: 'block', marginBottom: 8 }}>Custom Context</label>
                <textarea
                  name="custom_context"
                  value={editData.custom_context || ''}
                  onChange={handleChange}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginBottom: 16, background: '#181818', color: '#fff', minHeight: 40 }}
                />
                {/* Trading Agent (boolean) */}
                <label style={{ display: 'block', marginBottom: 8 }}>Trading Agent</label>
                <select
                  name="trading_agent"
                  value={editData.trading_agent ? 'true' : 'false'}
                  onChange={e => setEditData(prev => ({ ...prev, trading_agent: e.target.value === 'true' }))}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginBottom: 16, background: '#181818', color: '#fff' }}
                >
                  <option value="false">False</option>
                  <option value="true">True</option>
                </select>
                {/* Agent Wallet */}
                <label style={{ display: 'block', marginBottom: 8 }}>Agent Wallet</label>
                <input
                  name="agent_wallet"
                  value={editData.agent_wallet || ''}
                  onChange={handleChange}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #444', marginBottom: 16, background: '#181818', color: '#fff' }}
                />
                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: '#fff',
                    color: '#000',
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: 'none',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    marginTop: 8,
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EditAgent;
