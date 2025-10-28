// src/hooks/use-market-data.ts

import { useState, useEffect, useCallback } from "react";
import { fetchIndicesData, fetchTopStocks } from "@/lib/market-data-api";
import { showError } from "@/utils/toast";

interface IndexData {
  name: string;
  value: number;
  change: number;
  change_percent: number;
  history: { timestamp: number; value: number }[];
}

interface TopStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

interface UseMarketDataResult {
  indices: IndexData[];
  topStocks: TopStock[];
  isLoading: boolean;
  error: string | null;
  fetchMarketData: () => Promise<void>;
}

export const useMarketData = (): UseMarketDataResult => {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [topStocks, setTopStocks] = useState<TopStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [indicesData, topStocksData] = await Promise.all([
        fetchIndicesData(),
        fetchTopStocks(),
      ]);
      setIndices(indicesData);
      setTopStocks(topStocksData);
    } catch (err: any) {
      console.error("Error fetching market data:", err.message);
      setError("Failed to load market data.");
      showError("Failed to load market data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 300000); // Refresh every 5 minutes (300000 ms)
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  return { indices, topStocks, isLoading, error, fetchMarketData };
};