import Link from "next/link";
import { requirePageView } from "../../lib/auth";
import { Hotel, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminHospitalityFundPage() {
  await requirePageView("funds");
  return (
    <section className="py-8 px-4 bg-gray-50 dark:bg-background-dark" dir="rtl">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Hotel size={64} className="text-gold" />
        </div>
        <h1 className="text-2xl font-bold text-secondary dark:text-white mb-2">
          قطاع الضيافة
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          صفحة إدارة صندوق الضيافة — قيد التصميم. يمكنك تعديل بيانات الضيافة مؤقتاً من{" "}
          <Link href="/admin/funds" className="text-primary underline">
            صناديق الاستثمار
          </Link>
          .
        </p>
        <Link
          href="/admin/funds"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-medium"
        >
          <ArrowLeft size={20} />
          العودة لصناديق الاستثمار
        </Link>
      </div>
    </section>
  );
}
