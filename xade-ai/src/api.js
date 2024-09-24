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