import OrganizationStatusReport from "@/components/reports/organizationstatusreport";

export default function OrganizationReportPage() {
  return (
    <div>
      { /*<NavbarComponent />*/ }
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Organization Status Report</h1>
        <OrganizationStatusReport />
      </div>
    </div>
  );
}
