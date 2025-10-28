// src/lib/market-data-api.ts

interface IndexData {
  name: string;
  value: number;
  change: number;
  change_percent: number;
  history: { timestamp: number; value: number }[];
}

export interface TopStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

export type TimeRange = '1h' | '10h' | '1d' | '1m' | '1y' | '10y';

const initialIndexValues: { [key: string]: number } = {
  NIFTY50: 22500.00,
  SENSEX: 74000.00,
};

// Function to generate a random stock entry
const generateRandomStock = (index: number): TopStock => {
  const commonSymbols = [
    "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA", "FB", "NFLX", "BABA", "JPM",
    "V", "PG", "JNJ", "UNH", "HD", "MA", "PYPL", "ADBE", "CRM", "CMCSA",
    "XOM", "CVX", "KO", "PEP", "WMT", "DIS", "NKE", "PFE", "MRK", "ABBV",
    "LLY", "DHR", "TMO", "AVGO", "QCOM", "TXN", "INTC", "CSCO", "AMAT", "MU",
    "AMD", "GOOG", "META", "BRK.B", "TSM", "ORCL", "SAP", "TM", "SNE", "SONY",
    "HPE", "IBM", "DELL", "HPQ", "LVMH", "CDI", "RMS", "KER", "EL", "LRLCY",
    "Kering", "Hermes", "Richemont", "Swatch", "Burberry", "Moncler", "Prada", "Ferragamo", "Tod's", "Capri",
    "Tapestry", "PVH", "RL", "COTY", "ULTA", "SEPH", "LULU", "ATVI", "EA", "TTWO",
    "UBI", "NTDOY", "SFTBY", "MSI", "PANW", "CRWD", "ZS", "OKTA", "SPLK", "NOW",
    "WDAY", "SNOW", "DDOG", "NET", "ZM", "DOCU", "TEAM", "ADSK", "ANSS", "CDNS",
    "FTNT", "MDB", "NVCR", "SMCI", "VEEV", "ZBRA", "ZSCALER", "ACN", "CDW", "FIS",
    "GPN", "IT", "MAST", "MSCI", "PAYX", "SPGI", "VRTX", "REGN", "GILD", "BIIB",
    "AMGN", "CELG", "BMY", "MRNA", "BNTX", "SGEN", "EXAS", "ILMN", "LH", "PKI",
    "TFX", "WAT", "ZTS", "ALB", "APD", "BLL", "CE", "CF", "DD", "ECL",
    "EMN", "FMC", "IFF", "LIN", "LYB", "MOS", "NEM", "NUE", "PPG", "SHW",
    "SJM", "STZ", "SYF", "DFS", "COF", "BAC", "WFC", "C", "GS", "MS",
    "BLK", "SPG", "PLD", "EQIX", "AMT", "CCI", "PSA", "EXR", "SBAC", "VICI",
    "WYNN", "MGM", "LVS", "MAR", "HLT", "BKNG", "ABNB", "EXPE", "TRIP", "RCL",
    "CCL", "NCLH", "DAL", "UAL", "AAL", "LUV", "BA", "GD", "LMT", "NOC",
    "RTX", "HII", "TDY", "TXT", "GE", "HON", "MMM", "CAT", "DE", "PCAR",
    "CMI", "ETN", "ROK", "PH", "IR", "AOS", "SWK", "STAN", "GWW", "FAST",
    "RSG", "WM", "Waste", "Republic", "Clean", "WasteCon", "WasteMan", "WastePro", "WasteSol", "WasteTech",
    "WasteServ", "WasteX", "WasteY", "WasteZ", "WasteA", "WasteB", "WasteC", "WasteD", "WasteE", "WasteF",
    "WasteG", "WasteH", "WasteI", "WasteJ", "WasteK", "WasteL", "WasteM", "WasteN", "WasteO", "WasteP",
    "WasteQ", "WasteR", "WasteS", "WasteT", "WasteU", "WasteV", "WasteW", "WasteX", "WasteY", "WasteZ",
    "WasteAA", "WasteBB", "WasteCC", "WasteDD", "WasteEE", "WasteFF", "WasteGG", "WasteHH", "WasteII", "WasteJJ",
    "WasteKK", "WasteLL", "WasteMM", "WasteNN", "WasteOO", "WastePP", "WasteQQ", "WasteRR", "WasteSS", "WasteTT",
    "WasteUU", "WasteVV", "WasteWW", "WasteXX", "WasteYY", "WasteZZ"
  ];

  const baseSymbol = commonSymbols[index % commonSymbols.length];
  const uniqueSuffix = Math.floor(index / commonSymbols.length) > 0 ? `-${Math.floor(index / commonSymbols.length)}` : '';
  const symbol = `${baseSymbol}${uniqueSuffix}`;
  const name = `${symbol} Corporation`; // Generic name
  const price = parseFloat((Math.random() * 1000 + 50).toFixed(2)); // Price between 50 and 1050
  return { symbol, name, price, change: 0, change_percent: 0 };
};

const generateInitialTopStocks = (count: number): TopStock[] => {
  const stocks: TopStock[] = [];
  for (let i = 0; i < count; i++) {
    stocks.push(generateRandomStock(i));
  }
  return stocks;
};

// Store current simulated state for indices
let currentNiftyValue = initialIndexValues.NIFTY50;
let currentSensexValue = initialIndexValues.SENSEX;
let currentTopStocks = generateInitialTopStocks(200); // Generate 200 stocks

// Simulate price fluctuations
const simulateFluctuation = (basePrice: number, volatility: number = 0.005) => {
  const fluctuation = (Math.random() - 0.5) * volatility;
  return basePrice * (1 + fluctuation);
};

/**
 * Generates historical data points for a given base value and time range.
 * This is a simplified simulation.
 */
const generateHistoryForRange = (baseValue: number, range: TimeRange): { timestamp: number; value: number }[] => {
  const history: { timestamp: number; value: number }[] = [];
  const now = Date.now();
  let numPoints: number;
  let intervalMs: number; // Interval between points in milliseconds
  let volatility: number; // Higher volatility for longer ranges

  switch (range) {
    case '1h':
      numPoints = 60; // 60 minutes
      intervalMs = 60 * 1000; // 1 minute
      volatility = 0.001; // Small fluctuations
      break;
    case '10h':
      numPoints = 60; // 60 points over 10 hours
      intervalMs = (10 * 60 * 60 * 1000) / numPoints; // ~10 minutes per point
      volatility = 0.002; // Slightly more fluctuations than 1h
      break;
    case '1d':
      numPoints = 24; // 24 hours
      intervalMs = 60 * 60 * 1000; // 1 hour
      volatility = 0.005; // Moderate fluctuations
      break;
    case '1m':
      numPoints = 30; // ~30 days
      intervalMs = 24 * 60 * 60 * 1000; // 1 day
      volatility = 0.01; // Larger fluctuations
      break;
    case '1y':
      numPoints = 12; // 12 months (simplified to 12 points for a year)
      intervalMs = 30 * 24 * 60 * 60 * 1000; // ~1 month
      volatility = 0.02; // Even larger fluctuations
      break;
    case '10y':
      numPoints = 10; // 10 points, one per year
      intervalMs = 365 * 24 * 60 * 60 * 1000; // ~1 year
      volatility = 0.05; // Very large fluctuations for long term
      break;
    default:
      numPoints = 60;
      intervalMs = 60 * 1000;
      volatility = 0.001;
  }

  let currentValue = baseValue;
  for (let i = numPoints - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    currentValue = simulateFluctuation(currentValue, volatility); // Apply fluctuation
    history.push({ timestamp, value: parseFloat(currentValue.toFixed(2)) });
  }
  return history;
};


/**
 * Simulates fetching real-time data for major indices.
 * @param timeRange The desired time range for historical data.
 * @returns A Promise that resolves with an array of IndexData.
 */
export const fetchIndicesData = async (timeRange: TimeRange = '1h'): Promise<IndexData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Update current values for NIFTY50
      const oldNiftyValue = currentNiftyValue;
      currentNiftyValue = simulateFluctuation(currentNiftyValue, 0.001); // Small volatility for current price
      const niftyChange = currentNiftyValue - oldNiftyValue;
      const niftyChangePercent = (niftyChange / oldNiftyValue) * 100;

      // Update current values for SENSEX
      const oldSensexValue = currentSensexValue;
      currentSensexValue = simulateFluctuation(currentSensexValue, 0.001); // Small volatility for current price
      const sensexChange = currentSensexValue - oldSensexValue;
      const sensexChangePercent = (sensexChange / oldSensexValue) * 100;

      // Generate history for the requested time range
      const niftyHistory = generateHistoryForRange(currentNiftyValue, timeRange);
      const sensexHistory = generateHistoryForRange(currentSensexValue, timeRange);

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
        const newPrice = simulateFluctuation(stock.price, 0.005);
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
      resolve(currentTopStocks); // Return all 200 stocks
    }, 1000 + Math.random() * 500); // Simulate network delay
  });
};