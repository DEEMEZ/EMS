/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LoadingSpinner } from "@/components/loadiingspinner";
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const ProductsOverTime = () => {
  const { data: session, status } = useSession();
  const [lineData, setLineData] = useState<{ labels: string[]; data: number[] }>({
    labels: [],
    data: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        if (status !== "authenticated") return;

        const response = await fetch("/api/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        
        const stats = await response.json();
        
        // If the API doesn't provide monthly data, calculate from products
        if (!stats.productsAddedByMonth) {
          const productsRes = await fetch("/api/products");
          if (!productsRes.ok) throw new Error("Failed to fetch products");
          
          const { products } = await productsRes.json();
          const monthlyCounts = Array(12).fill(0);
          
          products.forEach((product: any) => {
            const date = new Date(product.createdAt || product.modifiedDate);
            const month = date.getMonth();
            monthlyCounts[month]++;
          });
          
          setLineData({
            labels: monthNames,
            data: monthlyCounts,
          });
        } else {
          // Use API data if available
          const monthlyData = stats.productsAddedByMonth;
          const labels = monthlyData.map((entry: any) => monthNames[entry._id - 1]);
          const data = monthlyData.map((entry: any) => entry.count);
          setLineData({ labels, data });
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load timeline data");
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [status]);

  if (isLoading) return <LoadingSpinner size="md" />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!lineData.labels.length) return <div className="text-gray-500">No timeline data available</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Products Added Over Time</h2>
      <div className="h-64">
        <Line
          data={{
            labels: lineData.labels,
            datasets: [
              {
                label: "Products Added",
                data: lineData.data,
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.3,
                fill: true,
                pointBackgroundColor: "#3B82F6",
                pointBorderColor: "#fff",
                pointHoverRadius: 5,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Month",
                  font: {
                    weight: "bold",
                  },
                },
                grid: {
                  display: false,
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Number of Products",
                  font: {
                    weight: "bold",
                  },
                },
                beginAtZero: true,
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => `${context.dataset.label}: ${context.raw}`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default ProductsOverTime;