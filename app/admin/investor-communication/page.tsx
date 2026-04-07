import { requirePageView } from "../lib/auth";
import { InvestorCommunicationClient } from "./InvestorCommunicationClient";
import { getInvestorCommunicationBootData } from "./actions";

export const metadata = {
  title: "تواصل مع المستثمر — إدارة روائس",
};

export default async function InvestorCommunicationPage() {
  await requirePageView("investor-communication");
  const data = await getInvestorCommunicationBootData();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <InvestorCommunicationClient
        investors={data.investors}
        sectors={data.sectors as any}
        templates={data.templates as any}
        logs={data.logs as any}
        emailLogoUrlDisplay={data.emailLogoUrlDisplay}
      />
    </div>
  );
}
