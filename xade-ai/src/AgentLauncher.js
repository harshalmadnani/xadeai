import React, { useState } from 'react';
import './AgentLauncher.css';
import { FiUpload, FiSearch, FiX } from 'react-icons/fi';

const AgentLauncher = () => {
  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    profileImage: null,
    prompt: '',
    xUsername: '',
  });

  const [selectedDataSources, setSelectedDataSources] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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
    // Implement prompt improvement logic
  };

  const handleGenerateFromX = () => {
    // Implement X profile generation logic
  };

  const handleLaunch = () => {
    // Implement launch logic
  };

  return (
    <div className="agent-launcher">
      <div className="main-content">
        {/* Profile and Basic Info Section */}
        <div className="info-row">
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
            className="name-input"
            placeholder="Agent Name"
            value={agentData.name}
            onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
          />
          <button className="configure-x">Configure X Account</button>
        </div>

        {/* Description and Prompt Section */}
        <div className="section-label">Description</div>
        <textarea
          className="name-input"
          placeholder="Describe your agent's purpose..."
          value={agentData.description}
          onChange={(e) => setAgentData({ ...agentData, description: e.target.value })}
        />

        <div className="section-label">Prompt</div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <textarea
            className="name-input"
            placeholder="Enter agent prompt..."
            value={agentData.prompt}
            onChange={(e) => setAgentData({ ...agentData, prompt: e.target.value })}
          />
          <button className="configure-x" onClick={handleImprovePrompt}>
            Improve Prompt
          </button>
        </div>

        {/* X Username Generator */}
        <div className="section-label">Generate from X Profile</div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            className="name-input"
            placeholder="Enter X username"
            value={agentData.xUsername}
            onChange={(e) => setAgentData({ ...agentData, xUsername: e.target.value })}
          />
          <button className="configure-x" onClick={handleGenerateFromX}>
            Generate
          </button>
        </div>

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
        <div className="section-label">Data Sources</div>
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
