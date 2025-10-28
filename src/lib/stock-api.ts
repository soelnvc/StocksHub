// src/lib/stock-api.ts

// This is a simulated stock API. In a real application, you would integrate with a third-party API
// like Alpha Vantage, Finnhub, or IEX Cloud to get real-time stock data.

interface StockPrice {
  symbol: string;
  price: number;
  timestamp: number;
}

const stockPrices: { [key: string]: number } = {
  AAPL: 170.25,
  GOOGL: 1800.50,
  MSFT: 420.10,
  AMZN: 185.70,
  TSLA: 200.00,
  NVDA: 1200.00,
  // Add more simulated stocks as needed
};

/**
 * Simulates fetching the current price for a given stock symbol.
 * Returns a slightly randomized price based on a base value.
 * @param symbol The stock symbol (e.g., 'AAPL').
 * @returns A Promise that resolves with the StockPrice or null if not found.
 */
export const fetchStockPrice = async (symbol: string): Promise<StockPrice | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const upperSymbol = symbol.toUpperCase();
      if (stockPrices[upperSymbol]) {
        // Simulate some price fluctuation
        const basePrice = stockPrices[upperSymbol];
        const fluctuation = (Math.random() - 0.5) * 0.02; // +/- 1% fluctuation
        const currentPrice = basePrice * (1 + fluctuation);
        resolve({
          symbol: upperSymbol,
          price: parseFloat(currentPrice.toFixed(2)),
          timestamp: Date.now(),
        });
      } else {
        resolve(null); // Stock not found
      }
    }, 500 + Math.random() * 500); // Simulate network delay
  });
};