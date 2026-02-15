import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
    title: "صندوق روائس للضيافة | Rawaes Hospitality Fund",
    description:
        "صندوق روائس للضيافة - فرصة استثمارية في قطاع الضيافة والفنادق. التقارير السنوية لاستثمارات الضيافة.",
};

const BUILDING_LEFT = "/wallpaper.png";
const BUILDING_RIGHT = "/wallpaper.png";

const ANNUAL_REPORTS = [
    { year: "2021" },
    { year: "2023" },
    { year: "2024" },
    { year: "2020" },
    { year: "2022" },
];

export default function HospitalityFundPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light transition-colors duration-300 font-[family-name:var(--font-cairo)]">
            <Header />

            <main>
                {/* Hero: building left | center text (right-aligned) | building right */}
                <section className="relative min-h-[75vh] grid grid-cols-1 md:grid-cols-3 overflow-hidden">
                    {/* Left: building with neon / sky */}
                    <div className="relative h-full min-h-[40vh] overflow-hidden">
                        <img
                            src={BUILDING_LEFT}
                            alt=""
                            className="absolute inset-0 size-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-sky-400/25 dark:bg-sky-900/40" />
                    </div>
                    {/* Center: title + paragraph - right-aligned, soft cloud bg */}
                    <div className="relative flex items-center justify-center px-6 py-12 md:py-16 bg-gradient-to-b from-white via-slate-50/95 to-white dark:from-slate-800/95 dark:to-background-dark">
                        <div className="max-w-xl w-full text-right">
                            <h1 className="text-4xl md:text-5xl font-bold text-gold mb-6 drop-shadow-sm">
                                صندوق روائس للضيافة
                            </h1>
                            <p className="text-base md:text-lg text-secondary dark:text-gray-300 leading-relaxed">
                                يقدم صندوق روائس للضيافة فرصة استثمارية فريدة تهدف إلى تحقيق عوائد مالية مجزية من خلال الاستثمار في قطاع الضيافة والفنادق. يدار الصندوق بواسطة فريق متخصص في إدارة الأصول الفندقية، مما يضمن تحسين الأداء المالي وتحقيق أفضل العوائد للمستثمرين. يتيح الصندوق للمستثمرين تنويع محافظهم الاستثمارية والاستفادة من النمو المتزايد في قطاع الضيافة. سواء كنت مستثمراً فردياً أو مؤسسة تبحث عن فرص استثمارية واعدة، يعد صندوق روائس للضيافة خياراً ممتازاً لتحقيق دخل مستقر ونمو مستدام في رأس المال.
                            </p>
                        </div>
                    </div>
                    {/* Right: modern building / sky */}
                    <div className="relative h-full min-h-[40vh] overflow-hidden">
                        <img
                            src={BUILDING_RIGHT}
                            alt=""
                            className="absolute inset-0 size-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-sky-300/20 dark:bg-slate-900/50" />
                    </div>
                </section>

                {/* Annual Reports - light blue-grey bg, right-aligned title */}
                <section className="relative py-20 px-6 bg-slate-200/80 dark:bg-slate-800/60">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-secondary dark:text-gold text-right mb-3">
                            التقارير السنوية لاستثمارات الضيافة
                        </h2>
                        <p className="text-secondary/80 dark:text-gray-400 text-right text-sm md:text-base mb-12">
                            يتم رفع التقارير بشكل دوري بعد الانتهاء من كل ربع سنة
                        </p>
                        {/* Two-column layout: left col 2021,2023 | right col 2024,2020,2022 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                            <div className="flex flex-col gap-4">
                                <a
                                    href="#"
                                    className="flex items-center justify-end gap-3 py-4 px-6 bg-white dark:bg-slate-700/90 border border-slate-200 dark:border-slate-600 rounded-xl text-secondary dark:text-gold font-bold shadow-sm hover:shadow-md transition-all duration-300 text-right"
                                >
                                    <span>تقرير السنوي 2021</span>
                                    <span className="material-icons-round text-2xl text-secondary dark:text-gold">description</span>
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center justify-end gap-3 py-4 px-6 bg-white dark:bg-slate-700/90 border border-slate-200 dark:border-slate-600 rounded-xl text-secondary dark:text-gold font-bold shadow-sm hover:shadow-md transition-all duration-300 text-right"
                                >
                                    <span>تقرير السنوي 2023</span>
                                    <span className="material-icons-round text-2xl text-secondary dark:text-gold">description</span>
                                </a>
                            </div>
                            <div className="flex flex-col gap-4">
                                <a
                                    href="#"
                                    className="flex items-center justify-end gap-3 py-4 px-6 bg-white dark:bg-slate-700/90 border border-slate-200 dark:border-slate-600 rounded-xl text-secondary dark:text-gold font-bold shadow-sm hover:shadow-md transition-all duration-300 text-right"
                                >
                                    <span>تقرير السنوي 2024</span>
                                    <span className="material-icons-round text-2xl text-secondary dark:text-gold">description</span>
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center justify-end gap-3 py-4 px-6 bg-white dark:bg-slate-700/90 border border-slate-200 dark:border-slate-600 rounded-xl text-secondary dark:text-gold font-bold shadow-sm hover:shadow-md transition-all duration-300 text-right"
                                >
                                    <span>تقرير السنوي 2020</span>
                                    <span className="material-icons-round text-2xl text-secondary dark:text-gold">description</span>
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center justify-end gap-3 py-4 px-6 bg-white dark:bg-slate-700/90 border border-slate-200 dark:border-slate-600 rounded-xl text-secondary dark:text-gold font-bold shadow-sm hover:shadow-md transition-all duration-300 text-right"
                                >
                                    <span>تقرير السنوي 2022</span>
                                    <span className="material-icons-round text-2xl text-secondary dark:text-gold">description</span>
                                </a>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Link
                                href="/investment#funds"
                                className="inline-flex items-center justify-center gap-2 py-3 px-8 rounded-xl font-bold shadow-lg transition-all duration-300 bg-[#c5a065] hover:bg-[#b89050] text-white"
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
