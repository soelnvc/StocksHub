import React from "react";
import Layout from "@/components/Layout";

const Dashboard = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Dashboard</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Welcome to your StockSim Dashboard! More features coming soon.
        </p>
      </div>
    </Layout>
  );
};

export default Dashboard;