// src/lib/stock-api.ts

import { getAllSimulatedStocks } from "@/lib/market-data-api"; // Import from market-data-api

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
      const allStocks = getAllSimulatedStocks(); // Get the latest simulated stocks
      const foundStock = allStocks.find(s => s.symbol === upperSymbol);

      if (foundStock) {
        resolve({
          symbol: upperSymbol,
          price: foundStock.price, // Use the price from the unified source
          timestamp: Date.now(),
        });
      } else {
        resolve(null); // Stock not found
      }
    }, 500 + Math.random() * 500); // Simulate network delay
  });
};