import React from 'react';
import './App.css';
import ChatInterface from './ChatInterface';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Refresh after every message</h1>
        <ChatInterface />
      </header>
    </div>
  );
}

export default App;
