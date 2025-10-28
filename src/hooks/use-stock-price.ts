// src/hooks/use-stock-price.ts

import { useState, useEffect, useCallback } from "react";
import { fetchStockPrice } from "@/lib/stock-api";
import { showError } from "@/utils/toast";

interface StockData {
  symbol: string;
  price: number;
  timestamp: number;
}

interface UseStockPriceResult {
  stockData: StockData | null;
  isLoading: boolean;
  error: string | null;
  fetchPrice: (symbol: string) => void;
}

export const useStockPrice = (): UseStockPriceResult => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSymbol, setCurrentSymbol] = useState<string | null>(null);

  const fetchPrice = useCallback(async (symbol: string) => {
    if (!symbol) {
      setStockData(null);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setCurrentSymbol(symbol);

    try {
      const data = await fetchStockPrice(symbol);
      if (data) {
        setStockData(data);
      } else {
        setStockData(null);
        setError(`Stock symbol '${symbol.toUpperCase()}' not found.`);
        showError(`Stock symbol '${symbol.toUpperCase()}' not found.`);
      }
    } catch (err) {
      console.error("Error fetching stock price:", err);
      setError("Failed to fetch stock price. Please try again.");
      showError("Failed to fetch stock price. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optional: Refetch price periodically if the symbol is set
  useEffect(() => {
    if (currentSymbol) {
      const interval = setInterval(() => {
        fetchPrice(currentSymbol);
      }, 15000); // Refetch every 15 seconds

      return () => clearInterval(interval);
    }
  }, [currentSymbol, fetchPrice]);

  return { stockData, isLoading, error, fetchPrice };
};