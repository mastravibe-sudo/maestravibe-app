'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Market, MARKET_CONFIG } from './market';   // ← Yeh line important hai

type MarketContextType = {
  market: Market;
  config: typeof MARKET_CONFIG['pk'];
  setMarket: (market: Market) => void;
};

const MarketContext = createContext<MarketContextType | null>(null);

export function MarketProvider({ 
  children, 
  initialMarket = 'pk' 
}: { 
  children: React.ReactNode; 
  initialMarket?: Market;
}) {
  const [market, setMarketState] = useState<Market>(initialMarket);

  const setMarket = (newMarket: Market) => {
    setMarketState(newMarket);
    document.cookie = `mv_market=${newMarket}; path=/; max-age=86400`;
    window.location.reload();
  };

  return (
    <MarketContext.Provider value={{
      market,
      config: MARKET_CONFIG[market],
      setMarket,
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used within MarketProvider');
  return context;
};