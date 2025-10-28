import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStockPrice } from "@/hooks/use-stock-price";
import { useUserPortfolio } from "@/hooks/use-user-portfolio";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp } from "lucide-react";
import { showError } from "@/utils/toast";

const Trade = () => {
  const [symbolInput, setSymbolInput] = useState("");
  const [quantity, setQuantity] = useState<number | string>("");
  const { stockData, isLoading: isLoadingStockPrice, error: stockPriceError, fetchPrice } = useStockPrice();
  const { balance, userStocks, isLoadingPortfolio, buyStock, sellStock } = useUserPortfolio();

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymbolInput(e.target.value.toUpperCase());
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleFetchPrice = () => {
    if (symbolInput) {
      fetchPrice(symbolInput);
    }
  };

  const handleBuy = async () => {
    const numQuantity = Number(quantity);
    if (!stockData || !numQuantity || numQuantity <= 0) {
      showError("Please enter a valid stock symbol and a positive quantity.");
      return;
    }

    const success = await buyStock(stockData.symbol, numQuantity, stockData.price);
    if (success) {
      setQuantity(""); // Clear quantity after successful trade
      // Optionally, clear symbolInput or refetch stock price if desired
    }
  };

  const handleSell = async () => {
    const numQuantity = Number(quantity);
    if (!stockData || !numQuantity || numQuantity <= 0) {
      showError("Please enter a valid stock symbol and a positive quantity.");
      return;
    }

    const success = await sellStock(stockData.symbol, numQuantity, stockData.price);
    if (success) {
      setQuantity(""); // Clear quantity after successful trade
      // Optionally, clear symbolInput or refetch stock price if desired
    }
  };

  const currentStockHolding = userStocks.find(s => s.stock_symbol === symbolInput);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">Trade Stocks</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Buy and sell virtual stocks to grow your portfolio!
        </p>

        <div className="w-full max-w-md space-y-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center justify-center space-x-2">
                <TrendingUp className="h-6 w-6" />
                <span>Place an Order</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingPortfolio ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="text-lg font-medium text-gray-800 dark:text-white flex items-center justify-center space-x-1">
                  <span>Your Balance:</span>
                  <DollarSign className="h-4 w-4" />
                  <span>{balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex space-x-2">
                <Input
                  placeholder="Stock Symbol (e.g., AAPL)"
                  className="dark:bg-gray-700 dark:text-white flex-grow"
                  value={symbolInput}
                  onChange={handleSymbolChange}
                  onBlur={handleFetchPrice}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFetchPrice();
                    }
                  }}
                />
                <Button onClick={handleFetchPrice} disabled={!symbolInput || isLoadingStockPrice}>
                  {isLoadingStockPrice ? "Fetching..." : "Get Price"}
                </Button>
              </div>

              {isLoadingStockPrice && <Skeleton className="h-8 w-full" />}
              {stockPriceError && <p className="text-red-500 text-sm">{stockPriceError}</p>}
              {stockData && (
                <div className="text-lg font-medium text-gray-800 dark:text-white flex items-center justify-center space-x-1">
                  <span>Current Price:</span>
                  <DollarSign className="h-4 w-4" />
                  <span>{stockData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {currentStockHolding && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You own: {currentStockHolding.quantity} shares (Avg. Buy Price: ₹{currentStockHolding.average_buy_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </p>
              )}

              <Input
                type="number"
                placeholder="Quantity"
                className="dark:bg-gray-700 dark:text-white"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
              />
              <div className="flex space-x-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleBuy}
                  disabled={!stockData || !Number(quantity) || Number(quantity) <= 0 || isLoadingPortfolio}
                >
                  Buy
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleSell}
                  disabled={!stockData || !Number(quantity) || Number(quantity) <= 0 || isLoadingPortfolio || !currentStockHolding || currentStockHolding.quantity < Number(quantity)}
                >
                  Sell
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Trade;