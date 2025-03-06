import NavbarComponent from "@/components/navbar/navbar";
import TransactionTable from "@/components/reports/transaction";

export default function TransactionReportPage() {
  return (
    <div>
      <NavbarComponent /> 
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Transaction Report</h1>
        <TransactionTable />
      </div>
    </div>
  );
}
