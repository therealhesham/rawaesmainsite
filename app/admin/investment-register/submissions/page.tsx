import Link from "next/link";
import { getInvestmentInterestSubmissions } from "../../investment-register-actions";
import { InvestmentInterestSubmissionsTable } from "./InvestmentInterestSubmissionsTable";

export const dynamic = "force-dynamic";

export default async function AdminInvestmentInterestSubmissionsPage() {
  const submissions = await getInvestmentInterestSubmissions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/investment-register"
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-secondary dark:hover:text-white transition-colors"
            aria-label="العودة لسجل اهتمامك"
          >
            <span className="material-icons">arrow_forward</span>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary dark:text-white flex items-center gap-2">
              <span className="material-icons text-primary">how_to_reg</span>
              طلبات سجل اهتمامك
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              الطلبات الواردة من نموذج «سجل اهتمامك واستثمر معنا» في صفحة الاستثمار
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
            <span className="material-icons text-primary">inbox</span>
            الطلبات ({submissions.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {submissions.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
              <span className="material-icons text-5xl mb-3 opacity-30">inbox</span>
              <p>لا توجد طلبات حتى الآن</p>
            </div>
          ) : (
            <InvestmentInterestSubmissionsTable submissions={submissions} />
          )}
        </div>
      </div>
    </div>
  );
}
