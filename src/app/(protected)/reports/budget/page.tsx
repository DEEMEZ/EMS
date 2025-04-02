import BudgetAnalysisTable from "@/components/reports/budget";

export default function BudgetReportPage() {
  return (
    <div>
      { /*<NavbarComponent />*/ } 
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Budget Analysis Report</h1>
        <BudgetAnalysisTable />
      </div>
    </div>
  );
}
