"use client";

import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import fetchProducts from "@/hooks/useFetchProducts";

// ✅ Register required Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const StockLevelsChart = () => {
  const [data, setData] = useState({ lowStock: 0, available: 0 });

  useEffect(() => {
    const getData = async () => {
      const products = await fetchProducts();
      const lowStock = products.filter((p) => p.quantity < 10).length;
      const available = products.filter((p) => p.quantity >= 10).length;
      setData({ lowStock, available });
    };

    getData();
  }, []);

  return (
    <div>
      <h2>Stock Levels</h2>
      <Pie
        data={{
          labels: ["Low Stock", "Available"],
          datasets: [
            {
              data: [data.lowStock, data.available],
              backgroundColor: ["#FF6384", "#36A2EB"],
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
          },
        }}
      />
    </div>
  );
};

export default StockLevelsChart;
