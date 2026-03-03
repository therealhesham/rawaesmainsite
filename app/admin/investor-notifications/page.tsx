import { requirePageView } from "../lib/auth";
import { getInvestorsForNotifications, getNotifications } from "./actions";
import { NotificationsClient } from "./NotificationsClient";

export const metadata = {
    title: "إرسال التنبيهات — إدارة روائس",
};

export default async function InvestorNotificationsPage() {
    await requirePageView("investor-notifications");

    const [investors, notifications] = await Promise.all([
        getInvestorsForNotifications(),
        getNotifications(),
    ]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <NotificationsClient investors={investors} notifications={notifications as any} />
        </div>
    );
}
