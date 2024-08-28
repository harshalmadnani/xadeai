import React, { useState, useEffect } from 'react';
import Anthropic from "@anthropic-ai/sdk";

function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState(null);
  const [error, setError] = useState(null);
  const [anthropic, setAnthropic] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);
  const [codeExecutionResult, setCodeExecutionResult] = useState(null);

  useEffect(() => {
    const initializeAnthropicClient = () => {
      const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY || window.env?.REACT_APP_ANTHROPIC_API_KEY;
      console.log('API Key:', apiKey ? 'Set' : 'Not set'); // Don't log the actual key
      if (apiKey) {
        setAnthropic(new Anthropic({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true
        }));
      } else {
        setError('API key is not set. Please check your environment variables.');
      }
    };

    initializeAnthropicClient();

    // Function to fetch Bitcoin price history
    const fetchBitcoinPriceHistory = async () => {
      try {
        const response = await fetch('https://api.mobula.io/api/1/market/history?asset=bitcoin', {
          method: 'GET',
          headers: {
            'Authorization': 'e26c7e73-d918-44d9-9de3-7cbe55b63b99'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.data && data.data.price_history) {
          console.log('Bitcoin price history:', data.data.price_history);
          setPriceHistory(data.data.price_history);
        } else {
          throw new Error('Price history not found in the response');
        }
      } catch (error) {
        console.error('Error fetching Bitcoin price history:', error);
        setError('Failed to fetch Bitcoin price history');
      }
    };

    fetchBitcoinPriceHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !anthropic) return;

    setIsLoading(true);
    setError(null);
    setCodeExecutionResult(null);
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);

    try {
      console.log('Sending request to Claude...');
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        temperature: 0,
        system: `You are a JavaScript coding assistant. The priceHistory variable contains Bitcoin's price history since inception in the format:
[
  [1367193600000, 141.96],
  [1367280000000, 135.3],
  ...
]
Where the first element of each subarray is the timestamp in milliseconds, and the second is the price.

Instructions:
1. When asked for code related to Bitcoin price, use the priceHistory data.
2. For non-price-related queries, create a JavaScript function that returns your response as a string.
3. Provide only the code, without any explanation or additional text.
4. Do not generate random prices or any other data; use priceHistory for actual data or omit price-related information if unavailable.
5. Ensure your code is valid JavaScript and can be executed directly.`,
        messages: [...messages, userMessage],
      });

      console.log('Raw response from Claude:', response);
      setRawResponse(response);

      const assistantMessage = response.content[0].text.trim();

      // Execute the function if it's a valid JavaScript function
      if (assistantMessage.startsWith('function') && assistantMessage.includes('return')) {
        try {
          const executeCode = new Function('priceHistory', 'return ' + assistantMessage);
          const result = executeCode(priceHistory);
          setCodeExecutionResult(result);
          setMessages([...messages, userMessage, { role: 'assistant', content: result }]);
        } catch (execError) {
          console.error('Error executing code:', execError);
          setError(`Error executing code: ${execError.message}`);
          setCodeExecutionResult(`Failed to execute: ${assistantMessage}`);
          setMessages([...messages, userMessage, { role: 'assistant', content: `Error: ${execError.message}` }]);
        }
      } else {
        // If it's not a function, wrap it in a function that returns the code as a string
        try {
          const executeCode = new Function('priceHistory', `
            ${assistantMessage}
            return JSON.stringify({ result: currentPrice });
          `);
          const result = executeCode(priceHistory);
          const parsedResult = JSON.parse(result);
          setCodeExecutionResult(parsedResult.result);
          setMessages([...messages, userMessage, { role: 'assistant', content: `Current BTC price: $${parsedResult.result}` }]);
        } catch (execError) {
          console.error('Error executing code:', execError);
          setError(`Error executing code: ${execError.message}`);
          setCodeExecutionResult(`Failed to execute: ${assistantMessage}`);
          setMessages([...messages, userMessage, { role: 'assistant', content: `Error: ${execError.message}` }]);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }

    setIsLoading(false);
    setInput('');
  };

  return (
    <div className="chat-interface">
      <div className="message-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      {/* {rawResponse && (
        <div className="raw-response">
          <h3>Raw Response from Claude:</h3>
          <pre>{JSON.stringify(rawResponse, null, 2)}</pre>
        </div>
      )} */}
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {isLoading && <div className="loading">Loading...</div>}

      {codeExecutionResult !== null && (
        <div className="code-execution-result-container">
          <div className="code-execution-result">
            <h3>Result:</h3>
            <pre>{JSON.stringify(codeExecutionResult, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatInterface;