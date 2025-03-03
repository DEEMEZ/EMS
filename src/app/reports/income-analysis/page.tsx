import NavbarComponent from "@/components/navbar/navbar";
import IncomeAnalysisTable from "@/components/reports/incomeanalysis";

export default function IncomeReportPage() {
  return (
    <div>
      <NavbarComponent /> 
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Income Analysis Report</h1>
        <IncomeAnalysisTable />
      </div>
    </div>
  );
}
