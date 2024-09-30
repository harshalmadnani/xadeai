import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import OpenAI from "openai";
import { coins } from './coins';
import { Select, MenuItem, InputAdornment, createTheme, ThemeProvider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';     
import { createContext, useContext } from 'react';

// Create a context for storing fetched data
const DataContext = createContext(null);

const styles = {
  chatInterface: {
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    fontFamily: "'SK Modernist', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#000',
    color: '#e5e5e5',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15px',
    backgroundColor: '#1a1a1a',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  logo: {
    width: '5%',
    height: 'auto',
    marginRight: '2%',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  walletAddress: {
    fontSize: '14px',
    color: '#e5e5e5',
    cursor: 'pointer',
  },
  popup: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#2a2a2a',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  popupInput: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#3a3a3a',
    color: '#e5e5e5',
    border: 'none',
    borderRadius: '5px',
  },
  popupButton: {
    padding: '10px 20px',
    backgroundColor: '#4a90e2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  messageListContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
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
    backgroundColor: '#1a1a1a',
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
    backgroundColor: 'white',
    color: '#000',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontWeight: 'bold',
  },
  sendButtonDisabled: {
    backgroundColor: '#7fb3e0',
    cursor: 'not-allowed',
  },
  tokenCount: {
    fontSize: '12px',
    color: '#888',
    marginTop: '5px',
  },
};

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState('0xba8Cc1690b3749c17aB2954E1ce8Cf42A3DA4519');
  const [showPopup, setShowPopup] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');

  // New state variables
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCoins, setFilteredCoins] = useState(coins);
  const [inputTokens, setInputTokens] = useState(0);

  // Create a data object to store all fetched data
  const [data, setData] = useState({
    priceHistoryData: null,
    cryptoPanicNews: null,
    marketData: null,
    metadata: null,
    historicPortfolioData: null,
    walletPortfolio: null,
  });

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
    fetchHistoricPortfolioData();
    fetchWalletPortfolio();
  }, [selectedCoin, walletAddress]);

  useEffect(() => {
    const filtered = coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCoins(filtered);
  }, [searchTerm]);

  // Modify the fetch functions to use try-catch and update error state
  const fetchPriceHistory = async () => {
    try {
      const to = Date.now();
      const from = to - 365 * 24 * 60 * 60 * 1000;

      const response = await axios.get(`https://api.mobula.io/api/1/market/history`, {
        params: {
          asset: selectedCoin.name,
          from: from,
          to: to,
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      setData(prevData => ({ ...prevData, priceHistoryData: response.data.data.price_history }));
    } catch (error) {
      console.error('Error fetching price history:', error);
      setError('Failed to fetch price history');
    }
  };

  const fetchCryptoPanicData = async () => {
    try {
      const response = await axios.get(`https://cryptopanic.com/api/free/v1/posts/?auth_token=2c962173d9c232ada498efac64234bfb8943ba70&public=true&currencies=${selectedCoin.symbol}`);
      const newsItems = response.data.results.map(item => ({
        title: item.title,
        url: item.url
      }));
      setData(prevData => ({ ...prevData, cryptoPanicNews: newsItems }));
    } catch (error) {
      console.error('Error fetching CryptoPanic data:', error);
      setError('Failed to fetch CryptoPanic data');
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await axios.get(`https://api.mobula.io/api/1/market/data?asset=${selectedCoin.name}`, {
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      setData(prevData => ({ ...prevData, marketData: response.data }));
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Failed to fetch market data');
    }
  };

  const fetchMetadata = async () => {
    try {
      const response = await axios.get(`https://api.mobula.io/api/1/metadata?asset=${selectedCoin.name}`, {
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      setData(prevData => ({ ...prevData, metadata: response.data }));
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setError('Failed to fetch metadata');
    }
  };

  const fetchHistoricPortfolioData = async () => {
    try {
      const response = await axios.get(`https://api.mobula.io/api/1/wallet/history`, {
        params: {
          wallets: walletAddress
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      setData(prevData => ({ ...prevData, historicPortfolioData: response.data }));
    } catch (error) {
      console.error('Error fetching historic portfolio data:', error);
      setError('Failed to fetch historic portfolio data');
    }
  };

  const fetchWalletPortfolio = async () => {
    try {
      const response = await axios.get(`https://api.mobula.io/api/1/wallet/multi-portfolio`, {
        params: {
          wallets: walletAddress
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      setData(prevData => ({ ...prevData, walletPortfolio: response.data }));
    } catch (error) {
      console.error('Error fetching wallet portfolio:', error);
      setError('Failed to fetch wallet portfolio');
    }
  };

  // Function to get data based on the key
  const getData = (key) => {
    return data[key];
  };

  const callOpenAIAPI = async (userInput) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: `You are Xade AI, a trading assistant with access to real-time financial data and wallet information. You have access to the following data:

1. priceHistoryData: An array of objects containing historical price data for the selected coin. Each object has 'date' and 'price' properties.
2. cryptoPanicNews: An array of news items related to the selected coin. Each item has 'title' and 'url' properties.
3. marketData: An object containing current market data for the selected coin, including price, market cap, volume, etc.
4. metadata: An object containing metadata about the selected coin, such as description, website, social media links, etc.
5. historicPortfolioData: An object containing historical portfolio data for the user's wallet.
6. walletPortfolio: An object containing current portfolio data for the user's wallet.

To answer the user's query, you should generate JavaScript code that accesses and processes this data as needed. The code you generate will be executed by our system to provide the answer. Please format your response as follows:


1. Include the JavaScript code within a code block, starting with \`\`\`javascript and ending with \`\`\`.
2. The last line of your code should return the processed data.
3. Dont Show any Comments
4. always use ?. 

Your response will be executed, and the result will be appended to your message.`
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

      // Calculate and set input tokens
      const inputTokenCount = response.usage.prompt_tokens;
      setInputTokens(inputTokenCount);

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
      // Fetch all data before calling the AI
      await Promise.all([
        fetchPriceHistory(),
        fetchCryptoPanicData(),
        fetchMarketData(),
        fetchMetadata(),
        fetchHistoricPortfolioData(),
        fetchWalletPortfolio()
      ]);

      const aiResponse = await callOpenAIAPI(input);
      
      // Extract code from AI response
      const codeMatch = aiResponse.match(/```javascript\n([\s\S]*?)\n```/);
      if (codeMatch && codeMatch[1]) {
        const code = codeMatch[1];
        // Execute the code
        const result = await executeCode(code);
        // Append the result to the AI response
        const fullResponse = `${aiResponse}\n\n**Execution Result:**\n\`\`\`\n${JSON.stringify(result, null, 2)}\n\`\`\``;
        setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to execute the code generated by GPT
  const executeCode = async (code) => {
    try {
      // Create a function from the code string
      const func = new Function('data', `
        const { priceHistoryData, cryptoPanicNews, marketData, metadata, historicPortfolioData, walletPortfolio } = data;
        ${code}
      `);
      
      // Execute the function with the current data
      console.log('Executing code:', code);
      console.log('Data passed to function:', data);
      const result = await func(data);
      console.log('Execution result:', result);
      
      if (result === undefined) {
        throw new Error('Execution result is undefined. Make sure the code returns a value.');
      }
      
      return result;
    } catch (error) {
      console.error('Error executing code:', error);
      return `Error: ${error.message}`;
    }
  };

  const renderMessage = (message, index) => {
    let content = message.content;
    
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/###\s*(.*?)\s*(\n|$)/g, '<h3>$1</h3>');
    
    return (
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
          <div dangerouslySetInnerHTML={{ __html: content }} />
          {message.role === 'user' && index === messages.length - 2 && (
            <div style={styles.tokenCount}>Input Tokens: {inputTokens}</div>
          )}
        </div>
      </div>
    );
  };

  const handleWalletAddressClick = () => {
    setShowPopup(true);
    setNewWalletAddress(walletAddress);
  };

  const handleWalletAddressChange = () => {
    setWalletAddress(newWalletAddress);
    setShowPopup(false);
    // Refetch data with new wallet address
    fetchHistoricPortfolioData();
    fetchWalletPortfolio();
  };

  // Add this new function to handle search input
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div style={styles.chatInterface}>
      <div style={{
        ...styles.header,
        justifyContent: 'space-between',
      }}>
        <img src='./XADE.png' alt="Xade AI Logo" style={styles.logo} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}>
          <ThemeProvider theme={darkTheme}>
            <div className="coin-selector">
              <Select
                value={selectedCoin.symbol}
                onChange={(e) => setSelectedCoin(coins.find(coin => coin.symbol === e.target.value))}
                renderValue={(selected) => (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                    <img src={selectedCoin.logo} alt={selectedCoin.name} style={{ width: 20, marginRight: 8 }} />
                    {selected}
                  </div>
                )}
                onOpen={() => setSearchTerm('')}
                MenuProps={{
                  PaperProps: {
                    style: {
                      backgroundColor: '#2a2a2a',
                      color: 'white',
                    },
                  },
                }}
              >
                <MenuItem>
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                  <input
                    type="text"
                    placeholder="Search coins..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      padding: '8px',
                      backgroundColor: 'transparent',
                      color: 'white',
                    }}
                  />
                </MenuItem>
                {filteredCoins.map((coin) => (
                  <MenuItem key={coin.symbol} value={coin.symbol}>
                    <img src={coin.logo} alt={coin.name} style={{ width: 20, marginRight: 8 }} />
                    {coin.symbol} - {coin.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </ThemeProvider>
          <div style={styles.walletAddress} onClick={handleWalletAddressClick}>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        </div>
      </div>
      <div style={styles.messageListContainer}>
        <div style={styles.messageList} ref={messageListRef}>
          {messages.map((message, index) => renderMessage(message, index))}
        </div>
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
          {isLoading ? 'Analyzing...' : 'Send'}
        </button>
      </form>
      {error && <div style={styles.error}>{error}</div>}
      {showPopup && (
        <div style={styles.popup}>
          <input
            type="text"
            value={newWalletAddress}
            onChange={(e) => setNewWalletAddress(e.target.value)}
            style={styles.popupInput}
          />
          <button onClick={handleWalletAddressChange} style={styles.popupButton}>
            Set Wallet Address
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatInterface;