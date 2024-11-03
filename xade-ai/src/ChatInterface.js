import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import OpenAI from "openai";
import { coins } from './coins';
import { Select, MenuItem, InputAdornment, createTheme, ThemeProvider, Alert, Snackbar, Typography, Paper, Link } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';     
import { createContext, useContext } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { styles } from './ChatInterfaceStyles';
// Create a context for storing fetched data
const DataContext = createContext(null);



const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Create a new component for the UI
const ChatInterfaceUI = ({
  disclaimerAccepted,
  renderDisclaimerDialog,
  showAnnouncement,
  styles,
  messages,
  messageListRef,
  input,
  isLoading,
  error,
  errorSnackbar,
  // Handler functions
  handleCloseAnnouncement,
  handleSubmit,
  setInput,
  handleCloseErrorSnackbar,
  renderMessage
}) => (
  <div style={styles.chatInterface}>
    {renderDisclaimerDialog()}
    {showAnnouncement && (
      <div style={styles.announcementBar}>
        <span style={styles.announcementText}>Degen AI can only answer questions related to your portfolio right now!</span>
        <CloseIcon style={styles.closeButton} onClick={handleCloseAnnouncement} />
      </div>
    )}
    <div style={{
      ...styles.header,
      justifyContent: 'space-between',
    }}>
      <img src='./XADE.png' alt="Xade AI Logo" style={styles.logo} />
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
    <Snackbar open={errorSnackbar.open} autoHideDuration={6000} onClose={handleCloseErrorSnackbar}>
      <Alert onClose={handleCloseErrorSnackbar} severity="error" sx={{ width: '100%' }}>
        {errorSnackbar.message}
      </Alert>
    </Snackbar>
  </div>
);

function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(coins[0]);
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCoins, setFilteredCoins] = useState(coins);
  const [inputTokens, setInputTokens] = useState(0);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

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

  const portfolioBalance = totalWalletBalance?.toFixed(2) ?? 'N/A';
  const portfolioRealizedPNL = totalRealizedPNL?.toFixed(2) ?? 'N/A';
  const portfolioUnrealizedPNL = totalUnrealizedPNL?.toFixed(2) ?? 'N/A';

  const portfolioAssetsList = assets?.map(asset => ({
    name: asset.asset?.name ?? 'Unknown',
    symbol: asset.asset?.symbol ?? 'N/A',
    balance: asset.token_balance?.toFixed(6) ?? 'N/A',
    value: asset.estimated_balance?.toFixed(2) ?? 'N/A'
  })) ?? [];

  const portfolioPNLTimelines = {
    '24h': {
      realized: totalPNLHistory?.['24h']?.realized?.toFixed(2) ?? 'N/A',
      unrealized: totalPNLHistory?.['24h']?.unrealized?.toFixed(2) ?? 'N/A'
    },
    '7d': {
      realized: totalPNLHistory?.['7d']?.realized?.toFixed(2) ?? 'N/A',
      unrealized: totalPNLHistory?.['7d']?.unrealized?.toFixed(2) ?? 'N/A'
    },
    '30d': {
      realized: totalPNLHistory?.['30d']?.realized?.toFixed(2) ?? 'N/A',
      unrealized: totalPNLHistory?.['30d']?.unrealized?.toFixed(2) ?? 'N/A'
    },
    '1y': {
      realized: totalPNLHistory?.['1y']?.realized?.toFixed(2) ?? 'N/A',
      unrealized: totalPNLHistory?.['1y']?.unrealized?.toFixed(2) ?? 'N/A'
    }
  };

  const [walletAddresses] = useState(['']); // Example default address

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);



  useEffect(() => {
    const filtered = coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCoins(filtered);
  }, [searchTerm]);

  // Add the getTokenName function
  const getTokenName = (input) => {
    const lowercaseInput = input.toLowerCase();
    const matchedCoin = coins.find(coin => 
      coin.name.toLowerCase() === lowercaseInput || 
      coin.symbol.toLowerCase() === lowercaseInput
    );
    return matchedCoin ? matchedCoin.name.toLowerCase() : input.toLowerCase();
  };

  // Update the data fetching functions to use getTokenName
  const fetchPriceHistory = async (coinname, from = null, to = null) => {
    try {
      const normalizedCoinName = getTokenName(coinname);
      if (!normalizedCoinName) {
        console.error('Attempted to fetch price history with undefined coinname');
        setErrorSnackbar({
          open: true,
          message: 'Cannot fetch price history: Coin name is undefined'
        });
        return null;
      }

      to = to || Date.now();
      from = from || to - 365 * 24 * 60 * 60 * 1000;

      console.log(`Fetching price history for ${normalizedCoinName}...`);
      const response = await axios.get(`https://api.mobula.io/api/1/market/history`, {
        params: {
          asset: normalizedCoinName,
          from: from,
          to: to,
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });

      if (response.data?.data?.price_history) {
        const formattedData = response.data.data.price_history.map(([timestamp, price]) => ({
          timestamp,
          date: new Date(timestamp),
          price
        }));
        return formattedData;
      } else {
        throw new Error('Invalid price history data structure');
      }
    } catch (error) {
      console.error(`Error fetching price history for ${coinname}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({
        open: true,
        message: `Failed to fetch price history for ${coinname}: ${error.message}`
      });
      return null;
    }
  };

  const fetchCryptoPanicData = async (coinname) => {
    try {
      const normalizedCoinName = getTokenName(coinname);
      if (!normalizedCoinName) {
        console.error('Attempted to fetch CryptoPanic data with undefined coinname');
        setErrorSnackbar({
          open: true,
          message: 'Cannot fetch CryptoPanic data: Coin name is undefined'
        });
        return;
      }

      const coin = coins.find(c => c.name.toLowerCase() === normalizedCoinName.toLowerCase());
      if (!coin) {
        throw new Error(`Coin not found: ${normalizedCoinName}`);
      }

      console.log(`Fetching CryptoPanic data for ${normalizedCoinName} (${coin.symbol})...`);
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
            [normalizedCoinName]: newsItems 
          } 
        }));
        console.log(`CryptoPanic data for ${normalizedCoinName} updated successfully.`);
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
    try {
      const normalizedCoinName = getTokenName(coinname);
      if (!normalizedCoinName) {
        console.error('Attempted to fetch market data with undefined coinname');
        setErrorSnackbar({
          open: true,
          message: 'Cannot fetch market data: Coin name is undefined'
        });
        return null;
      }

      console.log(`Fetching market data for ${normalizedCoinName}...`);
      const response = await axios.get(`https://api.mobula.io/api/1/market/data?asset=${normalizedCoinName}`, {
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      
      console.log('Response received:', response);

      if (response.data && response.data.data) {
        console.log(`Market data for ${normalizedCoinName} fetched successfully.`);
        return response.data.data;
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
      return null;
    }
  };

  // Function to get market data for a specific coin
  const getMarketData = async (token) => {
    if (!marketData[token]) {
      const data = await fetchMarketData(token);
      console.log('*****Market data*****:', data);
      if (data) {
        setMarketData(prevData => ({
          ...prevData,
          [token]: data
        }));
      console.log('*****Market data*****:', data);
      }
      return data;
    }
    console.log('*****Market data*****:', data);
    return marketData[token] || null;
  };


  const fetchMetadata = async (coinname) => {
    try {
      const normalizedCoinName = getTokenName(coinname);
      if (!normalizedCoinName) {
        console.error('Attempted to fetch metadata with undefined coinname');
        setErrorSnackbar({
          open: true,
          message: 'Cannot fetch metadata: Coin name is undefined'
        });
        return null;
      }

      console.log(`Fetching metadata for ${normalizedCoinName}...`);
      const response = await axios.get(`https://api.mobula.io/api/1/metadata?asset=${normalizedCoinName}`, {
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      
      if (response.data && response.data.data) {
        console.log(`Metadata for ${normalizedCoinName} fetched successfully.`);
        return response.data.data;
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
      return null;
    }
  };

  // Add a function to get metadata for a specific coin
  const getMetadata = async (token) => {
    if (!metadata[token]) {
      const data = await fetchMetadata(token);
      console.log('Metadata fetched:', data);
      if (data) {
        setMetadata(prevData => ({
          ...prevData,
          [token]: data
        }));
      }
      return data;
    }
    return metadata[token] || null;
  };

  const fetchHistoricPortfolioData = async (from = null, to = null, addresses = walletAddresses) => {
    if (!addresses || addresses.length === 0) {
      console.error('Attempted to fetch historic portfolio data with no addresses');
      setErrorSnackbar({
        open: true,
        message: 'Cannot fetch historic portfolio data: No wallet addresses provided'
      });
      return null;
    }

    try {
      to = to || Date.now();
      from = from || to - 365 * 24 * 60 * 60 * 1000;

      console.log(`Fetching historic portfolio data for addresses: ${addresses.join(', ')}`);
      const response = await axios.get(`https://api.mobula.io/api/1/wallet/history`, {
        params: {
          wallets: addresses.join(','),
          from: from,
          to: to
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });

      if (response.data) {
        console.log('Historic portfolio data fetched successfully');
        setHistoricPortfolioData(response.data);
        return response.data;
      } else {
        throw new Error('Invalid historic portfolio data structure');
      }
    } catch (error) {
      console.error('Error fetching historic portfolio data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({ 
        open: true, 
        message: `Failed to fetch historic portfolio data: ${error.message}`
      });
      return null;
    }
  };

  const fetchWalletPortfolio = async (address) => {
    try {
      console.log(`Fetching wallet portfolio for address: ${address}`);
      const response = await axios.get(`https://api.mobula.io/api/1/wallet/multi-portfolio`, {
        params: {
          wallets: address
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      
      if (response.data && response.data.data && response.data.data[0]) {
        console.log('Wallet portfolio fetched successfully');
        return response.data.data[0];
      } else {
        throw new Error('Invalid wallet portfolio data structure');
      }
    } catch (error) {
      console.error('Error fetching wallet portfolio:', error);
      return null;
    }
  };

  // Add this new function
  const getWalletPortfolio = async (address) => {
    const data = await fetchWalletPortfolio(address);
    if (!data) return 'Unable to fetch wallet data';
    
    return {
      balance: data.total_wallet_balance?.toFixed(2) || 'N/A',
      realizedPNL: data.total_realized_pnl?.toFixed(2) || 'N/A',
      unrealizedPNL: data.total_unrealized_pnl?.toFixed(2) || 'N/A',
      assets: data.assets?.map(asset => ({
        name: asset.asset?.name || 'Unknown',
        symbol: asset.asset?.symbol || 'N/A',
        balance: asset.token_balance?.toFixed(6) || 'N/A',
        value: asset.estimated_balance?.toFixed(2) || 'N/A'
      })) || [],
      pnlHistory: data.total_pnl_history || {}
    };
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
            content: `You are Xade AI's data fetcher. Your only role is to identify and fetch the relevant data based on the user's question. Do not perform any calculations or analysis.

Available functions:
- Market Data:
  - price(token) - returns current price in USD
  - volume(token) - returns 24h volume
  - marketCap(token) - returns market cap
  - marketCapDiluted(token) - returns fully diluted market cap
  - liquidity(token) - returns liquidity
  - liquidityChange24h(token) - returns 24h liquidity change %
  - offChainVolume(token) - returns off-chain volume
  - volume7d(token) - returns 7d volume
  - volumeChange24h(token) - returns 24h volume change %
  - isListed(token) - returns listing status
  - priceChange24h(token) - returns 24h price change %
  - priceChange1h(token) - returns 1h price change %
  - priceChange7d(token) - returns 7d price change %
  - priceChange1m(token) - returns 30d price change %
  - priceChange1y(token) - returns 1y price change %
  - ath(token) - returns all-time high price
  - atl(token) - returns all-time low price
  - rank(token) - returns market rank
  - totalSupply(token) - returns total supply
  - circulatingSupply(token) - returns circulating supply

- Social/Info:
  - website(token) - returns official website URL
  - twitter(token) - returns Twitter handle
  - telegram(token) - returns Telegram group link
  - discord(token) - returns Discord server link
  - description(token) - returns project description
  - getNews(token) - returns latest news articles

- Historical Data:
  - priceHistoryData(token, period) - returns array of {date, price} objects
  - getHistoricPortfolioData(addresses, period) - returns {wallet, wallets, currentBalance, balanceHistory}
  Periods can be "1d", "7d", "30d", "1y"

- Wallet Analysis:
  - getWalletPortfolio(address) - returns detailed wallet information:
    {
      balance: total wallet balance in USD
      realizedPNL: realized profit/loss
      unrealizedPNL: unrealized profit/loss
      assets: [{
        name: token name
        symbol: token symbol
        balance: token amount
        value: USD value
      }]
      pnlHistory: historical PNL data
    }

Instructions:
1. Return only the raw data needed to answer the user's question
2. Do not perform any calculations or analysis
3. Format your response as JavaScript code that calls the necessary functions
4. For historical data, always specify the period needed
5. Always return the fetched data as a structured object

Example format:
\`\`\`javascript
const data = {
  currentPrice: await price("bitcoin"),
  priceHistory: await priceHistoryData("bitcoin", "30d"),
  walletData: await getWalletPortfolio("0x123..."),
  news: await getNews("bitcoin")
};
return data;
\`\`\`
`
          },
          { role: "user", content: userInput }
        ],
        temperature: 0.7
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
    const startTime = Date.now();

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    console.log('User input:', userInput);

    try {
      const initialAiResponse = await callOpenAIAPI(userInput);
      console.log('Initial response from GPT-4o-mini:', initialAiResponse);

      const processResponse = async (response) => {
        const codeMatch = response.match(/```javascript\n([\s\S]*?)\n```/);
        if (codeMatch && codeMatch[1]) {
          const code = codeMatch[1];
          const executionStartTime = Date.now();
          let result;

          // Execute code without timeout
          result = await executeCode(codeMatch[1]);
          const executionTime = Date.now() - executionStartTime;

          console.log('Execution result:', result);

          // Make a direct call to OpenAI API without the system prompt
          const finalResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "user", content: `As Degen AI, provide an answer for the following query: "${userInput}". The data from the execution is: ${result}` }
            ],
            temperature: 0.7,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          });

          console.log('Final response from GPT-4o-mini:', finalResponse.choices[0].message.content);

          return finalResponse.choices[0].message.content;
        }
        return response;
      };

      const processedResponse = await processResponse(initialAiResponse);
      setMessages(prev => [...prev, { role: 'assistant', content: processedResponse }]);

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
      const portfolioData = {
        balance: portfolioBalance,
        realizedPNL: portfolioRealizedPNL,
        unrealizedPNL: portfolioUnrealizedPNL,
        assetsList: portfolioAssetsList,
        pnlTimelines: portfolioPNLTimelines
      };

      const wrappedFunctions = {
        priceHistoryData: async (token, period = '1y') => {
          const data = await getPriceHistory(token, period);
          return data.map(item => ({
            date: item.date.toISOString(),
            price: item.price
          }));
        },
        getHistoricPortfolioData: async (addresses, period = '1y') => {
          // Ensure addresses is an array
          const addressArray = Array.isArray(addresses) ? addresses : [addresses];
          if (!addressArray.length) {
            throw new Error('No wallet addresses provided');
          }
          
          const to = Date.now();
          const periods = {
            '1d': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            '1y': 365 * 24 * 60 * 60 * 1000
          };
          const from = to - (periods[period] || periods['1y']);
          
          const data = await fetchHistoricPortfolioData(from, to, addressArray);
          return data;
        },
        getWalletPortfolio: async (address) => {
          const data = await getWalletPortfolio(address);
          return data;
        }
      };

      const wrappedCode = `async function executeAICode() {
        const priceHistoryData = async (token, period) => {
          const data = await wrappedFunctions.priceHistoryData(token, period);
          return data;
        };
        const getHistoricPortfolioData = async (addresses, period) => {
          const data = await wrappedFunctions.getHistoricPortfolioData(addresses, period);
          return data;
        };
        const getWalletPortfolio = async (address) => {
          const data = await wrappedFunctions.getWalletPortfolio(address);
          return data;
        };
        ${code}
      }
      return executeAICode();`;

      const func = new Function(
        'wrappedFunctions',
        'data', 'selectedCoin', 'setSelectedCoin', 'getMarketData', 'getMetadata',
        'price', 'volume', 'marketCap', 'marketCapDiluted', 'liquidity', 'liquidityChange24h',
        'offChainVolume', 'volume7d', 'volumeChange24h', 'isListed', 'priceChange24h',
        'priceChange1h', 'priceChange7d', 'priceChange1m', 'priceChange1y', 'ath', 'atl',
        'rank', 'totalSupply', 'circulatingSupply', 'website', 'twitter', 'telegram',
        'discord', 'description', 'portfolioData', 'renderCryptoPanicNews',
        'historicPortfolioData', 'getNews',
        wrappedCode
      );

      const result = await func(
        wrappedFunctions,
        data, selectedCoin, setSelectedCoin, getMarketData, getMetadata,
        price, volume, marketCap, marketCapDiluted, liquidity, liquidityChange24h,
        offChainVolume, volume7d, volumeChange24h, isListed, priceChange24h,
        priceChange1h, priceChange7d, priceChange1m, priceChange1y, ath, atl,
        rank, totalSupply, circulatingSupply, website, twitter, telegram,
        discord, description, portfolioData, renderCryptoPanicNews,
        historicPortfolioData, getNews
      );

      if (result === undefined) {
        throw new Error('Execution result is undefined. Make sure the code returns a value.');
      }

      return typeof result === 'string' ? result.replace(/^"|"$/g, '') : JSON.stringify(result, null, 2);
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
    
    // Check if the execution result is "please resend the prompt"
    if (executionResult === 'please resend the prompt') {
      content = 'Please resend the prompt.';
    } else if (executionResult && executionResult.startsWith('"') && executionResult.endsWith('"')) {
      // Remove quotes from the execution result if it's a simple string
      content = content.replace(executionResult, executionResult.slice(1, -1));
    }
    
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
          {message.role === 'assistant' && index === messages.length - 1 && responseTime && (
            <Typography variant="caption" style={{ marginTop: '5px', color: '#888' }}>
              Response time: {responseTime}ms
            </Typography>
          )}
        </div>
      </div>
    );
  };

  const handleAcceptDisclaimer = () => {
    setDisclaimerAccepted(true);
  };

  // Render the disclaimer dialog
  const renderDisclaimerDialog = () => (
    <Dialog
      open={!disclaimerAccepted}
      aria-labelledby="disclaimer-dialog-title"
      aria-describedby="disclaimer-dialog-description"
      PaperProps={{
        style: {
          backgroundColor: 'white',
          color: 'black',
          fontFamily: "'SK Modernist', sans-serif",
        },
      }}
    >
      <DialogTitle id="disclaimer-dialog-title" style={{ 
        textAlign: 'center', 
        fontSize: '24px',
        fontWeight: 'bold',
      }}>
        {"DISCLAIMER"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="disclaimer-dialog-description" style={{ 
          fontSize: '20px', 
          textAlign: 'center',
          color: 'black',
          fontWeight: 'bold',
        }}>
          NOT FINANCIAL ADVICE
        </DialogContentText>
        <DialogContentText style={{ 
          marginTop: '20px',
          color: 'black',
        }}>
          The information provided by this application is for informational purposes only and should not be considered as financial advice. Always conduct your own research and consult with a qualified financial advisor before making any investment decisions.
        </DialogContentText>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center', padding: '20px' }}>
        <Button 
          onClick={handleAcceptDisclaimer} 
          variant="contained" 
          style={{ 
            backgroundColor: 'black',
            color: 'white',
            width: '200px',
          }}
        >
          Accept and Continue
        </Button>
      </DialogActions>
    </Dialog>
  );

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false);
  };

  const fetchCryptoPanicNews = async (coinname) => {
    try {
      const normalizedCoinName = getTokenName(coinname);
      if (!normalizedCoinName) {
        throw new Error('Invalid coin name');
      }

      const coin = coins.find(c => c.name.toLowerCase() === normalizedCoinName.toLowerCase());
      if (!coin) {
        throw new Error(`Coin not found: ${normalizedCoinName}`);
      }

      const response = await axios.get(`https://cryptopanic.com/api/free/v1/posts/`, {
        params: {
          auth_token: '2c962173d9c232ada498efac64234bfb8943ba70',
          public: 'true',
          currencies: coin.symbol
        }
      });

      if (!response.data?.results) {
        throw new Error('Invalid response from CryptoPanic API');
      }

      const newsItems = response.data.results.map(item => ({
        title: item.title,
        url: item.url
      }));

      return newsItems;
    } catch (error) {
      console.error(`Error fetching CryptoPanic news:`, error);
      throw error;
    }
  };

  const getNews = async (token) => {
    try {
      const normalizedToken = getTokenName(token);
      const newsItems = await fetchCryptoPanicNews(normalizedToken);
      
      if (!newsItems || newsItems.length === 0) {
        return 'No news available for this token';
      }

      // Format news items as a numbered list
      return newsItems
        .slice(0, 5) // Limit to 5 news items
        .map((item, index) => `${index + 1}. ${item.title}`)
        .join('\n');
    } catch (error) {
      console.error('Error in getNews:', error);
      return `Unable to fetch news: ${error.message}`;
    }
  };

  // Add a new function to get price history data
  const getPriceHistory = async (token, period = '1y') => {
    const normalizedToken = getTokenName(token);
    if (!priceHistoryData[normalizedToken]) {
      const to = Date.now();
      const periods = {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '1y': 365 * 24 * 60 * 60 * 1000
      };
      const from = to - (periods[period] || periods['1y']);
      
      const data = await fetchPriceHistory(normalizedToken, from, to);
      if (data) {
        setPriceHistoryData(prevData => ({
          ...prevData,
          [normalizedToken]: data
        }));
      }
      return data;
    }
    return priceHistoryData[normalizedToken];
  };

  const getHistoricPortfolioData = async (addresses, period = '1y') => {
    try {
      if (!addresses || addresses.length === 0) {
        throw new Error('No wallet addresses provided');
      }

      // Calculate time range based on period
      const to = Date.now();
      const periods = {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '1y': 365 * 24 * 60 * 60 * 1000
      };
      const from = to - (periods[period] || periods['1y']);

      // Fetch data using existing fetchHistoricPortfolioData
      const response = await fetchHistoricPortfolioData(from, to, addresses);

      if (!response || !response.data || !response.data.balance_history) {
        throw new Error('Invalid response format');
      }

      // Format the data similar to price history
      return {
        wallet: response.data.wallet,
        wallets: response.data.wallets,
        currentBalance: response.data.balance_usd,
        balanceHistory: response.data.balance_history.map(([timestamp, balance]) => ({
          timestamp,
          date: new Date(timestamp),
          balance: parseFloat(balance)
        }))
      };

    } catch (error) {
      console.error('Error in getHistoricPortfolioData:', error);
      throw error;
    }
  };

  // Add these helper functions for token data
  const website = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    return metadata?.website || 'N/A';
  };
  const twitter = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    return metadata?.twitter || 'N/A';
  };
  const telegram = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    return metadata?.telegram || 'N/A';
  };
  const discord = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    return metadata?.discord || 'N/A';
  };
  const description = async (token) => {
    const normalizedToken = getTokenName(token);
    const metadata = await getMetadata(normalizedToken);
    return metadata?.description || 'N/A';
  };
  const price = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    console.log('*****Price*****:', data);
    if (!data) return 'please resend the prompt';
    return data.price !== undefined ? `$${data.price.toFixed(2)}` : 'N/A';
  };
  const volume = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return data?.volume !== undefined ? `$${data.volume.toFixed(2)}` : 'N/A';
  };
  const marketCap = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return data?.market_cap !== undefined ? `$${data.market_cap.toFixed(2)}` : 'N/A';
  };
  const marketCapDiluted = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `$${data?.market_cap_diluted?.toFixed(2) || 'N/A'}`;
  };
  const liquidity = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `$${data?.liquidity?.toFixed(2) || 'N/A'}`;
  };
  const liquidityChange24h = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.liquidity_change_24h?.toFixed(2) || 'N/A'}%`;
  };
  const offChainVolume = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `$${data?.off_chain_volume?.toFixed(2) || 'N/A'}`;
  };
  const volume7d = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `$${data?.volume_7d?.toFixed(2) || 'N/A'}`;
  };
  const volumeChange24h = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.volume_change_24h?.toFixed(2) || 'N/A'}%`;
  };
  const isListed = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return data?.is_listed ? 'Yes' : 'No';
  };
  const priceChange24h = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.price_change_24h?.toFixed(2) || 'N/A'}%`;
  };
  const priceChange1h = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.price_change_1h?.toFixed(2) || 'N/A'}%`;
  };
  const priceChange7d = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.price_change_7d?.toFixed(2) || 'N/A'}%`;
  };
  const priceChange1m = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.price_change_1m?.toFixed(2) || 'N/A'}%`;
  };
  const priceChange1y = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `${data?.price_change_1y?.toFixed(2) || 'N/A'}%`;
  };
  const ath = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `$${data?.ath?.toFixed(2) || 'N/A'}`;
  };
  const atl = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return `$${data?.atl?.toFixed(2) || 'N/A'}`;
  };
  const rank = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return data?.rank || 'N/A';
  };
  const totalSupply = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return data?.total_supply || 'N/A';
  };
  const circulatingSupply = async (token) => {
    const normalizedToken = getTokenName(token);
    const data = await getMarketData(normalizedToken);
    return data?.circulating_supply || 'N/A';
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

  const handleCloseErrorSnackbar = () => {
    setErrorSnackbar({ open: false, message: '' });
  };

  return (
    <ChatInterfaceUI
      disclaimerAccepted={disclaimerAccepted}
      renderDisclaimerDialog={renderDisclaimerDialog}
      showAnnouncement={showAnnouncement}
      styles={styles}
      messages={messages}
      messageListRef={messageListRef}
      input={input}
      isLoading={isLoading}
      error={error}
      errorSnackbar={errorSnackbar}
      handleCloseAnnouncement={handleCloseAnnouncement}
      handleSubmit={handleSubmit}
      setInput={setInput}
      handleCloseErrorSnackbar={handleCloseErrorSnackbar}
      renderMessage={renderMessage}
    />
  );
}

export default ChatInterface;