import React, { useState, useRef, useEffect } from 'react';
import { TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function Terminal() {
  const [history, setHistory] = useState([]);
  const terminalRef = useRef(null);

  useEffect(() => {
    // Add a cleanup flag to prevent double execution
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        const response = await fetch('https://lunarcrush.com/api4/public/category/cryptocurrencies/topics/v1', {
          headers: {
            'Authorization': 'Bearer deb9mcyuk3wikmvo8lhlv1jsxnm6mfdf70lw4jqdk'
          }
        });
        const data = await response.json();
        
        // Only proceed if still subscribed
        if (!isSubscribed) return;

        let newMessages = [];
        
        if (data.data && data.data.length > 0) {
          // First filter to top 1000 tokens by current rank
          const top1000Tokens = data.data
            .sort((a, b) => a.topic_rank - b.topic_rank)
            .slice(0, 100);

          // Calculate rank improvements and sort
          const tokensWithImprovement = top1000Tokens
            .map(token => ({
              ...token,
              rank_improvement:  token.topic_rank - token.topic_rank_1h_previous
            }))
            .sort((a, b) => b.rank_improvement - a.rank_improvement)
            .slice(0, 1);
          
          // Create analysis message with technical analysis
          const analysisMessage = await Promise.all(tokensWithImprovement.map(async token => {
            const technicalAnalysis = await getTechnicalAnalysis(token.title);
            const tokenDescription = await description(token.title);
            const tokenSymbol = await token.symbol;
            
            // Generate tweet using OpenAI
            const tweetResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                  {
                    role: "system",
                    content: "You are a cryptocurrency analyst who creates engaging, informative tweets about crypto tokens. Your tweets are confident, include relevant metrics, and use common crypto Twitter language. Always include @XadeFinance mention in your tweets. Don't use hashtags."
                  },
                  {
                    role: "user",
                    content: `Create a tweet about (${token.title}) and with these metrics:\nRank:\nSocial Dominance: ${token.social_dominance.toFixed(2)}%\nTechnical Analysis: ${technicalAnalysis.trend.recommendation}\nSignals: ${technicalAnalysis.trend.signals} description: ${tokenDescription.description}`
                  }
                ]
              })
            });
            
            const tweetData = await tweetResponse.json();
            const aiTweet = tweetData.choices[0].message.content;

            return `\n${aiTweet}\n`;
          }));
          
          // Display the analysis in terminal
          newMessages.push({ 
            type: 'output', 
            content: `\n${analysisMessage.join('\n')}`
          });
        }

        // Add Perplexity API call for crypto news
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-small-128k-online",
            messages: [{
              role: 'user',
              content: 'latest crypto news past 1 hour no price action news'
            }]
          })
        });

        const newsData = await perplexityResponse.json();
        
        // Display the news analysis in terminal
        if (newsData.choices && newsData.choices[0]) {
          newMessages.push({ 
            type: 'output', 
            content: `\n=== Latest Crypto News Update ===\n${newsData.choices[0].message.content}`
          });
        }

        // Only update history if still subscribed
        if (isSubscribed) {
          setHistory(prev => [...prev, ...newMessages]);
        }

      } catch (error) {
        if (isSubscribed) {
          setHistory(prev => [...prev, { 
            type: 'output', 
            content: `Error fetching analysis: ${error.message}`
          }]);
        }
      }
    };

    // Initial fetch
    fetchData();
    
    // Set up hourly interval
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    
    // Cleanup function
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []); // Empty dependency array

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (command) => {

    setHistory(prev => [...prev, { type: 'input', content: command }]);

    setHistory(prev => [...prev, { 
      type: 'output', 
      content: `Executed command: ${command}` 
    }]);
  };

  const getTechnicalAnalysis = async (token) => {
    try {
      const data = await getPriceHistory(token, '1d');
      
      if (!data || data.length < 14) return 'Insufficient data for analysis';

      const prices = data.map(point => point.price);
      const sma14 = calculateSMA(prices, 14);
      const sma50 = calculateSMA(prices, 50);  // Added 50-day SMA
      const rsi14 = calculateRSI(prices, 14);
      const macd = calculateMACD(prices);
      
      return {
        sma14: sma14.toFixed(2),
        sma50: sma50.toFixed(2),
        rsi14: rsi14.toFixed(2),
        macd: {
          macdLine: macd.macdLine.toFixed(2),
          signalLine: macd.signalLine.toFixed(2),
          histogram: macd.histogram.toFixed(2)
        },
        trend: determineTrend(prices[prices.length - 1], sma14, sma50, rsi14, macd)
      };
    } catch (error) {
      console.error(`Error getting technical analysis for ${token}:`, error);
      throw error;
    }
  };

  const determineTrend = (currentPrice, sma14, sma50, rsi, macd) => {
    let signals = [];
    let strength = 0;
    
    // RSI Analysis
    if (rsi > 70) {
      signals.push('Strongly Overbought');
      strength -= 2;
    } else if (rsi > 60) {
      signals.push('Mildly Overbought');
      strength -= 1;
    } else if (rsi < 30) {
      signals.push('Strongly Oversold');
      strength += 2;
    } else if (rsi < 40) {
      signals.push('Mildly Oversold');
      strength += 1;
    }
    
    // Moving Average Analysis
    if (currentPrice > sma14 && sma14 > sma50) {
      signals.push('Strong Uptrend');
      strength += 2;
    } else if (currentPrice < sma14 && sma14 < sma50) {
      signals.push('Strong Downtrend');
      strength -= 2;
    } else if (currentPrice > sma14) {
      signals.push('Short-term Bullish');
      strength += 1;
    } else if (currentPrice < sma14) {
      signals.push('Short-term Bearish');
      strength -= 1;
    }
    
    // MACD Analysis
    if (macd.macdLine > macd.signalLine && macd.histogram > 0) {
      signals.push('Bullish MACD Crossover');
      strength += 1;
    } else if (macd.macdLine < macd.signalLine && macd.histogram < 0) {
      signals.push('Bearish MACD Crossover');
      strength -= 1;
    }
    
    // Overall Trend Classification
    let trendStrength;
    if (strength >= 3) trendStrength = 'Strong Buy';
    else if (strength >= 1) trendStrength = 'Buy';
    else if (strength <= -3) trendStrength = 'Strong Sell';
    else if (strength <= -1) trendStrength = 'Sell';
    else trendStrength = 'Neutral';
    
    return {
      signals: signals.join(', '),
      recommendation: trendStrength
    };
  };

  const getPriceHistory = async (token, period) => {
    try {
      const now = Date.now();
      let from;
      
      switch(period) {
        case '1d':
          from = now - (24 * 60 * 60 * 1000);
          break;
        default:
          from = now - (24 * 60 * 60 * 1000);
      }

      const response = await fetch(`https://api.mobula.io/api/1/market/history?asset=${token}&from=${from}&to=${now}`, {
        headers: {
          'Authorization': 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
        }
      });
      const data = await response.json();
      return data.data.price_history.map(([timestamp, price]) => ({ timestamp, price }));
    } catch (error) {
      console.error(`Error fetching price history: ${error}`);
      throw error;
    }
  };

  const calculateSMA = (prices, period) => {
    if (prices.length < period) return null;
    
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma[sma.length - 1];
  };

  const calculateRSI = (prices, period) => {
    if (prices.length < period + 1) return null;
    
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? -change : 0);
    
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < changes.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    }
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateMACD = (prices) => {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12 - ema26;
    const signalLine = calculateEMA([...Array(prices.length - 26).fill(0), macdLine], 9);
    const histogram = macdLine - signalLine;
    
    return { macdLine, signalLine, histogram };
  };

  const calculateEMA = (prices, period) => {
    if (prices.length < period) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  };


  const description = async (token) => {
    try {
      // Normalize token name to handle case sensitivity
      const normalizedToken = token.toLowerCase().trim();
      
      // Add getMetadata implementation
      const getMetadata = async (token) => {
        const response = await fetch(`https://api.mobula.io/api/1/metadata?asset=${token}`, {
          headers: {
            'Authorization': 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
          }
        });
        const data = await response.json();
        return data.data;
      };

      const metadata = await getMetadata(normalizedToken);
      
      if (!metadata?.description) {
        return 'No description available';
      }
      
      // Get technical analysis for additional context
      const technicalAnalysis = await getTechnicalAnalysis(normalizedToken);
      
      return {
        description: metadata.description,
        symbol: metadata.symbol,
        technicalSummary: {
          trend: technicalAnalysis.trend.recommendation,
          signals: technicalAnalysis.trend.signals
        },
        website: metadata.website || 'N/A',
        twitter: metadata.twitter || 'N/A',
        github: metadata.github || 'N/A'
      };
    } catch (error) {
      console.error(`Error getting description for ${token}:`, error);
      return 'Error fetching token description';
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#000',
      color: '#fff',
    }}>
      {/* Terminal Top Bar */}
      <div style={{
        backgroundColor: '#333',
        padding: '8px 16px',
        borderBottom: '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'  // Increased gap for better spacing
      }}>
        {/* Terminal Controls */}
      
        <div style={{ 
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          AlphaChad Terminal
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '14px',
          backgroundColor: '#000',
        }}
      >
        {history.map((entry, index) => (
          <div 
            key={index}
            style={{
              color: entry.type === 'input' ? '#64ff64' : '#fff',
              marginBottom: '8px',
            }}
          >
            {entry.type === 'input' ? '> ' : ''}
            {entry.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Terminal;
