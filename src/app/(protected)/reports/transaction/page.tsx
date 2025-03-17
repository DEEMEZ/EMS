import NavbarComponent from "@/components/navbar/navbar";
import TransactionAnalysisTable from "@/components/reports/transaction";

export default function TransactionReportPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      { /*<NavbarComponent />*/ } 
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Transaction Report</h1>
        <TransactionAnalysisTable /> 
      </div>
    </div>
  );
}
