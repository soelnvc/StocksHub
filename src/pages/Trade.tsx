import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStockPrice } from "@/hooks/use-stock-price";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp } from "lucide-react";

const Trade = () => {
  const [symbolInput, setSymbolInput] = useState("");
  const [quantity, setQuantity] = useState<number | string>("");
  const { stockData, isLoading, error, fetchPrice } = useStockPrice();

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

  // Placeholder for buy/sell logic (will be implemented in the next step)
  const handleBuy = () => {
    console.log(`Buying ${quantity} shares of ${symbolInput} at ${stockData?.price}`);
    // Implement actual buy logic here
  };

  const handleSell = () => {
    console.log(`Selling ${quantity} shares of ${symbolInput} at ${stockData?.price}`);
    // Implement actual sell logic here
  };

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
              <div className="flex space-x-2">
                <Input
                  placeholder="Stock Symbol (e.g., AAPL)"
                  className="dark:bg-gray-700 dark:text-white flex-grow"
                  value={symbolInput}
                  onChange={handleSymbolChange}
                  onBlur={handleFetchPrice} // Fetch price when input loses focus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFetchPrice();
                    }
                  }}
                />
                <Button onClick={handleFetchPrice} disabled={!symbolInput || isLoading}>
                  {isLoading ? "Fetching..." : "Get Price"}
                </Button>
              </div>

              {isLoading && <Skeleton className="h-8 w-full" />}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {stockData && (
                <div className="text-lg font-medium text-gray-800 dark:text-white flex items-center justify-center space-x-1">
                  <span>Current Price:</span>
                  <DollarSign className="h-4 w-4" />
                  <span>{stockData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
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
                  disabled={!stockData || !quantity || isLoading}
                >
                  Buy
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleSell}
                  disabled={!stockData || !quantity || isLoading}
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