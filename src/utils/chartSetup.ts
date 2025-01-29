import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    BarElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
  } from "chart.js";
  
  // Register Chart.js components globally
  ChartJS.register(LineElement, PointElement, BarElement, LinearScale, CategoryScale, Tooltip, Legend);
  