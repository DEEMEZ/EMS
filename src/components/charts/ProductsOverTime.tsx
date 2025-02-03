"use client";

import "@/utils/chartSetup";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

// Define the type for each entry in the monthly data
interface MonthlyData {
  _id: number; // Month (e.g., 1 for January, 2 for February)
  count: number; // Number of products added in that month
}

const ProductsOverTime = () => {
  // Define the state with proper types
  const [lineData, setLineData] = useState<{ labels: string[]; data: number[] }>({
    labels: [],
    data: [],
  });

  useEffect(() => {
    const getData = async () => {
      try {
        // Fetch the stats from the API
        const response = await axios.get("/api/stats");
        const monthlyData: MonthlyData[] = response.data.productsAddedByMonth;

        // Map the data into labels and values
        const labels = monthlyData.map((entry) => `Month ${entry._id}`);
        const data = monthlyData.map((entry) => entry.count);

        setLineData({ labels, data });
      } catch (error) {
        console.error("Error fetching products added over time:", error);
      }
    };

    getData();
  }, []);

  return (
    <div>
      <h2>Products Added Over Time</h2>
      <Line
        data={{
          labels: lineData.labels,
          datasets: [
            {
              label: "Products Added",
              data: lineData.data,
              borderColor: "#4BC0C0",
              fill: false,
            },
          ],
        }}
        options={{
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: "Months",
              },
            },
            y: {
              title: {
                display: true,
                text: "Number of Products",
              },
            },
          },
        }}
      />
    </div>
  );
};

export default ProductsOverTime;


