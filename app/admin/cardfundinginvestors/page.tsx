import { getRentalCarFundReportsDetails } from "@/app/investment/getFunds";
import { CardFundingInvestorsClient } from "./CardFundingInvestorsClient";

export const dynamic = "force-dynamic";

export default async function CardFundingInvestorsPage() {
  const rows = await getRentalCarFundReportsDetails();
  return <CardFundingInvestorsClient rows={rows} />;
}
