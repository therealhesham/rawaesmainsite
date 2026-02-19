import { getInvestmentRegisterBlockForAdmin } from "../investment-register-actions";
import { InvestmentRegisterForm } from "./InvestmentRegisterForm";

export const dynamic = "force-dynamic";

export default async function AdminInvestmentRegisterPage() {
  const block = await getInvestmentRegisterBlockForAdmin();
  return <InvestmentRegisterForm block={block} />;
}
