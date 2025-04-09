/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LoadingSpinner } from "@/components/loadiingspinner";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PriceHistogram = () => {
  const { data: session, status } = useSession();
  const [histogramData, setHistogramData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
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

        const bins = [0, 50, 100, 200, 300, 500, 1000, 1500, 2000, 2500];
        const data = Array(bins.length - 1).fill(0);

        products.forEach((product: any) => {
          bins.forEach((bin, index) => {
            if (product.price > bin && product.price <= bins[index + 1]) {
              data[index]++;
            }
          });
        });

        setHistogramData(data);
        setLabels(bins.slice(1).map((upperBound, i) => `${bins[i]}-${upperBound}`));
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load price data");
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [status]);

  if (isLoading) return <LoadingSpinner size="md" />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!histogramData.length) return <div className="text-gray-500">No price data available</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Price Distribution</h2>
      <div className="h-64">
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Number of Products",
                data: histogramData,
                backgroundColor: "#3B82F6",
                borderRadius: 4,
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
                  text: "Price Range ($)",
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
                  title: (context) => `$${context[0].label}`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default PriceHistogram;