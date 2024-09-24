import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import OpenAI from "openai";

const styles = {
  chatInterface: {
    width: '100vw',
    height: '110vh',
    margin: 0,
    padding: 0,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1f1f1f',
    color: '#e5e5e5',
  },
  heading: {
    textAlign: 'center',
    padding: '15px',
    fontSize: '28px',
    fontWeight: '600',
    backgroundColor: '#2c2c2c',
    borderBottom: '1px solid #444444',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  messageListContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    marginTop: '60px', // Adjust based on your heading height
    marginBottom: '70px', // Adjust based on your input form height
    padding: '10px 20px',
  },
  messageList: {
    display: 'flex',
    flexDirection: 'column',
  },
  message: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '10px',
  },
  userAvatar: {
    backgroundColor: '#4a90e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  assistantAvatar: {
    backgroundColor: '#50e3c2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  bubble: {
    padding: '12px 16px',
    borderRadius: '20px',
    maxWidth: '70%',
    position: 'relative',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  userBubble: {
    backgroundColor: '#4a4a4a',
    color: '#ffffff',
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: '#333333',
    color: '#ffffff',
    alignSelf: 'flex-start',
  },
  inputForm: {
    display: 'flex',
    padding: '15px 20px',
    borderTop: '1px solid #444444',
    backgroundColor: '#2c2c2c',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  input: {
    flexGrow: 1,
    padding: '12px 16px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '20px',
    marginRight: '10px',
    backgroundColor: '#3a3a3a',
    color: '#e5e5e5',
    outline: 'none',
  },
  sendButton: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#4a90e2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  sendButtonDisabled: {
    backgroundColor: '#7fb3e0',
    cursor: 'not-allowed',
  },
  loading: {
    textAlign: 'center',
    padding: '10px',
    backgroundColor: '#333333',
    color: '#e5e5e5',
    borderTop: '1px solid #444444',
  },
  error: {
    textAlign: 'center',
    padding: '10px',
    backgroundColor: '#7f1f1f',
    color: '#ff6b6b',
    borderTop: '1px solid #a94442',
  },
  rawResponse: {
    margin: '20px',
    padding: '10px',
    backgroundColor: '#2c2c2c',
    borderRadius: '8px',
    overflowX: 'auto',
  },
  codeExecutionResult: {
    margin: '20px',
    padding: '15px',
    backgroundColor: '#2c2c2c',
    borderRadius: '8px',
    overflowX: 'auto',
  },
  pre: {
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    fontSize: '14px',
    color: '#e5e5e5',
  },
  dataSection: {
    margin: '20px',
    padding: '10px',
    backgroundColor: '#2c2c2c',
    borderRadius: '8px',
    overflowX: 'auto',
  },
  popup: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  popupContent: {
    backgroundColor: '#2c2c2c',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    maxWidth: '80%',
  },
  popupText: {
    marginBottom: '20px',
    fontSize: '18px',
    color: '#e5e5e5',
  },
  agreeButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4a90e2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  prefillContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '10px 20px',
    backgroundColor: '#2c2c2c',
    position: 'fixed',
    bottom: '70px', // Adjust based on your input form height
    left: 0,
    right: 0,
    zIndex: 9,
  },
  prefillButton: {
    margin: '5px',
    padding: '8px 12px',
    fontSize: '14px',
    backgroundColor: '#3a3a3a',
    color: '#e5e5e5',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY, // Make sure to prefix with REACT_APP_ for Create React App
  dangerouslyAllowBrowser: true // Add this line
});

function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDisclaimerPopup, setShowDisclaimerPopup] = useState(() => {
    return !localStorage.getItem('disclaimerAgreed');
  });
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [name, setName] = useState('bitcoin');
  const [symbol, setSymbol] = useState('btc');
  const [priceHistory, setPriceHistory] = useState(null);
  const [priceHistoryData, setPriceHistoryData] = useState(null);
  const [cryptoPanicData, setCryptoPanicData] = useState(null);
  const [cryptoPanicNews, setCryptoPanicNews] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const messageListRef = useRef(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    fetchPriceHistory();
    fetchCryptoPanicData();
    fetchMarketData();
    fetchMetadata();
  }, [name, symbol]);

  const fetchPriceHistory = async () => {
    try {
      const response = await axios.get(`https://api.mobula.io/api/1/market/history?asset=${name}`, {
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      setPriceHistory(response.data);
      setPriceHistoryData(response.data.data.price_history);
    } catch (error) {
      console.error('Error fetching price history:', error);
      setError('Failed to fetch price history');
    }
  };

  const fetchCryptoPanicData = async () => {
    try {
      const response = await axios.get(`https://cryptopanic.com/api/free/v1/posts/?auth_token=2c962173d9c232ada498efac64234bfb8943ba70&public=true&currencies=${symbol}`);
      setCryptoPanicData(response.data.results);
      const newsItems = response.data.results.map(item => ({
        title: item.title,
        url: item.url
      }));
      setCryptoPanicNews(newsItems);
    } catch (error) {
      console.error('Error fetching CryptoPanic data:', error);
      setError('Failed to fetch CryptoPanic data');
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await axios.get(`https://api.mobula.io/api/1/market/data?asset=${name}`, {
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      setMarketData(response.data);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Failed to fetch market data');
    }
  };

  const fetchMetadata = async () => {
    try {
      const response = await axios.get(`https://api.mobula.io/api/1/metadata?asset=${name}`, {
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      const { data } = response.data;
      setMetadata({
        id: data.id,
        name: data.name,
        symbol: data.symbol,
        contracts: data.contracts,
        blockchains: data.blockchains,
        twitter: data.twitter,
        website: data.website,
        logo: data.logo,
        price: data.price,
        market_cap: data.market_cap,
        liquidity: data.liquidity,
        volume: data.volume,
        description: data.description,
        kyc: data.kyc,
        audit: data.audit,
        total_supply: data.total_supply,
        circulating_supply: data.circulating_supply,
        discord: data.discord,
        max_supply: data.max_supply,
        chat: data.chat,
        tags: data.tags,
        distribution: data.distribution,
        investors: data.investors,
        release_schedule: data.release_schedule
      });
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setError('Failed to fetch metadata');
    }
  };

  const callOpenAIAPI = async (userInput) => {
    try {
      const contextMessage = {
        priceHistory: priceHistoryData,
        cryptoPanicNews: cryptoPanicNews,
        marketData: marketData,
        metadata: metadata
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using GPT-4 model
        messages: [
          { 
            role: "system", 
            content: "You are Xade AI, a trading assistant with access to real-time financial data. Use the provided context to answer user queries accurately. Always format your responses using markdown for better readability."
          },
          { 
            role: "user", 
            content: `Here's the current context: ${JSON.stringify(contextMessage)}`
          },
          { 
            role: "user", 
            content: userInput 
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to get AI response');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Fetch the latest data before calling the OpenAI API
      await Promise.all([
        fetchPriceHistory(),
        fetchCryptoPanicData(),
        fetchMarketData(),
        fetchMetadata()
      ]);

      // Call the OpenAI API
      const aiResponse = await callOpenAIAPI(input);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message) => {
    return message.content;
  };

  const handleAgree = () => {
    setShowDisclaimerPopup(false);
    localStorage.setItem('disclaimerAgreed', 'true');
    setShowWalletPopup(true);
  };

  const handleWalletSubmit = (e) => {
    e.preventDefault();
    if (walletAddress.trim()) {
      // Here you can add logic to validate and store the wallet address
      localStorage.setItem('walletAddress', walletAddress.trim());
      setShowWalletPopup(false);
    }
  };

  const handlePrefillClick = (question) => {
    setInput(question);
  };

  return (
    <div style={styles.chatInterface}>
      <h1 style={styles.heading}>Xade AI</h1>
      {showDisclaimerPopup && (
        <div style={styles.popup}>
          <div style={styles.popupContent}>
            <div style={styles.popupText}>
              Please agree to the disclaimer to continue.
            </div>
            <button style={styles.agreeButton} onClick={handleAgree}>
              Agree
            </button>
          </div>
        </div>
      )}
      {showWalletPopup && (
        <div style={styles.popup}>
          <div style={styles.popupContent}>
            <div style={styles.popupText}>
              Please enter your wallet address:
            </div>
            <form onSubmit={handleWalletSubmit}>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter wallet address"
                style={{...styles.input, width: '100%', marginBottom: '10px'}}
              />
              <button type="submit" style={styles.agreeButton}>
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
      <div style={styles.messageListContainer}>
        <div style={styles.messageList} ref={messageListRef}>
          {messages.map((message, index) => (
            <div key={index} style={styles.message}>
              <div style={{
                ...styles.avatar,
                ...(message.role === 'user' ? styles.userAvatar : styles.assistantAvatar)
              }}>
                {message.role === 'user' ? 'U' : 'A'}
              </div>
              <div style={{
                ...styles.bubble,
                ...(message.role === 'user' ? styles.userBubble : styles.assistantBubble)
              }}>
                {renderMessage(message)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={styles.prefillContainer}>
        {[
          "What is Xade AI?",
          "How can Xade AI help me?",
          "What are Xade AI's capabilities?",
          "Is Xade AI free to use?",
        ].map((question, index) => (
          <button
            key={index}
            style={styles.prefillButton}
            onClick={() => handlePrefillClick(question)}
          >
            {question}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          style={styles.input}
        />
        <button 
          type="submit" 
          disabled={isLoading} 
          style={{...styles.sendButton, ...(isLoading ? styles.sendButtonDisabled : {})}}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {isLoading && <div style={styles.loading}>Loading...</div>}
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

export default ChatInterface;