import { getInvestmentFunds, getFundTabs } from "../../investment/getFunds";
import { requirePageView } from "../lib/auth";
import { InvestmentFundsSectionEditable } from "./InvestmentFundsSectionEditable";

export const dynamic = "force-dynamic";

export default async function AdminFundsPage() {
  await requirePageView("funds");
  const [funds, tabs] = await Promise.all([
    getInvestmentFunds(),
    Promise.resolve(getFundTabs()),
  ]);
  return <InvestmentFundsSectionEditable tabs={tabs} funds={funds} />;
}

