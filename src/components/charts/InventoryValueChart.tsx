/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LoadingSpinner } from "@/components/loadiingspinner";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const InventoryValueChart = () => {
  const { data: session, status } = useSession();
  const [chartData, setChartData] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });
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

        const categoryValues: { [key: string]: number } = {};
        products.forEach((product: any) => {
          const value = product.price * product.quantity;
          categoryValues[product.category] = (categoryValues[product.category] || 0) + value;
        });

        setChartData({
          labels: Object.keys(categoryValues),
          values: Object.values(categoryValues),
        });
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load inventory data");
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [status]);

  if (isLoading) return <LoadingSpinner size="md" />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!chartData.labels.length) return <div className="text-gray-500">No inventory data available</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Inventory Value by Category</h2>
      <div className="h-64">
        <Doughnut
          data={{
            labels: chartData.labels,
            datasets: [
              {
                data: chartData.values,
                backgroundColor: [
                  "#3B82F6",
                  "#10B981",
                  "#F59E0B",
                  "#6366F1",
                  "#EC4899",
                  "#14B8A6",
                ],
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
                    return `${label}: $${value.toFixed(2)} (${(
                      (value / chartData.values.reduce((a, b) => a + b, 0)) *
                      100
                    ).toFixed(1)}%)`;
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

export default InventoryValueChart;