/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LoadingSpinner } from "@/components/loadiingspinner";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const StockLevelsChart = () => {
  const { data: session, status } = useSession();
  const [data, setData] = useState({ lowStock: 0, available: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        if (status !== "authenticated") return;

        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        
        const { products } = await response.json();

        const lowStock = products.filter((p: any) => p.quantity < 10).length;
        const available = products.filter((p: any) => p.quantity >= 10).length;
        setData({ lowStock, available });
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load stock data");
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [status]);

  if (isLoading) return <LoadingSpinner size="md" />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (data.lowStock + data.available === 0) return <div className="text-gray-500">No stock data available</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Stock Levels</h2>
      <div className="h-64">
        <Pie
          data={{
            labels: ["Low Stock (<10)", "Available (≥10)"],
            datasets: [
              {
                data: [data.lowStock, data.available],
                backgroundColor: ["#F59E0B", "#10B981"],
                borderColor: ["#fff", "#fff"],
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || "";
                    const value = context.raw as number;
                    const total = data.lowStock + data.available;
                    return `${label}: ${value} (${((value / total) * 100).toFixed(1)}%)`;
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default StockLevelsChart;