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
  const [walletAddresses, setWalletAddresses] = useState(['0x7e3bbf75aba09833f899bb1fdd917fc3a5617555']);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [showPopup, setShowPopup] = useState(false);
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
  useEffect(() => {
    fetchHistoricPortfolioData();
    fetchWalletPortfolio();
  }, [walletAddresses]);
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

  const [isWalletDataLoading, setIsWalletDataLoading] = useState(false);

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
  const fetchPriceHistory = async (coinname = selectedCoin, from = null, to = null) => {
    try {
      const normalizedCoinName = getTokenName(coinname);
      if (!normalizedCoinName) {
        console.error('Attempted to fetch price history with undefined coinname');
        setErrorSnackbar({
          open: true,
          message: 'Cannot fetch price history: Coin name is undefined'
        });
        return;
      }

      to = to || Date.now();
      from = from || to - 365 * 24 * 60 * 60 * 1000; // Default to 1 year if not provided

      console.log(`Fetching price history for ${normalizedCoinName} from ${new Date(from)} to ${new Date(to)}...`);

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

      if (response.data && response.data.data && response.data.data.price_history) {
        setPriceHistoryData(prevData => ({ 
          ...prevData, 
          [normalizedCoinName]: response.data.data.price_history
        }));
        console.log(`Price history for ${normalizedCoinName} updated successfully.`);
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

  const fetchWalletPortfolio = async (addresses = walletAddresses) => {
    if (!addresses || addresses.length === 0) {
      console.error('Attempted to fetch wallet portfolio with no addresses');
      setErrorSnackbar({
        open: true,
        message: 'Cannot fetch wallet portfolio: No wallet addresses provided'
      });
      return null;
    }

    setIsWalletPortfolioLoading(true);
    try {
      console.log(`Fetching wallet portfolio for addresses: ${addresses.join(', ')}`);
      const response = await axios.get(`https://api.mobula.io/api/1/wallet/multi-portfolio`, {
        params: {
          wallets: addresses.join(',')
        },
        headers: {
          Authorization: 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      
      if (response.data && response.data.data && response.data.data[0]) {
        console.log('Wallet portfolio fetched successfully');
        const portfolioData = response.data.data[0];
        
        // Update all related states
        setTotalWalletBalance(portfolioData.total_wallet_balance);
        setWalletAddresses(portfolioData.wallets);
        setTotalRealizedPNL(portfolioData.total_realized_pnl);
        setTotalUnrealizedPNL(portfolioData.total_unrealized_pnl);
        setAssets(portfolioData.assets);
        setTotalPNLHistory(portfolioData.total_pnl_history);
        
        return response.data;
      } else {
        throw new Error('Invalid wallet portfolio data structure');
      }
    } catch (error) {
      console.error('Error fetching wallet portfolio:', error);
      console.error('Error details:', error.response?.data || error.message);
      setErrorSnackbar({ 
        open: true, 
        message: `Failed to fetch wallet portfolio: ${error.message}`
      });
      return null;
    } finally {
      setIsWalletPortfolioLoading(false);
    }
  };

  // Function to get data based on the key
  const getData = (key) => {
    return data[key];
  };

  const callOpenAIAPI = async (userInput) => {
    try {
      const portfolioData = {
        balance: portfolioBalance,
        realizedPNL: portfolioRealizedPNL,
        unrealizedPNL: portfolioUnrealizedPNL,
        assetsList: portfolioAssetsList,
        pnlTimelines: portfolioPNLTimelines
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system",
            content: `You are Xade AI's data fetcher. Your only role is to identify and fetch the relevant data based on the user's question. Do not perform any analysis or calculations.

Available functions:
- Market Data: price(), volume(), marketCap(), marketCapDiluted(), liquidity(), liquidityChange24h(), offChainVolume(), volume7d(), volumeChange24h(), isListed(), priceChange24h(), priceChange1h(), priceChange7d(), priceChange1m(), priceChange1y(), ath(), atl(), rank(), totalSupply(), circulatingSupply()
- Social/Info: website(), twitter(), telegram(), discord(), description(), getNews()
- Historical: priceHistoryData()
- Portfolio: portfolioData.balance, portfolioData.realizedPNL, portfolioData.unrealizedPNL, portfolioData.assetsList, portfolioData.pnlTimelines

Instructions:
1. Return only the raw data needed to answer the user's question
2. Do not perform any calculations or analysis
3. Format your response as JavaScript code that calls the necessary functions
4. Always return the fetched data as a structured object

Example format:
\`\`\`javascript
const data = {
  price: price("bitcoin"),
  volume: volume("bitcoin")
};
return data;
\`\`\`
`
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
          const maxExecutionTime = 5000; // 5 seconds

          const executionPromise = new Promise(async (resolve) => {
            result = await executeCode(codeMatch[1]);
            resolve();
          });

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Execution timed out')), maxExecutionTime);
          });

          await Promise.race([executionPromise, timeoutPromise]);

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
      // Create portfolioData object from existing state variables
      const portfolioData = {
        balance: portfolioBalance,
        realizedPNL: portfolioRealizedPNL,
        unrealizedPNL: portfolioUnrealizedPNL,
        assetsList: portfolioAssetsList,
        pnlTimelines: portfolioPNLTimelines
      };

      const wrappedCode = code.includes('function') ? code : `async function executeAICode() {\n${code}\n}\nexecuteAICode();`;
      
      const func = new Function(
        'data', 'selectedCoin', 'setSelectedCoin', 'getMarketData', 'getMetadata',
        'price', 'volume', 'marketCap', 'marketCapDiluted', 'liquidity', 'liquidityChange24h',
        'offChainVolume', 'volume7d', 'volumeChange24h', 'isListed', 'priceChange24h',
        'priceChange1h', 'priceChange7d', 'priceChange1m', 'priceChange1y', 'ath', 'atl',
        'rank', 'totalSupply', 'circulatingSupply', 'website', 'twitter', 'telegram',
        'discord', 'description', 'portfolioData', 'renderCryptoPanicNews',
        'historicPortfolioData', 'getNews',
        `
          const { priceHistoryData, cryptoPanicNews, historicPortfolioData: historicData, walletPortfolio } = data;
          
          const isLoaded = (value) => value !== 'N/A' && value !== undefined && value !== null;

          const wrappedFunctions = {
            price: async (token) => {
              const result = await price(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            volume: async (token) => {
              const result = await volume(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            marketCap: async (token) => {
              const result = await marketCap(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            marketCapDiluted: async (token) => {
              const result = await marketCapDiluted(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            liquidity: async (token) => {
              const result = await liquidity(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            liquidityChange24h: async (token) => {
              const result = await liquidityChange24h(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            offChainVolume: async (token) => {
              const result = await offChainVolume(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            volume7d: async (token) => {
              const result = await volume7d(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            volumeChange24h: async (token) => {
              const result = await volumeChange24h(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            isListed: async (token) => {
              const result = await isListed(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            priceChange24h: async (token) => {
              const result = await priceChange24h(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            priceChange1h: async (token) => {
              const result = await priceChange1h(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            priceChange7d: async (token) => {
              const result = await priceChange7d(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            priceChange1m: async (token) => {
              const result = await priceChange1m(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            priceChange1y: async (token) => {
              const result = await priceChange1y(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            ath: async (token) => {
              const result = await ath(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            atl: async (token) => {
              const result = await atl(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            rank: async (token) => {
              const result = await rank(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            totalSupply: async (token) => {
              const result = await totalSupply(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            circulatingSupply: async (token) => {
              const result = await circulatingSupply(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            website: async (token) => {
              const result = await website(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            twitter: async (token) => {
              const result = await twitter(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            telegram: async (token) => {
              const result = await telegram(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            discord: async (token) => {
              const result = await discord(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            description: async (token) => {
              const result = await description(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            },
            priceHistoryData: async (token) => priceHistoryData?.[token] || 'please resend the prompt',
            renderCryptoPanicNews: async (token) => renderCryptoPanicNews(token) || 'please resend the prompt',
            getNews: async (token) => {
              const result = await getNews(token);
              return isLoaded(result) ? result : 'please resend the prompt';
            }
          };

          const finalCode = \`${wrappedCode}\`.replace(
            /(price|volume|marketCap|marketCapDiluted|liquidity|liquidityChange24h|offChainVolume|volume7d|volumeChange24h|isListed|priceChange24h|priceChange1h|priceChange7d|priceChange1m|priceChange1y|ath|atl|rank|totalSupply|circulatingSupply|website|twitter|telegram|discord|description|priceHistoryData|renderCryptoPanicNews|getNews)\\(/g,
            'await wrappedFunctions.$1('
          );

          return eval(finalCode);
        `
      );
      
      const result = await func(
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
      
      if (typeof result === 'string') {
        return result.replace(/^"|"$/g, '');
      }
      
      return JSON.stringify(result, null, 2);
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

  const handleWalletAddressClick = () => {
    setShowPopup(true);
    setNewWalletAddress('');
  };

  const handleRemoveWalletAddress = async (index) => {
    const updatedAddresses = walletAddresses.filter((_, i) => i !== index);
    await updateWalletAddresses(updatedAddresses);
  };

  const handleAddWalletAddress = async () => {
    if (newWalletAddress) {
      const isEthereumAddress = /^0x[a-fA-F0-9]{40}$/.test(newWalletAddress);
      const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(newWalletAddress);
      
      if (!isEthereumAddress && !isSolanaAddress) {
        setErrorSnackbar({ open: true, message: 'Invalid wallet address. Please enter a valid Ethereum or Solana address.' });
        return;
      }

      const updatedAddresses = [...walletAddresses, newWalletAddress];
      await updateWalletAddresses(updatedAddresses);
      setNewWalletAddress('');
    }
  };

  const updateWalletAddresses = async (updatedAddresses) => {
    setIsWalletDataLoading(true);

    try {
      setWalletAddresses(updatedAddresses);
      console.log('Updated wallet addresses:', updatedAddresses);

      const [historicData, walletData] = await Promise.all([
        fetchHistoricPortfolioData(null, null, updatedAddresses),
        fetchWalletPortfolio(updatedAddresses)
      ]);

      // Wait for a short delay to ensure data is properly set
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log the fetched data for debugging
      console.log('Fetched historic data:', historicData);
      console.log('Fetched wallet data:', walletData);

      // Check if data is loaded
      if (!historicData || !walletData) {
        throw new Error('Failed to load wallet data: One or both data fetches returned null or undefined');
      }

      // Update the data state
      setData(prevData => ({
        ...prevData,
        historicPortfolioData: historicData,
        walletPortfolio: walletData
      }));

      setErrorSnackbar({ open: true, message: 'Wallet data updated successfully' });
    } catch (error) {
      console.error('Error updating wallet data:', error);
      setErrorSnackbar({ open: true, message: `Failed to update wallet data: ${error.message}` });
      // Revert wallet addresses if there was an error
      setWalletAddresses(prevAddresses => prevAddresses);
    } finally {
      setIsWalletDataLoading(false);
    }
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

  // Modify these functions to return Promises
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

  return (
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}>
          <div style={styles.walletAddress} onClick={handleWalletAddressClick}>
            {walletAddresses.length > 0
              ? `${walletAddresses[0].slice(0, 6)}...${walletAddresses[0].slice(-4)}`
              : 'Add Wallet'}
            {walletAddresses.length > 1 && ` (+${walletAddresses.length - 1})`}
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
          {walletAddresses.map((address, index) => (
            <div key={index} style={styles.walletAddressItem}>
              <input
                type="text"
                value={address}
                readOnly
                style={styles.popupInput}
              />
              <DeleteIcon
                onClick={() => handleRemoveWalletAddress(index)}
                style={styles.deleteIcon}
              />
            </div>
          ))}
          <div style={styles.walletAddressItem}>
            <input
              type="text"
              value={newWalletAddress}
              onChange={(e) => setNewWalletAddress(e.target.value)}
              placeholder="Enter new wallet address"
              style={styles.popupInput}
            />
            <AddIcon
              onClick={handleAddWalletAddress}
              style={styles.addIcon}
            />
          </div>
          <button 
            onClick={() => setShowPopup(false)} 
            style={styles.popupButton}
            disabled={isWalletDataLoading}
          >
            Close
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