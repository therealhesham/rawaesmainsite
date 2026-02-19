import {
  getCarsFund,
  getRentalCarFundReportsDetails,
  getUsersMinimal,
} from "@/app/investment/getFunds";
import { CarsFundForm } from "./CarsFundForm";

export const dynamic = "force-dynamic";

export default async function AdminCarsFundPage() {
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
