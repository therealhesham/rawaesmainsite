import { getInvestmentRegisterBlockForAdmin } from "../investment-register-actions";
import { InvestmentRegisterEditable } from "./InvestmentRegisterEditable";

export const dynamic = "force-dynamic";

export default async function AdminInvestmentRegisterPage() {
    const block = await getInvestmentRegisterBlockForAdmin();
    return (
        <section className="py-12 px-4 bg-gray-50 dark:bg-background-dark">
            <div className="max-w-6xl mx-auto">
                <InvestmentRegisterEditable block={block} />
            </div>
        </section>
    );
}
