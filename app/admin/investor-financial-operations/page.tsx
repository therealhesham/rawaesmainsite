import { requirePageView } from "../lib/auth";
import { getInvestorsForFinancialOps, listFinancialOperations } from "./actions";
import { InvestorFinancialClient } from "./InvestorFinancialClient";

export const metadata = {
  title: "العمليات المالية — إدارة روائس",
};

export default async function InvestorFinancialOperationsPage() {
  await requirePageView("investor-financial");

  const [investors, rows] = await Promise.all([
    getInvestorsForFinancialOps(),
    listFinancialOperations(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <InvestorFinancialClient investors={investors} initialRows={rows as any} />
    </div>
  );
}
