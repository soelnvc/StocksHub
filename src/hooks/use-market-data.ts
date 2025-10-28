// src/hooks/use-market-data.ts

import { useState, useEffect, useCallback } from "react";
import { fetchIndicesData, fetchTopStocks, TimeRange } from "@/lib/market-data-api"; // Import TimeRange
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
  timeRange: TimeRange; // Add timeRange to result
  setTimeRange: (range: TimeRange) => void; // Add setTimeRange to result
  fetchMarketData: (range?: TimeRange) => Promise<void>; // Allow optional range
}

export const useMarketData = (): UseMarketDataResult => {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [topStocks, setTopStocks] = useState<TopStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1h'); // New state for time range

  const fetchMarketData = useCallback(async (range: TimeRange = timeRange) => { // Use current timeRange as default
    setIsLoading(true);
    setError(null);
    try {
      const [indicesData, topStocksData] = await Promise.all([
        fetchIndicesData(range), // Pass the selected range
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
  }, [timeRange]); // Re-run if timeRange changes

  useEffect(() => {
    fetchMarketData(timeRange); // Fetch data for the current timeRange on mount and timeRange change
    const interval = setInterval(() => fetchMarketData(timeRange), 300000); // Refresh every 5 minutes (300000 ms)
    return () => clearInterval(interval);
  }, [fetchMarketData, timeRange]); // Add timeRange to dependencies

  return { indices, topStocks, isLoading, error, timeRange, setTimeRange, fetchMarketData };
};