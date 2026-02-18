import { Suspense } from "react";
import { getInvestmentFunds, getFundTabs } from "./getFunds";
import { InvestmentPageContent } from "./InvestmentPageContent";

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
