import { requirePageView, getAdminUser, canEditPage } from "../../lib/auth";
import InvestorDetailsClient from "./InvestorDetailsClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function InvestorDetailsPage({ params }: Props) {
  await requirePageView("investor-page");
  const { id } = await params;
  const investorId = parseInt(id, 10);
  if (isNaN(investorId)) {
    return <div className="p-8 text-center text-red-500">معرف غير صالح</div>;
  }

  const admin = await getAdminUser(false);
  const permissions = {
    canApprove: admin ? canEditPage(admin, "investor-approve") : false,
    canUpload: admin ? canEditPage(admin, "investor-upload") : false,
    canDeleteFile: admin ? canEditPage(admin, "investor-delete-file") : false,
    canPublish: admin ? canEditPage(admin, "investor-publish") : false,
  };
  const canManageInvestors = admin ? canEditPage(admin, "investors-manage") : false;

  return (
    <InvestorDetailsClient
      investorId={investorId}
      permissions={permissions}
      canManageInvestors={canManageInvestors}
    />
  );
}
