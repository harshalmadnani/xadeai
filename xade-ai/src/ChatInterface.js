import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import OpenAI from "openai";
import { coins } from './coins';
import { Select, MenuItem, InputAdornment, createTheme, ThemeProvider, Alert, Snackbar, Typography, Paper, Link } from '@mui/material';
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
  executionResult: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#2a2a2a',
    borderRadius: '5px',
  },
  executionResultHeader: {
    color: '#50e3c2',
    marginBottom: '5px',
  },
  rawDataContainer: {
    margin: '20px',
    padding: '10px',
    backgroundColor: '#2a2a2a',
    borderRadius: '5px',
  },
  rawDataPre: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  walletPortfolioContainer: {
    backgroundColor: '#2a2a2a',
    padding: '20px',
    borderRadius: '10px',
    margin: '20px 0',
    color: '#e5e5e5',
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
  const [newWalletAddress, setNewWalletAddress] = useState('0xba8Cc1690b3749c17aB2954E1ce8Cf42A3DA4519');
  const [selectedToken, setSelectedToken] = useState(coins[0]);
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCoins, setFilteredCoins] = useState(coins);
  const [inputTokens, setInputTokens] = useState(0);

  // Create a data object to store all fetched data
  const [data, setData] = useState({
    priceHistoryData: null,
    cryptoPanicNews: null,
    metadata: null,
    historicPortfolioData: null,
    walletPortfolio: null,
  });

  // Add a new state for error snackbar
  const [errorSnackbar, setErrorSnackbar] = useState({ open: false, message: '' });

  // Add a new state for tracking API response time
  const [responseTime, setResponseTime] = useState(null);

  const messageListRef = useRef(null);

  const [marketData, setMarketData] = useState({});
  const [metadata, setMetadata] = useState({});
  const [totalWalletBalance, setTotalWalletBalance] = useState(0);
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [totalRealizedPNL, setTotalRealizedPNL] = useState(0);
  const [totalUnrealizedPNL, setTotalUnrealizedPNL] = useState(0);
  const [assets, setAssets] = useState([]);
  const [totalPNLHistory, setTotalPNLHistory] = useState({
    '24h': { realized: 0, unrealized: 0 },
    '7d': { realized: 0, unrealized: 0 },
    '30d': { realized: 0, unrealized: 0 },
    '1y': { realized: 0, unrealized: 0 },
  });
  const [isWalletPortfolioLoading, setIsWalletPortfolioLoading] = useState(true);
  const [historicPortfolioData, setHistoricPortfolioData] = useState(null);
  const [priceHistoryData, setPriceHistoryData] = useState({});

  // Add this constant after the existing state declarations
  const priceHistory = Object.entries(priceHistoryData).map(([coinName, data]) => ({
    coinName,
    data: data.map(item => ({
      date: new Date(item[0]),
      price: item[1],
      volume: item[2],
      marketCap: item[3]
    }))
  }));

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    fetchPriceHistory(selectedCoin);
    fetchCryptoPanicData(selectedCoin);
    fetchMarketData(selectedCoin);
    fetchMetadata(selectedCoin);
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
  const fetchPriceHistory = async (coinname = selectedCoin, from = null, to = null) => {
    try {
      if (!coinname) {
        console.error('Attempted to fetch price history with undefined coinname');
        setErrorSnackbar({
          open: true,
          message: 'Cannot fetch price history: Coin name is undefined'
        });
        return;
      }

      to = to || Date.now();
      from = from || to - 365 * 24 * 60 * 60 * 1000; // Default to 1 year if not provided

      console.log(`Fetching price history for ${coinname} from ${new Date(from)} to ${new Date(to)}...`);

      const response = await axios.get(`https://api.mobula.io/api/1/market/history`, {
        params: {
          asset: coinname,
          from: from,
          to: to,
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });

      if (response.data && response.data.data && response.data.data.price_history) {
        setPriceHistoryData(prevData => ({ 
          ...prevData, 
          [coinname]: response.data.data.price_history
        }));
        console.log(`Price history for ${coinname} updated successfully.`);
      } else {
        console.error('Invalid price history data structure:', response.data);
        throw new Error('Invalid price history data structure');
      }
    } catch (error) {
      console.error(`Error fetching price history for ${coinname}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({ 
        open: true, 
        message: `Failed to fetch price history for ${coinname}: ${error.message}`
      });
    }
  };

  const fetchCryptoPanicData = async (coinname) => {
    try {
      if (!coinname) {
        console.error('Attempted to fetch CryptoPanic data with undefined coinname');
        setErrorSnackbar({
          open: true,
          message: 'Cannot fetch CryptoPanic data: Coin name is undefined'
        });
        return;
      }

      const coin = coins.find(c => c.name.toLowerCase() === coinname.toLowerCase());
      if (!coin) {
        throw new Error(`Coin not found: ${coinname}`);
      }

      console.log(`Fetching CryptoPanic data for ${coinname} (${coin.symbol})...`);
      const response = await axios.get(`https://cryptopanic.com/api/free/v1/posts/`, {
        params: {
          auth_token: '2c962173d9c232ada498efac64234bfb8943ba70',
          public: 'true',
          currencies: coin.symbol
        }
      });

      if (response.data && response.data.results) {
        const newsItems = response.data.results.map(item => ({
          title: item.title,
          url: item.url
        }));
        setData(prevData => ({ 
          ...prevData, 
          cryptoPanicNews: { 
            ...prevData.cryptoPanicNews, 
            [coinname]: newsItems 
          } 
        }));
        console.log(`CryptoPanic data for ${coinname} updated successfully.`);
      } else {
        console.error('Invalid CryptoPanic data structure:', response.data);
        throw new Error('Invalid CryptoPanic data structure');
      }
    } catch (error) {
      console.error(`Error fetching CryptoPanic data for ${coinname}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({ 
        open: true, 
        message: `Failed to fetch CryptoPanic data for ${coinname}: ${error.message}`
      });
    }
  };

  const fetchMarketData = async (coinname) => {
    if (!coinname) {
      console.error('Attempted to fetch market data with undefined coinname');
      setErrorSnackbar({
        open: true,
        message: 'Cannot fetch market data: Coin name is undefined'
      });
      return;
    }

    try {
      console.log(`Fetching market data for ${coinname}...`);
      const response = await axios.get(`https://api.mobula.io/api/1/market/data?asset=${coinname}`, {
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      
      console.log('Response received:', response);

      if (response.data && response.data.data) {
        setMarketData(prevData => ({
          ...prevData,
          [coinname]: response.data.data
        }));
        console.log(`Market data for ${coinname} updated successfully.`);
      } else {
        console.error('Invalid market data structure:', response.data);
        throw new Error('Invalid market data structure');
      }
    } catch (error) {
      console.error(`Error fetching market data for ${coinname}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({ 
        open: true, 
        message: `Failed to fetch market data for ${coinname}: ${error.message}`
      });
    }
  };

  // Function to get market data for a specific coin
  const getMarketData = (coinname) => {
    if (!marketData[coinname]) {
      fetchMarketData(coinname);
      return null;
    }
    return marketData[coinname];
  };

  const fetchMetadata = async (coinname) => {
    if (!coinname) {
      console.error('Attempted to fetch metadata with undefined coinname');
      setErrorSnackbar({
        open: true,
        message: 'Cannot fetch metadata: Coin name is undefined'
      });
      return;
    }

    try {
      console.log(`Fetching metadata for ${coinname}...`);
      const response = await axios.get(`https://api.mobula.io/api/1/metadata?asset=${coinname}`, {
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      
      console.log('Metadata response received:', response);

      if (response.data && response.data.data) {
        setMetadata(prevData => ({
          ...prevData,
          [coinname]: response.data.data
        }));
        console.log(`Metadata for ${coinname} updated successfully.`);
      } else {
        console.error('Invalid metadata structure:', response.data);
        throw new Error('Invalid metadata structure');
      }
    } catch (error) {
      console.error(`Error fetching metadata for ${coinname}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({ 
        open: true, 
        message: `Failed to fetch metadata for ${coinname}: ${error.message}`
      });
    }
  };

  // Add a function to get metadata for a specific coin
  const getMetadata = (coinname) => {
    if (!metadata[coinname]) {
      fetchMetadata(coinname);
      return null;
    }
    return metadata[coinname];
  };

  const fetchHistoricPortfolioData = async (from = null, to = null) => {
    try {
      to = to || Date.now();
      from = from || to - 365 * 24 * 60 * 60 * 1000; // Default to 1 year if not provided

      console.log(`Fetching historic portfolio data from ${new Date(from)} to ${new Date(to)}...`);

      const response = await axios.get(`https://api.mobula.io/api/1/wallet/history`, {
        params: {
          wallets: walletAddress,
          from: from,
          to: to
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });

      if (response.data) {
        setHistoricPortfolioData(response.data);
        console.log('Historic portfolio data updated successfully.');
      } else {
        console.error('Invalid historic portfolio data structure:', response.data);
        throw new Error('Invalid historic portfolio data structure');
      }
    } catch (error) {
      console.error('Error fetching historic portfolio data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({ 
        open: true, 
        message: `Failed to fetch historic portfolio data: ${error.message}`
      });
    }
  };

  const fetchWalletPortfolio = async () => {
    setIsWalletPortfolioLoading(true);
    try {
      console.log('Fetching wallet portfolio for address:', walletAddress);
      const response = await axios.get(`https://api.mobula.io/api/1/wallet/multi-portfolio`, {
        params: {
          wallets: walletAddress
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      
      console.log('Wallet portfolio response:', response.data);
      
      if (response.data && response.data.data && response.data.data[0]) {
        const portfolioData = response.data.data[0];
        
        setTotalWalletBalance(portfolioData.total_wallet_balance);
        setWalletAddresses(portfolioData.wallets);
        setTotalRealizedPNL(portfolioData.total_realized_pnl);
        setTotalUnrealizedPNL(portfolioData.total_unrealized_pnl);
        setAssets(portfolioData.assets);
        setTotalPNLHistory(portfolioData.total_pnl_history);
        
        setData(prevData => ({ ...prevData, walletPortfolio: response.data }));
      } else {
        console.error('Invalid wallet portfolio data structure:', response.data);
        setErrorSnackbar({ open: true, message: 'Invalid wallet portfolio data structure' });
      }
    } catch (error) {
      console.error('Error fetching wallet portfolio:', error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({ open: true, message: `Failed to fetch wallet portfolio: ${error.message}` });
    }
    setIsWalletPortfolioLoading(false);
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
            content: `You are a helpful assistant for a cryptocurrency analysis platform. When the user asks about a specific token or coin, use the provided functions to fetch and return relevant data. For price-related queries, use the price() function. For other market data, use getMarketData(). For metadata like website or social media links, use getMetadata(). Always wrap your code in a JavaScript code block and use a function to return the result. For example:

\`\`\`javascript
return price(selectedCoin);
\`\`\`

Replace 'bitcoin' with the name of the token the user is asking about. Choose the appropriate function based on the user's request. If the user doesn't specify a token, ask for clarification.`
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

  // Modify the handleSubmit function to track response time
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Fetch all data before calling the AI
      await Promise.all([
        fetchPriceHistory(selectedCoin),
        fetchCryptoPanicData(selectedCoin),
        fetchMarketData(selectedCoin), // Make sure selectedCoin is defined
        fetchMetadata(selectedCoin),
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

      const endTime = Date.now();
      setResponseTime(endTime - startTime);
    } catch (error) {
      setError(error.message);
      setErrorSnackbar({ open: true, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to execute the code generated by GPT
  const executeCode = async (code) => {
    try {
      // Wrap the code in a function if it's not already
      const wrappedCode = code.includes('function') ? code : `function executeAICode() {\n${code}\n}\nexecuteAICode();`;
      
      const func = new Function(
        'data', 'selectedCoin', 'setSelectedCoin', 'getMarketData', 'getMetadata',
        'price', 'volume', 'marketCap', 'website', 'twitter', 'telegram', 'discord', 'description',
        `
          const { priceHistoryData, cryptoPanicNews, historicPortfolioData, walletPortfolio } = data;
          
          // Helper function to check if data is loaded
          const isLoaded = (value) => value !== 'N/A' && value !== undefined && value !== null;

          // Wrap each function to handle loading state
          const wrappedFunctions = {
            price: (token) => isLoaded(price(token)) ? price(token) : 'Loading...',
            volume: (token) => isLoaded(volume(token)) ? volume(token) : 'Loading...',
            marketCap: (token) => isLoaded(marketCap(token)) ? marketCap(token) : 'Loading...',
            website: (token) => isLoaded(website(token)) ? website(token) : 'Loading...',
            twitter: (token) => isLoaded(twitter(token)) ? twitter(token) : 'Loading...',
            telegram: (token) => isLoaded(telegram(token)) ? telegram(token) : 'Loading...',
            discord: (token) => isLoaded(discord(token)) ? discord(token) : 'Loading...',
            description: (token) => isLoaded(description(token)) ? description(token) : 'Loading...',
          };

          // Replace original functions with wrapped versions in the code
          const finalCode = \`${wrappedCode}\`.replace(
            /(price|volume|marketCap|website|twitter|telegram|discord|description)\\(/g,
            'wrappedFunctions.$1('
          );

          // Execute the wrapped code
          return eval(finalCode);
        `
      );
      
      const result = await func(
        data, selectedCoin, setSelectedCoin, getMarketData, getMetadata,
        price, volume, marketCap, website, twitter, telegram, discord, description
      );
      
      if (result === undefined) {
        throw new Error('Execution result is undefined. Make sure the code returns a value.');
      }
      
      return result;
    } catch (error) {
      console.error('Error executing code:', error);
      return `Error: ${error.message}`;
    }
  };

  // Modify the renderMessage function to include response time
  const renderMessage = (message, index) => {
    let content = message.content;
    
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/###\s*(.*?)\s*(\n|$)/g, '<h3>$1</h3>');
    
    // Parse the execution result
    const executionResultMatch = content.match(/\*\*Execution Result:\*\*\n```\n([\s\S]*?)\n```/);
    const executionResult = executionResultMatch ? executionResultMatch[1] : null;
    
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
          {executionResult ? (
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {executionResult}
            </pre>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
          {message.role === 'user' && index === messages.length - 2 && (
            <div style={styles.tokenCount}>Input Tokens: {inputTokens}</div>
          )}
          {message.role === 'assistant' && index === messages.length - 1 && responseTime && (
            <Typography variant="caption" style={{ marginTop: '5px', color: '#888' }}>
              Response time: {responseTime}ms
            </Typography>
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
    if (!/^0x[a-fA-F0-9]{40}$/.test(newWalletAddress)) {
      setErrorSnackbar({ open: true, message: 'Invalid Ethereum wallet address' });
      return;
    }
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

  // Add a function to handle closing the error snackbar
  const handleCloseErrorSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrorSnackbar({ ...errorSnackbar, open: false });
  };

  // Modify these functions to return 'N/A' for loading state
  const website = (token) => {
    return getMetadata(token)?.website || 'N/A';
  };
  const twitter = (token) => {
    return getMetadata(token)?.twitter || 'N/A';
  };
  const telegram = (token) => {
    return getMetadata(token)?.telegram || 'N/A';
  };
  const discord = (token) => {
    return getMetadata(token)?.discord || 'N/A';
  };
  const description = (token) => {
    return getMetadata(token)?.description || 'N/A';
  };
  const price = (token) => {
    const data = getMarketData(token);
    return data?.price !== undefined ? `$${data.price.toFixed(2)}` : 'N/A';
  };
  const volume = (token) => {
    const data = getMarketData(token);
    return data?.volume !== undefined ? `$${data.volume.toFixed(2)}` : 'N/A';
  };
  const marketCap = (token) => {
    const data = getMarketData(token);
    return data?.market_cap !== undefined ? `$${data.market_cap.toFixed(2)}` : 'N/A';
  };
  const marketCapDiluted = (token) => {
    return `$${getMarketData(token)?.market_cap_diluted?.toFixed(2) || 'N/A'}`;
  };
  const liquidity = (token) => {
    return `$${getMarketData(token)?.liquidity?.toFixed(2) || 'N/A'}`;
  };
  const liquidityChange24h = (token) => {
    return `${getMarketData(token)?.liquidity_change_24h?.toFixed(2) || 'N/A'}%`;
  };
  const offChainVolume = (token) => {
    return `$${getMarketData(token)?.off_chain_volume?.toFixed(2) || 'N/A'}`;
  };
  const volume7d = (token) => {
    return `$${getMarketData(token)?.volume_7d?.toFixed(2) || 'N/A'}`;
  };
  const volumeChange24h = (token) => {
    return `${getMarketData(token)?.volume_change_24h?.toFixed(2) || 'N/A'}%`;
  };
  const isListed = (token) => {
    return getMarketData(token)?.is_listed ? 'Yes' : 'No';
  };
  const priceChange24h = (token) => {
    return `${getMarketData(token)?.price_change_24h?.toFixed(2) || 'N/A'}%`;
  };
  const priceChange1h = (token) => {
    return `${getMarketData(token)?.price_change_1h?.toFixed(2) || 'N/A'}%`;
  };
  const priceChange7d = (token) => {
    return `${getMarketData(token)?.price_change_7d?.toFixed(2) || 'N/A'}%`;
  };
  const priceChange1m = (token) => {
    return `${getMarketData(token)?.price_change_1m?.toFixed(2) || 'N/A'}%`;
  };
  const priceChange1y = (token) => {
    return `${getMarketData(token)?.price_change_1y?.toFixed(2) || 'N/A'}%`;
  };
  const ath = (token) => {
    return `$${getMarketData(token)?.ath?.toFixed(2) || 'N/A'}`;
  };
  const atl = (token) => {
    return `$${getMarketData(token)?.atl?.toFixed(2) || 'N/A'}`;
  };
  const rank = (token) => {
    return getMarketData(token)?.rank || 'N/A';
  };
  const totalSupply = (token) => {
    return getMarketData(token)?.total_supply || 'N/A';
  };
  const circulatingSupply = (token) => {
    return getMarketData(token)?.circulating_supply || 'N/A';
  };
  const renderWalletPortfolio = () => {
    if (isWalletPortfolioLoading) {
      return <p>Loading wallet portfolio data...</p>;
    }
    
    if (!getData('walletPortfolio')) {
      return <p>No wallet portfolio data available.</p>;
    }
    
    return (
      <div style={styles.walletPortfolioContainer}>
        <h3>Wallet Portfolio</h3>
        <p>Total Balance: ${totalWalletBalance.toFixed(2)}</p>
        <p>Total Realized PNL: ${totalRealizedPNL.toFixed(2)}</p>
        <p>Total Unrealized PNL: ${totalUnrealizedPNL.toFixed(2)}</p>
        <h4>Assets:</h4>
        <ul>
          {assets.map((asset, index) => (
            <li key={index}>
              {asset.asset.name} ({asset.asset.symbol}): 
              Balance: {asset.token_balance.toFixed(6)}, 
              Value: ${asset.estimated_balance.toFixed(2)}
            </li>
          ))}
        </ul>
        <h4>PNL History:</h4>
        <ul>
          <li>24h: Realized: ${totalPNLHistory['24h'].realized.toFixed(2)}, Unrealized: ${totalPNLHistory['24h'].unrealized.toFixed(2)}</li>
          <li>7d: Realized: ${totalPNLHistory['7d'].realized.toFixed(2)}, Unrealized: ${totalPNLHistory['7d'].unrealized.toFixed(2)}</li>
          <li>30d: Realized: ${totalPNLHistory['30d'].realized.toFixed(2)}, Unrealized: ${totalPNLHistory['30d'].unrealized.toFixed(2)}</li>
          <li>1y: Realized: ${totalPNLHistory['1y'].realized.toFixed(2)}, Unrealized: ${totalPNLHistory['1y'].unrealized.toFixed(2)}</li>
        </ul>
      </div>
    );
  };
  const renderCryptoPanicNews = (coinname) => {
    const newsItems = data.cryptoPanicNews?.[coinname];
    
    if (!newsItems || newsItems.length === 0) {
      return <Typography>No news available for {coinname}</Typography>;
    }

    return (
      <div>
        <Typography variant="h6">Latest News for {coinname}</Typography>
        {newsItems.map((item, index) => (
          <Typography key={index}>
            <Link href={item.url} target="_blank" rel="noopener noreferrer">
              {item.title}
            </Link>
          </Typography>
        ))}
      </div>
    );
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
                value={selectedToken.symbol}
                onChange={(e) => setSelectedToken(coins.find(coin => coin.symbol === e.target.value))}
                renderValue={(selected) => (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                    <img src={selectedToken.logo} alt={selectedToken.symbol} style={{ width: 20, marginRight: 8 }} />
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
          <div style={{ color: 'white' }}>
            {price('polygon')}
          </div>
          <div style={{ color: 'white' }}>
            Solana: {price('ethereum')}
          </div>
          <div style={{ color: 'white' }}>
            Solana: {marketCap('ethereum')}
          </div>
          <div style={{ color: 'white', fontSize: '14px' }}>
            Website: {website('ethereum')}
          </div>
          <div style={{ color: 'white', fontSize: '14px' }}>
            Twitter: {twitter(selectedCoin)}
          </div>
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
      <Snackbar open={errorSnackbar.open} autoHideDuration={6000} onClose={handleCloseErrorSnackbar}>
        <Alert onClose={handleCloseErrorSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorSnackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ChatInterface;