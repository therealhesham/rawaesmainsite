import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
    title: "صندوق روائس لتأجير السيارات | Rawaes Car Rental Fund",
    description:
        "صندوق روائس لتأجير السيارات - عوائد مالية ثابتة عبر تأجير السيارات. إدارة احترافية وتنويع استثماري. التقارير المالية السنوية.",
};

const SHOWROOM_IMAGE = "/carfund.avif";
const CAR_LOT_IMAGE = "/carfund2.avif";

const QUARTERLY_REPORTS = [
    { id: "q1", label: "التقرير الربع سنوي الأول" },
    { id: "q2", label: "التقرير الربع سنوي الثاني" },
    { id: "q3", label: "التقرير الربع سنوي الثالث" },
    { id: "q4", label: "التقرير الربع سنوي الرابع" },
];

export default function CarRentalFundPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light transition-colors duration-300 font-[family-name:var(--font-cairo)]">
            <Header />

            <main>
                {/* Hero: showroom (left) | center text | car lot (right) - light grey-blue */}
                <section className="relative min-h-[75vh] grid grid-cols-1 md:grid-cols-3 overflow-hidden bg-slate-200/80 dark:bg-slate-800/60">
                    {/* Left: car showroom */}
                    <div className="relative h-full min-h-[40vh] overflow-hidden">
                        <img
                            src={SHOWROOM_IMAGE}
                            alt=""
                            className="absolute inset-0 size-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-slate-400/25 dark:bg-slate-900/40" />
                    </div>
                    {/* Center: title + description */}
                    <div className="relative flex items-center justify-center px-6 py-12 md:py-16 bg-gradient-to-b from-slate-100/95 to-slate-200/90 dark:from-slate-700/95 dark:to-slate-800/90">
                        <div className="max-w-xl text-center">
                            <h1 className="text-4xl md:text-5xl font-bold text-gold mb-6 drop-shadow-sm">
                                صندوق روائس لتأجير السيارات
                            </h1>
                            <p className="text-base md:text-lg text-secondary dark:text-gray-300 leading-relaxed text-justify">
                                يوفر صندوق روائس لتأجير السيارات الاستثماري فرصة لتحقيق عوائد مالية ثابتة ومستقرة عبر تأجير السيارات. يدار الصندوق بواسطة فريق محترف يضمن شراء وتأجير وصيانة السيارات بكفاءة، مما يساهم في تقليل المخاطر وتنويع الاستثمارات. هذا الصندوق مناسب للمستثمرين الأفراد والمؤسساتيين الذين يسعون لدخل مستقر ونمو رأس المال بمرور الوقت.
                            </p>
                        </div>
                    </div>
                    {/* Right: outdoor car lot */}
                    <div className="relative h-full min-h-[40vh] overflow-hidden">
                        <img
                            src={CAR_LOT_IMAGE}
                            alt=""
                            className="absolute inset-0 size-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-slate-500/20 dark:bg-slate-900/50" />
                    </div>
                </section>

                {/* Annual Financial Reports - same light grey-blue */}
                <section className="relative py-20 px-6 bg-slate-200/70 dark:bg-slate-800/50">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-secondary dark:text-gold text-center mb-3">
                            التقارير المالية السنوية
                        </h2>
                        <p className="text-secondary/80 dark:text-gray-400 text-center text-sm md:text-base mb-12">
                            يتم رفع التقارير بشكل دوري بعد الانتهاء من كل ربع سنة
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
                            {QUARTERLY_REPORTS.map((report) => (
                                <a
                                    key={report.id}
                                    href="#"
                                    className="flex items-center justify-center gap-2 py-4 px-6 bg-white/90 dark:bg-slate-700/90 border-2 border-secondary/30 dark:border-gold/30 rounded-2xl text-secondary dark:text-gold font-bold shadow-sm hover:shadow-lg hover:border-gold/50 transition-all duration-300"
                                >
                                    <span>{report.label}</span>
                                    <span className="material-icons-round text-xl">arrow_forward</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Bottom: golden-orange bar with Back button */}
                <section className="relative py-10 px-6 bg-[#EADDC9] dark:bg-slate-900/80">
                    <div className="flex justify-center">
                        <Link
                            href="/investment#funds"
                            className="inline-flex items-center justify-center gap-2 py-3 px-10 rounded-2xl font-bold shadow-lg transition-all duration-300 bg-gradient-to-b from-gold to-[#c5a065] hover:from-[#d8ae6d] hover:to-[#b89050] text-secondary border border-[#b89050]/30"
                        >
                            <span className="material-icons-round">arrow_back</span>
                            <span>الخلف</span>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
