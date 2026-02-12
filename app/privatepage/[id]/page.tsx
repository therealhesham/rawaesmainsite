import Link from "next/link";
import { PrivateHeader } from "../components/PrivateHeader";
import { NotificationsCard } from "../components/NotificationsCard";
import { QuickContactCard } from "../components/QuickContactCard";
import { InvestmentReportsCard } from "../components/InvestmentReportsCard";
import { InvestorSidebar } from "../components/InvestorSidebar";

// Mock investor data - replace with API/database fetch using params.id
function getInvestorData(id: string) {
  return {
    investorId: "252402714",
    nationalId: "01010315691",
    name: "هشام بدر",
    contracts: [
      { id: "1", name: "عقد ر ه ب", number: "5176" },
      { id: "2", name: "عقد ر ر م 3474", number: "" },
      { id: "3", name: "عقد د ه ر 7597", number: "" },
    ],
  };
}

export default async function PrivateInvestorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const investor = getInvestorData(id);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light">
      <PrivateHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content - center/left */}
          <div className="flex-1 space-y-6">
            {/* Banner */}
            <div className="bg-[#003749] text-white rounded-2xl px-6 py-8 text-center">
              <h1 className="text-2xl md:text-3xl font-bold">
                استثمر مع روائس القمم
              </h1>
            </div>

            {/* Logout */}
            <div className="flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-[#003749] text-white font-medium hover:bg-[#003749]/90 transition-colors"
              >
                تسجيل الخروج
              </Link>
            </div>

            {/* Notifications */}
            <NotificationsCard />

            {/* Quick Contact */}
            <QuickContactCard />

            {/* Investment Reports */}
            <InvestmentReportsCard />
          </div>

          {/* Sidebar - right */}
          <div className="lg:w-96 shrink-0">
            <InvestorSidebar investor={investor} />
          </div>
        </div>
      </main>
    </div>
  );
}
