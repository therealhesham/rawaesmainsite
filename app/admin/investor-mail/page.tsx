import { requirePageView } from "../lib/auth";
import { getInvestorsForMail, getEmailLogs } from "./actions";
import { MailClient } from "./MailClient";

export const metadata = {
    title: "مراسلات البريد — إدارة روائس",
};

export default async function InvestorMailPage() {
    await requirePageView("investor-mail");

    const [investors, logs] = await Promise.all([
        getInvestorsForMail(),
        getEmailLogs(),
    ]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <MailClient investors={investors} logs={logs as any} />
        </div>
    );
}
