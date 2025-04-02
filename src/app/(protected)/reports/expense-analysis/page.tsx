import ExpenseAnalysisTable from "@/components/reports/expenseanalysis";

export default function ExpenseReportPage() {
  return (
    <div>
      { /*<NavbarComponent />*/ } 
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Expense Analysis Report</h1>
        <ExpenseAnalysisTable />
      </div>
    </div>
  );
}
