"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const StatsSection = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInventoryValue: 0,
    averagePrice: 0,
    uniqueCategories: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/stats"); // Call the stats API
        setStats(response.data); // Update state with API data
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Products */}
      <div className="bg-blue-100 text-blue-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">Total Products</h3>
        <p className="text-2xl font-bold">{stats.totalProducts}</p>
      </div>

      {/* Total Inventory Value */}
      <div className="bg-green-100 text-green-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">Total Inventory Value</h3>
        <p className="text-2xl font-bold">${stats.totalInventoryValue.toFixed(2)}</p>
      </div>

      {/* Average Price */}
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">Average Price</h3>
        <p className="text-2xl font-bold">${stats.averagePrice.toFixed(2)}</p>
      </div>

      {/* Unique Categories */}
      <div className="bg-purple-100 text-purple-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">Unique Categories</h3>
        <p className="text-2xl font-bold">{stats.uniqueCategories}</p>
      </div>
    </div>
  );
};

export default StatsSection;
