// src/lib/market-data-api.ts

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

const initialIndexValues: { [key: string]: number } = {
  NIFTY50: 22500.00,
  SENSEX: 74000.00,
};

const initialTopStocks: TopStock[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2900.00, change: 0, change_percent: 0 },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3800.00, change: 0, change_percent: 0 },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1500.00, change: 0, change_percent: 0 },
  { symbol: "ICICIBANK", name: "ICICI Bank", price: 1100.00, change: 0, change_percent: 0 },
  { symbol: "INFY", name: "Infosys", price: 1600.00, change: 0, change_percent: 0 },
];

// Simulate price fluctuations
const simulateFluctuation = (basePrice: number) => {
  const fluctuation = (Math.random() - 0.5) * 0.005; // +/- 0.25% fluctuation
  return basePrice * (1 + fluctuation);
};

// Store current simulated state
let currentNiftyValue = initialIndexValues.NIFTY50;
let currentSensexValue = initialIndexValues.SENSEX;
let currentTopStocks = initialTopStocks.map(stock => ({ ...stock }));

// Generate initial history for charts (last 60 minutes)
const generateInitialHistory = (baseValue: number): { timestamp: number; value: number }[] => {
  const history: { timestamp: number; value: number }[] = [];
  const now = Date.now();
  for (let i = 59; i >= 0; i--) {
    const timestamp = now - i * 60 * 1000; // Every minute for the last hour
    const value = baseValue * (1 + (Math.random() - 0.5) * 0.01); // Small initial fluctuation
    history.push({ timestamp, value: parseFloat(value.toFixed(2)) });
  }
  return history;
};

let niftyHistory = generateInitialHistory(currentNiftyValue);
let sensexHistory = generateInitialHistory(currentSensexValue);

/**
 * Simulates fetching real-time data for major indices.
 * @returns A Promise that resolves with an array of IndexData.
 */
export const fetchIndicesData = async (): Promise<IndexData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const oldNiftyValue = currentNiftyValue;
      currentNiftyValue = simulateFluctuation(currentNiftyValue);
      const niftyChange = currentNiftyValue - oldNiftyValue;
      const niftyChangePercent = (niftyChange / oldNiftyValue) * 100;

      const oldSensexValue = currentSensexValue;
      currentSensexValue = simulateFluctuation(currentSensexValue);
      const sensexChange = currentSensexValue - oldSensexValue;
      const sensexChangePercent = (sensexChange / oldSensexValue) * 100;

      const now = Date.now();
      niftyHistory.push({ timestamp: now, value: parseFloat(currentNiftyValue.toFixed(2)) });
      sensexHistory.push({ timestamp: now, value: parseFloat(currentSensexValue.toFixed(2)) });

      // Keep history to last 60 entries (1 hour if updated every minute)
      if (niftyHistory.length > 60) niftyHistory.shift();
      if (sensexHistory.length > 60) sensexHistory.shift();

      resolve([
        {
          name: "NIFTY50",
          value: parseFloat(currentNiftyValue.toFixed(2)),
          change: parseFloat(niftyChange.toFixed(2)),
          change_percent: parseFloat(niftyChangePercent.toFixed(2)),
          history: niftyHistory,
        },
        {
          name: "SENSEX",
          value: parseFloat(currentSensexValue.toFixed(2)),
          change: parseFloat(sensexChange.toFixed(2)),
          change_percent: parseFloat(sensexChangePercent.toFixed(2)),
          history: sensexHistory,
        },
      ]);
    }, 1000 + Math.random() * 500); // Simulate network delay
  });
};

/**
 * Simulates fetching real-time data for top stocks.
 * @returns A Promise that resolves with an array of TopStock.
 */
export const fetchTopStocks = async (): Promise<TopStock[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentTopStocks = currentTopStocks.map(stock => {
        const oldPrice = stock.price;
        const newPrice = simulateFluctuation(stock.price);
        const change = newPrice - oldPrice;
        const change_percent = (change / oldPrice) * 100;
        return {
          ...stock,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          change_percent: parseFloat(change_percent.toFixed(2)),
        };
      });
      // Sort by change_percent for "top" stocks (can be customized)
      currentTopStocks.sort((a, b) => b.change_percent - a.change_percent);
      resolve(currentTopStocks.slice(0, 5)); // Return top 5
    }, 1000 + Math.random() * 500); // Simulate network delay
  });
};