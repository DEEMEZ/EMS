"use client";

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import fetchProducts from "@/hooks/useFetchProducts";

const PriceHistogram = () => {
  const [histogramData, setHistogramData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const getData = async () => {
      const products = await fetchProducts();

      // Group prices into bins
      const bins = [0, 50, 100, 200, 300, 500, 1000];
      const data = Array(bins.length - 1).fill(0);

      products.forEach((product) => {
        bins.forEach((bin, index) => {
          if (product.price > bin && product.price <= bins[index + 1]) {
            data[index]++;
          }
        });
      });

      setHistogramData(data);
      setLabels(
        bins.slice(1).map((upperBound, i) => `${bins[i]} - ${upperBound}`)
      );
    };

    getData();
  }, []);

  return (
    <div>
      <h2>Price Distribution</h2>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Number of Products",
              data: histogramData,
              backgroundColor: "#36A2EB",
            },
          ],
        }}
        options={{
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: "Price Range ($)",
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

export default PriceHistogram;
