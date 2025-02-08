import React, { useState } from 'react';
import './AgentLauncher.css';
import { FiUpload, FiSearch, FiX } from 'react-icons/fi';

const AgentLauncher = () => {
  const [agentData, setAgentData] = useState({
    name: 'New Agent',
    description: '',
    profileImage: null,
    prompt: '',
    xUsername: '',
    customPrompt: '',
  });
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);

  const [selectedDataSources, setSelectedDataSources] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [characterizationMethod, setCharacterizationMethod] = useState('presets');

  // Sample data - replace with actual data from your backend
  const dataSources = [
    { id: 1, name: 'Market Data', category: 'Trading' },
    { id: 2, name: 'Social Sentiment', category: 'Social' },
    // Add more data sources
  ];

  const actions = [
    { id: 1, name: 'Post Tweets', category: 'Social', tags: ['Twitter', 'Social'] },
    { id: 2, name: 'Make Trades', category: 'Trading', tags: ['DeFi', 'Trading'] },
    // Add more actions
  ];

  const categories = ['all', 'Trading', 'Social', 'DeFi'];

  // Add preset characterizations
  const characterizationPresets = [
    { id: 1, name: 'Professional Analyst' },
    { id: 2, name: 'Casual Trader' },
    { id: 3, name: 'Market Expert' },
  ];

  const handleProfileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAgentData({ ...agentData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImprovePrompt = () => {
    if (!isImprovingPrompt) {
      // Implement prompt improvement logic here
      setIsImprovingPrompt(true);
    } else {
      // Handle finishing the improvement
      setIsImprovingPrompt(false);
    }
  };

  const handleGenerateFromX = () => {
    // Implement X profile generation logic
  };

  const handleGenerateFromPrompt = () => {
    // Implement custom prompt generation logic
  };

  const handleCharacterizationPreset = (preset) => {
    // Implement preset selection logic
    console.log(`Selected preset: ${preset.name}`);
  };

  const handleLaunch = () => {
    // Implement launch logic
  };

  return (
    <div className="agent-launcher">
      <div className="main-content">
        {/* Profile and Basic Info Section */}
        <div className="info-column">
          <div className="profile-upload-container">
            <label className="profile-upload-label">
              <input
                type="file"
                className="profile-input"
                onChange={handleProfileUpload}
                accept="image/*"
              />
              {agentData.profileImage ? (
                <img src={agentData.profileImage} alt="Profile" className="profile-preview" />
              ) : (
                <div className="profile-icon">
                  <FiUpload />
                </div>
              )}
            </label>
          </div>
          <input
            type="text"
            className="name-input-plain"
            placeholder="Agent Name"
            value={agentData.name}
            onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
          />
          <textarea
            className="description-input"
            placeholder="Describe your agent's purpose..."
            value={agentData.description}
            onChange={(e) => setAgentData({ ...agentData, description: e.target.value })}
            style={{ height: '60px' }}
          />
          <button className="configure-x">Configure X Account</button>
        </div>

        {/* Description and Prompt Section */}
        <div className="section-label">Prompt</div>
        <textarea
          className="name-input"
          placeholder="Enter agent prompt..."
          value={agentData.prompt}
          onChange={(e) => setAgentData({ ...agentData, prompt: e.target.value })}
          style={{ height: '120px', width: '100%', marginBottom: '10px' }}
        />
        <button 
          className="configure-x" 
          onClick={handleImprovePrompt}
          style={{ 
            width: '100%', 
            marginBottom: '20px',
            backgroundColor: 'white',
            color: 'black'
          }}
        >
          {isImprovingPrompt ? 'Finish' : 'Improve Prompt'}
        </button>

        {/* Characterization Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px',marginBottom: '20px' }}>
          <div className="section-label">Characterization</div>
          <select 
            className="name-input"
            value={characterizationMethod}
            onChange={(e) => setCharacterizationMethod(e.target.value)}
            style={{ width: 'auto', padding: '5px 10px' }}
          >
            <option value="presets">Presets</option>
            <option value="x">X Profile</option>
            <option value="prompt">Custom Prompt</option>
          </select>
        </div>
        
        {/* Conditional rendering based on selected method */}
        {characterizationMethod === 'presets' && (
          <div className="characterization-presets" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {characterizationPresets.map((preset) => (
              <button
                key={preset.id}
                className="configure-x"
                onClick={() => handleCharacterizationPreset(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        )}

        {characterizationMethod === 'x' && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              className="name-input"
              placeholder="Enter X username"
              value={agentData.xUsername}
              onChange={(e) => setAgentData({ ...agentData, xUsername: e.target.value })}
            />
            <button className="configure-x" onClick={handleGenerateFromX}>
              Generate from X
            </button>
          </div>
        )}

        {characterizationMethod === 'prompt' && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              className="name-input"
              placeholder="Enter custom prompt"
              value={agentData.customPrompt}
              onChange={(e) => setAgentData({ ...agentData, customPrompt: e.target.value })}
            />
            <button className="configure-x" onClick={handleGenerateFromPrompt}>
              Generate from Prompt
            </button>
          </div>
        )}

        <div className="section-label">Data Sources</div>
        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search actions and data sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-filter ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Data Sources Section */}
        <div className="data-sources">
          {dataSources.map((source) => (
            <div
              key={source.id}
              className={`source-item ${selectedDataSources.includes(source.id) ? 'selected' : ''}`}
              onClick={() => {
                setSelectedDataSources(
                  selectedDataSources.includes(source.id)
                    ? selectedDataSources.filter((id) => id !== source.id)
                    : [...selectedDataSources, source.id]
                )
              }}
            >
              {source.name}
            </div>
          ))}
        </div>

        {/* Actions Section */}
        <div className="section-label">Actions</div>
        <div className="actions-list">
          {actions.map((action) => (
            <div
              key={action.id}
              className={`action-item ${selectedActions.includes(action.id) ? 'selected' : ''}`}
              onClick={() => {
                setSelectedActions(
                  selectedActions.includes(action.id)
                    ? selectedActions.filter((id) => id !== action.id)
                    : [...selectedActions, action.id]
                )
              }}
            >
              <div className="action-header">
                <span>{action.name}</span>
                <button className="action-toggle">
                  {selectedActions.includes(action.id) ? <FiX /> : '+'}
                </button>
              </div>
              <div className="action-tags">
                {action.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Launch Button */}
        <button className="launch-button" onClick={handleLaunch}>
          Launch Agent
        </button>
      </div>
    </div>
  );
};

export default AgentLauncher;
