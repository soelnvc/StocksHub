// src/lib/stock-api.ts

import { getOrCreateSimulatedStock } from "@/lib/market-data-api"; // Import the new function

interface StockPrice {
  symbol: string;
  price: number;
  timestamp: number;
}

/**
 * Simulates fetching the current price for a given stock symbol.
 * It now relies on the unified stock data from market-data-api.
 * @param symbol The stock symbol (e.g., 'AAPL').
 * @returns A Promise that resolves with the StockPrice or null if not found.
 */
export const fetchStockPrice = async (symbol: string): Promise<StockPrice | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const upperSymbol = symbol.toUpperCase();
      const foundStock = getOrCreateSimulatedStock(upperSymbol); // Use getOrCreateSimulatedStock

      if (foundStock) {
        resolve({
          symbol: upperSymbol,
          price: foundStock.price,
          timestamp: Date.now(),
        });
      } else {
        // This case should theoretically not be reached with getOrCreateSimulatedStock
        resolve(null);
      }
    }, 500 + Math.random() * 500); // Simulate network delay
  });
};