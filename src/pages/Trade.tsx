import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Trade = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">Trade Stocks</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Buy and sell virtual stocks to grow your portfolio!
        </p>

        <div className="w-full max-w-md space-y-4">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                Place an Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Stock Symbol (e.g., AAPL)" className="dark:bg-gray-700 dark:text-white" />
              <Input type="number" placeholder="Quantity" className="dark:bg-gray-700 dark:text-white" />
              <div className="flex space-x-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">Buy</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">Sell</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Trade;