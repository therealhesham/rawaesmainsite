import { Suspense } from "react";
import { getInvestmentFunds, getFundTabs } from "./getFunds";
import { InvestmentPageContent } from "./InvestmentPageContent";

/** عدم كاش الصفحة — جلب بيانات الصناديق من DB في كل طلب */
export const dynamic = "force-dynamic";

export default async function InvestmentPage() {
    const [funds, tabs] = await Promise.all([
        getInvestmentFunds(),
        Promise.resolve(getFundTabs()),
    ]);

    return (
        <Suspense fallback={<div className="min-h-screen bg-background-light dark:bg-background-dark" />}>
            <InvestmentPageContent tabs={tabs} funds={funds} />
        </Suspense>
    );
}
