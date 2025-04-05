"use client";

import React from "react";
import Navbar from "@/components/navbar";
import StockLevelsChart from "@/components/charts/StockLevelsChart";
import InventoryValueChart from "@/components/charts/InventoryValueChart";
import PriceHistogram from "@/components/charts/PriceHistogram";
import ProductsOverTime from "@/components/charts/ProductsOverTime";
import StatsSection from "@/components/StatsSection";

const Dashboard = () => {
  return (
    <div className="flex">

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Navbar */}
        <Navbar />

        {/* Stats Section */}
        <StatsSection />

        {/* Grid Layout for Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
            <h2 className="text-lg font-semibold mb-2">Price Distribution</h2>
            <PriceHistogram />
          </div>

          {/* Products Over Time */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Products Over Time</h2>
            <ProductsOverTime />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
