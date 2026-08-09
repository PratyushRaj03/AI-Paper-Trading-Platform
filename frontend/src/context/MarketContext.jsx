import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { subscribeMarketStream, initWebSocket } from '../services/websocket';
import { useAuth } from './AuthContext';

const MarketContext = createContext(null);

export const MarketProvider = ({ children }) => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loadingStocks, setLoadingStocks] = useState(true);

  // Fetch initial stock list & portfolio
  useEffect(() => {
    fetchStocks();
    if (user) {
      fetchPortfolioData();
    }
  }, [user]);

  // Subscribe to live WebSocket quotes
  useEffect(() => {
    initWebSocket();
    const unsubscribe = subscribeMarketStream((msg) => {
      if (msg.type === 'INITIAL_QUOTES' || msg.type === 'PRICE_TICK') {
        setStocks(msg.data);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchStocks = async (query = '') => {
    try {
      const response = await api.get(`/market/stocks?query=${query}`);
      if (response.data.success) {
        setStocks(response.data.stocks);
      }
    } catch (err) {
      console.error('Error fetching stock list:', err);
    } finally {
      setLoadingStocks(false);
    }
  };

  const fetchPortfolioData = async () => {
    try {
      const [portRes, holdRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/portfolio/holdings')
      ]);

      if (portRes.data.success) setPortfolio(portRes.data.portfolio);
      if (holdRes.data.success) setHoldings(holdRes.data.holdings);
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
    }
  };

  return (
    <MarketContext.Provider
      value={{
        stocks,
        portfolio,
        holdings,
        loadingStocks,
        fetchStocks,
        fetchPortfolioData
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
