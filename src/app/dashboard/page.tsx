"use client";

import React from "react";
import StockLevelsChart from "@/components/charts/StockLevelsChart";
import InventoryValueChart from "@/components/charts/InventoryValueChart";
import StatsSection from "@/components/StatsSection"; // Import Stats Section
import PriceHistogram from "@/components/charts/PriceHistogram";
import ProductsOverTime from "@/components/charts/ProductsOverTime";

const Dashboard = () => {
  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-4">Inventory Analytics Dashboard</h1>

      {/* Stats Section */}
      <StatsSection />

      {/* Grid Layout for Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stock Levels Chart */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Stock Levels</h2>
          <StockLevelsChart />
        </div>

        {/* Inventory Value Chart */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Inventory Value</h2>
          <InventoryValueChart />
        </div>
        {/* Price Histogram */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <PriceHistogram />
        </div>
        {/* Products Over Time */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <ProductsOverTime />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
