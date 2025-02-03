"use client";

import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import fetchProducts from "@/hooks/useFetchProducts";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const InventoryValueChart = () => {
  const [chartData, setChartData] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });

  useEffect(() => {
    const getData = async () => {
      const products = await fetchProducts();

      // Group inventory value by category
      const categoryValues: { [key: string]: number } = {};
      products.forEach((product) => {
        const value = product.price * product.quantity;
        categoryValues[product.category] = (categoryValues[product.category] || 0) + value;
      });

      setChartData({
        labels: Object.keys(categoryValues),
        values: Object.values(categoryValues),
      });
    };

    getData();
  }, []);

  return (
    <div>
      <h2>Inventory Value by Category</h2>
      <Doughnut
        data={{
          labels: chartData.labels,
          datasets: [
            {
              data: chartData.values,
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
              ],
              hoverBackgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
              ],
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

export default InventoryValueChart;
