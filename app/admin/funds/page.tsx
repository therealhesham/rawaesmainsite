import { getInvestmentFunds } from "../../investment/getFunds";
import { InvestmentFundsAdmin } from "./InvestmentFundsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminFundsPage() {
  const funds = await getInvestmentFunds();
  return <InvestmentFundsAdmin initialFunds={funds} />;
}

