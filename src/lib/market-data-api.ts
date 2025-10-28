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
  "WasteQ", "WasteR", "WasteS", "WasteT", "WasteU", "WasteV", "WasteW", "WasteXX", "WasteYY", "WasteZZ"
];

const symbolToNameMap: { [key: string]: string } = {
  "AAPL": "Apple Inc.",
  "GOOGL": "Alphabet Inc. (Class A)",
  "MSFT": "Microsoft Corp.",
  "AMZN": "Amazon.com Inc.",
  "TSLA": "Tesla Inc.",
  "NVDA": "NVIDIA Corp.",
  "FB": "Meta Platforms Inc. (formerly Facebook)",
  "NFLX": "Netflix Inc.",
  "BABA": "Alibaba Group Holding Ltd.",
  "JPM": "JPMorgan Chase & Co.",
  "V": "Visa Inc.",
  "PG": "Procter & Gamble Co.",
  "JNJ": "Johnson & Johnson",
  "UNH": "UnitedHealth Group Inc.",
  "HD": "Home Depot Inc.",
  "MA": "Mastercard Inc.",
  "PYPL": "PayPal Holdings Inc.",
  "ADBE": "Adobe Inc.",
  "CRM": "Salesforce Inc.",
  "CMCSA": "Comcast Corp.",
  "XOM": "Exxon Mobil Corp.",
  "CVX": "Chevron Corp.",
  "KO": "Coca-Cola Co.",
  "PEP": "PepsiCo Inc.",
  "WMT": "Walmart Inc.",
  "DIS": "Walt Disney Co.",
  "NKE": "Nike Inc.",
  "PFE": "Pfizer Inc.",
  "MRK": "Merck & Co. Inc.",
  "ABBV": "AbbVie Inc.",
  "LLY": "Eli Lilly and Co.",
  "DHR": "Danaher Corp.",
  "TMO": "Thermo Fisher Scientific Inc.",
  "AVGO": "Broadcom Inc.",
  "QCOM": "Qualcomm Inc.",
  "TXN": "Texas Instruments Inc.",
  "INTC": "Intel Corp.",
  "CSCO": "Cisco Systems Inc.",
  "AMAT": "Applied Materials Inc.",
  "MU": "Micron Technology Inc.",
  "AMD": "Advanced Micro Devices Inc.",
  "GOOG": "Alphabet Inc. (Class C)",
  "META": "Meta Platforms Inc.",
  "BRK.B": "Berkshire Hathaway Inc. (Class B)",
  "TSM": "Taiwan Semiconductor Manufacturing Co. Ltd.",
  "ORCL": "Oracle Corp.",
  "SAP": "SAP SE",
  "TM": "Toyota Motor Corp.",
  "SNE": "Sony Group Corp.",
  "SONY": "Sony Group Corp.",
  "HPE": "Hewlett Packard Enterprise Co.",
  "IBM": "International Business Machines Corp.",
  "DELL": "Dell Technologies Inc.",
  "HPQ": "HP Inc.",
  "LVMH": "LVMH Moët Hennessy Louis Vuitton SE",
  "CDI": "Chubb Ltd.", // Assuming CDI is a placeholder, using a common company
  "RMS": "Hermès International SCA", // Assuming RMS is a placeholder
  "KER": "Kering SA",
  "EL": "Estée Lauder Companies Inc.",
  "LRLCY": "L'Oréal S.A.",
  "Kering": "Kering SA",
  "Hermes": "Hermès International SCA",
  "Richemont": "Compagnie Financière Richemont SA",
  "Swatch": "Swatch Group AG",
  "Burberry": "Burberry Group plc",
  "Moncler": "Moncler S.p.A.",
  "Prada": "Prada S.p.A.",
  "Ferragamo": "Salvatore Ferragamo S.p.A.",
  "Tod's": "Tod's S.p.A.",
  "Capri": "Capri Holdings Ltd.",
  "Tapestry": "Tapestry Inc.",
  "PVH": "PVH Corp.",
  "RL": "Ralph Lauren Corp.",
  "COTY": "Coty Inc.",
  "ULTA": "Ulta Beauty Inc.",
  "SEPH": "Sephora (placeholder)",
  "LULU": "Lululemon Athletica Inc.",
  "ATVI": "Activision Blizzard Inc.",
  "EA": "Electronic Arts Inc.",
  "TTWO": "Take-Two Interactive Software Inc.",
  "UBI": "Ubisoft Entertainment SA",
  "NTDOY": "Nintendo Co. Ltd.",
  "SFTBY": "SoftBank Group Corp.",
  "MSI": "Motorola Solutions Inc.",
  "PANW": "Palo Alto Networks Inc.",
  "CRWD": "CrowdStrike Holdings Inc.",
  "ZS": "Zscaler Inc.",
  "OKTA": "Okta Inc.",
  "SPLK": "Splunk Inc.",
  "NOW": "ServiceNow Inc.",
  "WDAY": "Workday Inc.",
  "SNOW": "Snowflake Inc.",
  "DDOG": "Datadog Inc.",
  "NET": "Cloudflare Inc.",
  "ZM": "Zoom Video Communications Inc.",
  "DOCU": "DocuSign Inc.",
  "TEAM": "Atlassian Corp. Plc",
  "ADSK": "Autodesk Inc.",
  "ANSS": "Ansys Inc.",
  "CDNS": "Cadence Design Systems Inc.",
  "FTNT": "Fortinet Inc.",
  "MDB": "MongoDB Inc.",
  "NVCR": "NovoCure Ltd.",
  "SMCI": "Super Micro Computer Inc.",
  "VEEV": "Veeva Systems Inc.",
  "ZBRA": "Zebra Technologies Corp.",
  "ZSCALER": "Zscaler Inc.",
  "ACN": "Accenture Plc",
  "CDW": "CDW Corp.",
  "FIS": "Fidelity National Information Services Inc.",
  "GPN": "Global Payments Inc.",
  "IT": "Gartner Inc.",
  "MAST": "Mastercard Inc.",
  "MSCI": "MSCI Inc.",
  "PAYX": "Paychex Inc.",
  "SPGI": "S&P Global Inc.",
  "VRTX": "Vertex Pharmaceuticals Inc.",
  "REGN": "Regeneron Pharmaceuticals Inc.",
  "GILD": "Gilead Sciences Inc.",
  "BIIB": "Biogen Inc.",
  "AMGN": "Amgen Inc.",
  "CELG": "Celgene Corp.", // Celgene is now part of Bristol Myers Squibb
  "BMY": "Bristol Myers Squibb Co.",
  "MRNA": "Moderna Inc.",
  "BNTX": "BioNTech SE",
  "SGEN": "Seagen Inc.",
  "EXAS": "Exact Sciences Corp.",
  "ILMN": "Illumina Inc.",
  "LH": "Laboratory Corp. of America Holdings",
  "PKI": "PerkinElmer Inc.",
  "TFX": "Teleflex Inc.",
  "WAT": "Waters Corp.",
  "ZTS": "Zoetis Inc.",
  "ALB": "Albemarle Corp.",
  "APD": "Air Products and Chemicals Inc.",
  "BLL": "Ball Corp.",
  "CE": "Celanese Corp.",
  "CF": "CF Industries Holdings Inc.",
  "DD": "DuPont de Nemours Inc.",
  "ECL": "Ecolab Inc.",
  "EMN": "Eastman Chemical Co.",
  "FMC": "FMC Corp.",
  "IFF": "International Flavors & Fragrances Inc.",
  "LIN": "Linde Plc",
  "LYB": "LyondellBasell Industries NV",
  "MOS": "Mosaic Co.",
  "NEM": "Newmont Corp.",
  "NUE": "Nucor Corp.",
  "PPG": "PPG Industries Inc.",
  "SHW": "Sherwin-Williams Co.",
  "SJM": "J.M. Smucker Co.",
  "STZ": "Constellation Brands Inc.",
  "SYF": "Synchrony Financial",
  "DFS": "Discover Financial Services",
  "COF": "Capital One Financial Corp.",
  "BAC": "Bank of America Corp.",
  "WFC": "Wells Fargo & Co.",
  "C": "Citigroup Inc.",
  "GS": "Goldman Sachs Group Inc.",
  "MS": "Morgan Stanley",
  "BLK": "BlackRock Inc.",
  "SPG": "Simon Property Group Inc.",
  "PLD": "Prologis Inc.",
  "EQIX": "Equinix Inc.",
  "AMT": "American Tower Corp.",
  "CCI": "Crown Castle Inc.",
  "PSA": "Public Storage",
  "EXR": "Extra Space Storage Inc.",
  "SBAC": "SBA Communications Corp.",
  "VICI": "VICI Properties Inc.",
  "WYNN": "Wynn Resorts Ltd.",
  "MGM": "MGM Resorts International",
  "LVS": "Las Vegas Sands Corp.",
  "MAR": "Marriott International Inc.",
  "HLT": "Hilton Worldwide Holdings Inc.",
  "BKNG": "Booking Holdings Inc.",
  "ABNB": "Airbnb Inc.",
  "EXPE": "Expedia Group Inc.",
  "TRIP": "TripAdvisor Inc.",
  "RCL": "Royal Caribbean Group",
  "CCL": "Carnival Corp.",
  "NCLH": "Norwegian Cruise Line Holdings Ltd.",
  "DAL": "Delta Air Lines Inc.",
  "UAL": "United Airlines Holdings Inc.",
  "AAL": "American Airlines Group Inc.",
  "LUV": "Southwest Airlines Co.",
  "BA": "Boeing Co.",
  "GD": "General Dynamics Corp.",
  "LMT": "Lockheed Martin Corp.",
  "NOC": "Northrop Grumman Corp.",
  "RTX": "RTX Corp.",
  "HII": "Huntington Ingalls Industries Inc.",
  "TDY": "Teledyne Technologies Inc.",
  "TXT": "Textron Inc.",
  "GE": "General Electric Co.",
  "HON": "Honeywell International Inc.",
  "MMM": "3M Co.",
  "CAT": "Caterpillar Inc.",
  "DE": "Deere & Co.",
  "PCAR": "PACCAR Inc.",
  "CMI": "Cummins Inc.",
  "ETN": "Eaton Corp. Plc",
  "ROK": "Rockwell Automation Inc.",
  "PH": "Parker-Hannifin Corp.",
  "IR": "Ingersoll Rand Inc.",
  "AOS": "A. O. Smith Corp.",
  "SWK": "Stanley Black & Decker Inc.",
  "STAN": "Stanley Black & Decker Inc.", // Duplicate, but keeping for variety
  "GWW": "W.W. Grainger Inc.",
  "FAST": "Fastenal Co.",
  "RSG": "Republic Services Inc.",
  "WM": "Waste Management Inc.",
  "Waste": "Waste Management Inc.", // Generic, will map to WM
  "Republic": "Republic Services Inc.", // Generic, will map to RSG
  "Clean": "Clean Harbors Inc.", // Example for generic
  "WasteCon": "Waste Connections Inc.",
  "WasteMan": "Waste Management Inc.",
  "WastePro": "Waste Pro USA Inc.",
  "WasteSol": "Waste Solutions Inc.",
  "WasteTech": "Waste Technologies Inc.",
  "WasteServ": "Waste Services Inc.",
  "WasteX": "WasteX Corp.",
  "WasteY": "WasteY Holdings",
  "WasteZ": "WasteZ Solutions",
  "WasteA": "WasteA Corp.",
  "WasteB": "WasteB Inc.",
  "WasteC": "WasteC Group",
  "WasteD": "WasteD Systems",
  "WasteE": "WasteE Enterprises",
  "WasteF": "WasteF Innovations",
  "WasteG": "WasteG Global",
  "WasteH": "WasteH Industries",
  "WasteI": "WasteI Solutions",
  "WasteJ": "WasteJ Corp.",
  "WasteK": "WasteK Holdings",
  "WasteL": "WasteL Systems",
  "WasteM": "WasteM Enterprises",
  "WasteN": "WasteN Innovations",
  "WasteO": "WasteO Global",
  "WasteP": "WasteP Industries",
  "WasteQ": "WasteQ Solutions",
  "WasteR": "WasteR Corp.",
  "WasteS": "WasteS Holdings",
  "WasteT": "WasteT Systems",
  "WasteU": "WasteU Enterprises",
  "WasteV": "WasteV Innovations",
  "WasteW": "WasteW Global",
  "WasteXX": "WasteXX Corp.",
  "WasteYY": "WasteYY Holdings",
  "WasteZZ": "WasteZZ Systems"
};

// Function to generate a random stock entry
const generateRandomStock = (index: number): TopStock => {
  const baseSymbol = commonSymbols[index % commonSymbols.length];
  const uniqueSuffix = Math.floor(index / commonSymbols.length) > 0 ? `-${Math.floor(index / commonSymbols.length)}` : '';
  const symbol = `${baseSymbol}${uniqueSuffix}`;

  // Use the map for common names, fallback to generic
  const name = symbolToNameMap[baseSymbol] || `${symbol} Corporation`;

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
      currentTopStocks = currentTopStocks.map((stock: TopStock) => {
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
      currentTopStocks.sort((a: TopStock, b: TopStock) => b.change_percent - a.change_percent);
      resolve(currentTopStocks); // Return all 200 stocks
    }, 1000 + Math.random() * 500); // Simulate network delay
  });
};