import Layout from "@/components/Layout";
import { useMarketData } from "@/hooks/use-market-data";
import MarketOverviewCard from "@/components/MarketOverviewCard";
import TopStocksTable from "@/components/TopStocksTable";
import MarketChart from "@/components/MarketChart";


const MarketVisualization = () => {
  const { indices, topStocks, isLoading, error } = useMarketData();

  const niftyData = indices.find(index => index.name === "NIFTY50");
  const sensexData = indices.find(index => index.name === "SENSEX");

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
            />
            <MarketChart
              title="SENSEX"
              data={sensexData?.history || []}
              isLoading={isLoading}
              error={error}
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