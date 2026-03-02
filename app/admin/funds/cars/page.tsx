import {
  getCarsFund,
  getRentalCarFundReportsDetails,
  getUsersMinimal,
} from "@/app/investment/getFunds";
import { requirePageView } from "../../lib/auth";
import { CarsFundForm } from "./CarsFundForm";

export const dynamic = "force-dynamic";

export default async function AdminCarsFundPage() {
  await requirePageView("funds");
  const [fund, reportDetails, users] = await Promise.all([
    getCarsFund(),
    getRentalCarFundReportsDetails(),
    getUsersMinimal(),
  ]);
  return (
    <CarsFundForm
      fund={fund}
      reportDetails={reportDetails}
      users={users}
    />
  );
}
