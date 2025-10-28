import React from "react";
import Layout from "@/components/Layout";

const Leaderboard = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Leaderboard</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          See who's topping the charts!
        </p>
      </div>
    </Layout>
  );
};

export default Leaderboard;