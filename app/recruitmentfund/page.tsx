import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
    title: "صندوق روائس للاستقدام | Rawaes Recruitment Fund",
    description:
        "صندوق روائس للاستقدام - استثمار في قطاع استقدام العمالة المنزلية. التقارير المالية السنوية وخطوات الاستثمار.",
};

const FLAGS_IMAGE =
    "/flagesrecruitmentfund.avif";
const NETWORK_IMAGE =
    "/personsrecruitmentfund.avif";

const REPORTS = [
    { id: "q1-2024", label: "الربع الأول 2024" },
    { id: "q2-2024", label: "الربع الثاني 2024" },
    { id: "q3-2024", label: "الربع الثالث 2024" },
    { id: "q4-2024", label: "الربع الرابع 2024" },
    { id: "q1-2025", label: "الربع الأول 2025" },
    { id: "q2-2025", label: "الربع الثاني 2025" },
];

export default function RecruitmentFundPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light transition-colors duration-300 font-[family-name:var(--font-cairo)]">
            <Header />

            <main>
                {/* Hero: flags (left) | center text | network (right) */}
                <section className="relative min-h-[75vh] grid grid-cols-1 md:grid-cols-3 overflow-hidden">
                    {/* Left: flags */}
                    <div className="relative h-full min-h-[40vh] overflow-hidden">
                        <img
                            src={FLAGS_IMAGE}
                            alt=""
                            className="absolute inset-0 size-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-sky-300/20 dark:bg-sky-900/30" />
                    </div>
                    {/* Center: title + paragraph */}
                    <div className="relative flex items-center justify-center px-6 py-12 md:py-16 bg-gradient-to-b from-sky-100/90 to-white dark:from-slate-800/95 dark:to-background-dark">
                        <div className="max-w-xl text-center">
                            <h1 className="text-4xl md:text-5xl font-bold text-gold mb-6 drop-shadow-sm">
                                صندوق روائس للاستقدام
                            </h1>
                            <p className="text-base md:text-lg text-secondary dark:text-gray-300 leading-relaxed text-justify">
                                يمتلك صندوق روائس للاستقدام حجماً ونطاقاً متميزين وعوائد محتملة عالية. تستثمر المجموعة في قطاع استقدام العمالة المنزلية وتسهيل الخدمات للأسر والأفراد. سجلت مجموعة روائس للاستقدام أداءً متميزاً في القطاع، ونعمل على تعزيز وتوسيع حضورنا في سوق الاستقدام لدعم هذا النمو. نسعى لفرص استثمارية وشراكات في مجال الاستقدام في المملكة وخارجها.
                            </p>
                        </div>
                    </div>
                    {/* Right: network / global connection */}
                    <div className="relative h-full min-h-[40vh] overflow-hidden">
                        <img
                            src={NETWORK_IMAGE}
                            alt=""
                            className="absolute inset-0 size-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-corporate/30 dark:bg-slate-900/50" />
                    </div>
                </section>

                {/* Annual Financial Reports */}
                <section className="relative py-20 px-6 bg-[#EADDC9] dark:bg-slate-900/60">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-secondary dark:text-gold text-center mb-3">
                            التقارير المالية السنوية
                        </h2>
                        <p className="text-secondary/80 dark:text-gray-400 text-center text-sm md:text-base mb-12">
                            يتم رفع التقارير بشكل دوري بعد الانتهاء من كل ربع سنة
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                            {REPORTS.map((report) => (
                                <a
                                    key={report.id}
                                    href="#"
                                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-4 px-6 bg-gold/80 hover:bg-gold border border-white rounded-xl text-secondary font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <span className="text-xs font-medium opacity-90">{report.label}</span>
                                    <span className="flex items-center gap-1">
                                        مشاهدة
                                        <span className="material-icons-round text-lg">arrow_forward</span>
                                    </span>
                                </a>
                            ))}
                        </div>
                        <div className="flex justify-center">
                            <Link
                                href="/investment#funds"
                                className="inline-flex items-center justify-center gap-2 py-3 px-8 bg-gold hover:bg-[#d8ae6d] text-secondary font-bold rounded-xl shadow-lg transition-all duration-300"
                            >
                                <span className="material-icons-round">arrow_back</span>
                                <span>الخلف</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
