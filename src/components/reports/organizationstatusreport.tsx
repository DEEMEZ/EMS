"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

interface OrganizationReport {
  name: string;
  value: number;
}

const OrganizationStatusReport = () => {
  const [data, setData] = useState<OrganizationReport[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reports/organization");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching organization report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const COLORS = ["#28a745", "#dc3545", "#ffc107"]; // Green, Red, Yellow

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Organization Status Report</h2>
      
      <div className="flex justify-center mb-4">
        <Button onClick={fetchReport} disabled={loading}>
          {loading ? "Loading..." : "Refresh Report"}
        </Button>
      </div>

      <div className="flex justify-center">
        <ResponsiveContainer width={400} height={400}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrganizationStatusReport;
