import Layout from "@/components/Layout";
import { useMarketData } from "@/hooks/use-market-data";
import MarketOverviewCard from "@/components/MarketOverviewCard";
import TopStocksTable from "@/components/TopStocksTable";
import MarketChart from "@/components/MarketChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeRange } from "@/lib/market-data-api"; // Import TimeRange

const MarketVisualization = () => {
  const { indices, topStocks, isLoading, error, timeRange, setTimeRange } = useMarketData();

  const niftyData = indices.find(index => index.name === "NIFTY50");
  const sensexData = indices.find(index => index.name === "SENSEX");

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Real-time Market Overview
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Track major indices and top-performing stocks.
        </p>

        <div className="w-full max-w-6xl space-y-8">
          {/* Time Range Selector */}
          <div className="flex justify-end w-full max-w-6xl">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last 1 Hour</SelectItem>
                <SelectItem value="10h">Last 10 Hours</SelectItem> {/* New item */}
                <SelectItem value="1d">Last 1 Day</SelectItem>
                <SelectItem value="1m">Last 1 Month</SelectItem>
                <SelectItem value="1y">Last 1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Index Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <MarketOverviewCard
              title="NIFTY50"
              value={niftyData?.value || null}
              change={niftyData?.change || null}
              changePercent={niftyData?.change_percent || null}
              isLoading={isLoading}
              error={error}
            />
            <MarketOverviewCard
              title="SENSEX"
              value={sensexData?.value || null}
              change={sensexData?.change || null}
              changePercent={sensexData?.change_percent || null}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* Index Charts */}
          <div className="grid gap-4 md:grid-cols-2 h-[350px]">
            <MarketChart
              title="NIFTY50"
              data={niftyData?.history || []}
              isLoading={isLoading}
              error={error}
              timeRange={timeRange}
            />
            <MarketChart
              title="SENSEX"
              data={sensexData?.history || []}
              isLoading={isLoading}
              error={error}
              timeRange={timeRange}
            />
          </div>

          {/* Top Stocks Table */}
          <TopStocksTable
            topStocks={topStocks}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </Layout>
  );
};

export default MarketVisualization;