"use client";

import React from "react";
import { motion } from "framer-motion";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BannerHeroSection } from "../components/BannerHeroSection";
import { InvestmentHowToSection } from "../components/InvestmentHowToSection";
import { ThemeToggle } from "../rawaeshotels/ThemeToggle";
import { InvestmentFundsSection } from "../components/InvestmentFundsSection";
import { useSearchParams } from "next/navigation";
import type { FundsData } from "./getFunds";

const HOTEL_BRANDS = [
    { icon: "diamond", name: "Rest In Hotel" },
    { icon: "bed", name: "Resan Hotel" },
    { icon: "star", name: "Rawaes Hotel" },
    { icon: "wb_sunny", name: "Shams Hotel" },
];

const HOSPITALITY_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCj4ygmIs_eB2rNZI9TW4i4vXoUlIU-2nGsdTKJMLLv0j7qqyNAc9nB2029wLwXa7lhJrgCQObkG6Sx-o2Ct4_LPAlhqZeGCcKeJNZ7dGDNijkTMtIJ9bpipRLPYW-FT-zKPyQUy5dZsO7UWVlJSrGsYk0I6mR1dg9arDs1VsQZkC8oWT__9zKJ5t-ShzVL1F0KBYjq3N5cTgUWkw94rG6HLpPnn_HN3nwu480rcsjzNevxyx5dNSMzUwCL-95zi0wFkJHcVU2E1ss";

const CARS_IMAGE = "/CarLeasing.avif";
const RECRUITMENT_IMAGE = "istiqdam.avif";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" as const }
    }
};

type FundTab = { id: string; label: string };

type InvestmentPageContentProps = {
    tabs: FundTab[];
    funds: FundsData;
};

function buildHospitalityStats(fund: FundsData["hospitality"]) {
    if (!fund) {
        return [
            { icon: "groups", value: "100+", label: "القوة العاملة" },
            { icon: "restaurant_menu", value: "8+", label: "المرافق المتنوعة" },
            { icon: "king_bed", value: "500+", label: "عدد الغرف" },
            { icon: "apartment", value: "5", label: "عدد الفنادق" },
        ];
    }
    return [
        { icon: "groups", value: fund.homemaidsCound ?? "—", label: "القوة العاملة" },
        { icon: "restaurant_menu", value: "8+", label: "المرافق المتنوعة" },
        { icon: "king_bed", value: fund.contractsCount ?? "—", label: "عدد الغرف" },
        { icon: "apartment", value: String(fund.branches), label: "عدد الفنادق" },
    ];
}

function buildRecruitmentStats(fund: FundsData["recruitment"]) {
    if (!fund) {
        return [
            { icon: "location_city", value: "1", label: "عدد الفروع" },
            { icon: "description", value: "+100", label: "عدد العقود في الشهر" },
            { icon: "group_add", value: "+900", label: "عدد العمال" },
            { icon: "workspace_premium", value: "+4", label: "تقييمنا على مساند" },
        ];
    }
    return [
        { icon: "location_city", value: String(fund.branches), label: "عدد الفروع" },
        { icon: "description", value: fund.contractsCount ?? "—", label: "عدد العقود في الشهر" },
        { icon: "group_add", value: fund.homemaidsCound ?? "—", label: "عدد العمال" },
        { icon: "workspace_premium", value: fund.musanadRating ?? "—", label: "تقييمنا على مساند" },
    ];
}

function buildCarsStats(fund: FundsData["cars"]) {
    if (!fund) {
        return [
            { icon: "car_rental", value: "+50", label: "عملية تأجير في اليوم" },
            { icon: "support_agent", value: "+6", label: "الخدمات المتوفرة" },
            { icon: "directions_car", value: "+350", label: "عدد السيارات" },
            { icon: "store", value: "7", label: "عدد الفروع" },
        ];
    }
    return [
        { icon: "car_rental", value: fund.daysRental ?? "—", label: "عملية تأجير في اليوم" },
        { icon: "support_agent", value: fund.availableServices ?? "—", label: "الخدمات المتوفرة" },
        { icon: "directions_car", value: fund.avaiableCars ?? "—", label: "عدد السيارات" },
        { icon: "store", value: String(fund.branches), label: "عدد الفروع" },
    ];
}

export function InvestmentPageContent({ tabs, funds }: InvestmentPageContentProps) {
    const [activeTab, setActiveTab] = React.useState(tabs[0]?.id ?? "hospitality");
    const searchParams = useSearchParams();

    React.useEffect(() => {
        const fund = searchParams.get("fund");
        if (fund && tabs.some((t) => t.id === fund)) {
            setActiveTab(fund);
            setTimeout(() => {
                const section = document.getElementById("funds");
                if (section) section.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [searchParams, tabs]);

    const hospitalityStats = buildHospitalityStats(funds.hospitality);
    const recruitmentStats = buildRecruitmentStats(funds.recruitment);
    const carsStats = buildCarsStats(funds.cars);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light transition-colors duration-300 font-[family-name:var(--font-cairo)]">
            <Header />

            <main>
                <style jsx global>{`
          .sepia-filter {
            filter: sepia(0.6) contrast(1.1);
          }
          .skyline-footer {
            background-image: url(https://lh3.googleusercontent.com/aida-public/AB6AXuDPhqGAvQjd7MKBvalxiL4rN0VUnD7DmD0vXG0ypN9sfkN27Icutt_lwkGE_th4u6mZoM1SooWPIoT4YJXIn0ympS8P28bidLG4MKwapAQMakKNIM5EPz1a30QHdlJGbPa-zZhyUXNd9a4fGla-0mHAcaqly4gVyTn3XhrC-mtlp77ABpyjmgJDXSrBS8hD5OQYSzZr64VYaG5bEwCvzGA2dL_d_pqA72PBhGoLLqf8VJa53GuszrhIx1WpvvTyqMQA4Aekq00nOmc);
            background-size: contain;
            background-position: bottom;
            background-repeat: repeat-x;
          }
        `}</style>

                <BannerHeroSection
                    bannerSrc="/wallpaper.png"
                    bannerAlt="Rawaes Wallpaper"
                    logoSrc="/investmentlogo.png"
                    logoAlt="روائس للاستثمار"
                    title="روائس للاستثمار"
                    description="نوفر خدمات استثمارية شاملة تشمل إدارة المحافظ الاستثمارية، وتقييم الفرص الاستثمارية، وتقديم الاستشارات المالية. نتميز بفريق من الخبراء المتخصصين في مجالات استثمارية متعددة، يعملون بإتقان على تحقيق أهداف العملاء وتعزيز أداء استثماراتهم."
                />

                <motion.section
                    className="py-20 bg-slate-50 dark:bg-brand-teal/20 relative overflow-hidden"
                    id="services"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                >
                    <div className="container mx-auto px-6 relative z-10">
                        <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center text-primary mb-16">
                            خدماتنا
                        </motion.h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <motion.div variants={itemVariants} className="bg-white dark:bg-brand-teal-light rounded-xl overflow-hidden shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-slate-800">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        alt="Property Management"
                                        className="w-full h-full object-cover sepia-filter"
                                        src="/bernard.avif"
                                    />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-brand-teal dark:text-primary mb-4">
                                        ادارة العقارات
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                        نضمن إدارة عقارية فعالة وفعالة لضمان قيمة عالية لكل عميل.
                                        نحن نهتم بممتلكاتك ونعمل جاهدين على تلبية احتياجاتك
                                        ومتطلباتك. تواصل معنا اليوم لتجد خدمات إدارة العقارات التي
                                        تلبي توقعاتك.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div variants={itemVariants} className="bg-white dark:bg-brand-teal-light rounded-xl overflow-hidden shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-slate-800">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        alt="Real Estate Development"
                                        className="w-full h-full object-cover sepia-filter"
                                        src="paulina.avif"
                                    />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-brand-teal dark:text-primary mb-4">
                                        التطوير العقاري
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                        نحن نتعهد بتقديم خدمات تطوير العقارات بروح الابتكار والاهتمام
                                        بأدق التفاصيل. فريق المستشارين العقاريين لدينا الذي يمتلك
                                        خبرة واسعة في صناعة العقارات والإدارة يعمل بجد لإيجاد فرص
                                        استثمارية ومشاريع تناسب مختلف احتياجات عملائنا.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div variants={itemVariants} className="bg-white dark:bg-brand-teal-light rounded-xl overflow-hidden shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-slate-800">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        alt="Real Estate Investment"
                                        className="w-full h-full object-cover sepia-filter"
                                        src="/hideobara.avif"
                                    />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-brand-teal dark:text-primary mb-4">
                                        الاستثمار العقاري
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                        ندرك تماماً أن الاستثمار في القطاع العقاري لا يمثل فقط خطوة
                                        استثمارية بل يمثل جزءاً حيوياً من رحلة النجاح المالي. لهذا
                                        السبب، أسسنا فريقاً متخصصاً مكرساً لدراسة فرص الاستثمار
                                        العقاري بكل تفصيل ودقة.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    className="h-[500px] flex flex-col md:flex-row"
                    id="values"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="flex-1  bg-[#022530] text-white p-12 flex flex-col justify-between relative group overflow-hidden">
                        <div className="z-10 relative">
                            <h3 className="text-3xl font-bold text-white mb-6">تفاؤل</h3>
                            <p className="text-slate-300 text-white leading-relaxed max-w-sm">
                                نحن هنا لنتخذ خطوات جريئة. ننظر إلى المستقبل بعيون مشرقة.
                                ونجمع قوانا لبناء واقع ملهم يتحدى المألوف. بكل تفاؤل وإصرار، نضع
                                بصمتنا في بناء غد يتسم بالتفرد والتميز.
                            </p>
                        </div>
                        <div className="absolute inset-0  transition-opacity duration-500">
                            <img
                                alt="Construction detail"
                                className="w-full h-full object-cover"
                                src="/investment/investment1.png"
                            />
                        </div>
                        <div className="z-10 mt-12 self-start">
                            <div className="w-12 h-1 bg-primary"></div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex-1  bg-primary text-brand-teal p-12 flex flex-col justify-between relative group overflow-hidden">
                        <div className="z-10 relative">
                            <h3 className="text-3xl font-bold mb-6">إلهام</h3>
                            <p className="text-brand-teal/80 leading-relaxed max-w-sm">
                                نضع جميع طاقاتنا في تحقيق رؤيتنا. ونعتبر كل تحد جديد فرصة
                                للتطور والابتكار. إن اسمنا ليس مجرد علامة تجارية، بل هو رمز
                                للإبداع والاجتهاد. نحن نسعى لفرض اسمنا بفخر في سماء الإبداع، حيث
                                يتلاقى الأصالة بالحداثة وينسجم التقليد مع التطور.
                            </p>
                        </div>
                        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                            <img
                                alt="Modern Architecture"
                                className="w-full h-full object-cover"
                                src="/investment/investment2.png"
                            />
                        </div>
                        <div className="z-10 mt-12 self-start">
                            <div className="w-12 h-1 bg-brand-teal"></div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex-1  bg-[#003749] text-white p-12 flex flex-col justify-between relative group overflow-hidden">
                        <div className="z-10 relative">
                            <h3 className="text-3xl font-bold mb-6">ابتكارية</h3>
                            <p className="text-white leading-relaxed max-w-sm">
                                من خلال تفعيل تلك الرؤية، نجحت الشركة في بناء سمعة قوية
                                واستقطاب انتباه العملاء والشركاء على حد سواء. واستناداً إلى
                                أسسها القوية اتخذت الشركة من التكنولوجيا والابتكار جزءاً أساسياً
                                من استراتيجيتها، مما ساهم في تسهيل تجربة العملاء وتوفير حلول
                                فعالة لاحتياجاتهم المتنوعة في مجال العقارات.
                            </p>
                        </div>
                        <div className="absolute inset-0 transition-opacity duration-500">
                            <img
                                alt="Innovative building"
                                className="w-full h-full object-cover"
                                src="/investment/investment3.png"
                            />
                        </div>
                        <div className="z-10 mt-12 self-start">
                            <div className="w-12 h-1 bg-primary"></div>
                        </div>
                    </motion.div>
                </motion.section>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                >
                    <InvestmentFundsSection
                        title="صناديق روائس للاستثمار"
                        tabs={tabs}
                        defaultTabId={tabs[0]?.id}
                        activeTabId={activeTab}
                        onTabChange={setActiveTab}
                        id="funds"
                    >
                        {(activeTabId) => (
                            <>
                                {activeTabId === "hospitality" && (
                                    <>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
                                            <div className="rounded-3xl overflow-hidden shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                                                <img
                                                    alt="Modern Architecture Skyscraper"
                                                    className="w-full h-[400px] object-cover contrast-125 brightness-90 grayscale hover:grayscale-0 transition-all duration-700"
                                                    src={HOSPITALITY_IMAGE}
                                                />
                                            </div>
                                            <div className="text-secondary dark:text-white space-y-6">
                                                <h3 className="text-3xl font-bold border-r-4 border-gold pr-4">
                                                    صندوق روائس للضيافة
                                                </h3>
                                                <p className="text-lg leading-relaxed text-secondary/80 dark:text-gray-300 text-justify">
                                                    إن الضيافة من الخدمات التي تعتني بها المجموعة وتتطور من خلالها وتبني مجموعة روائس هيكلة داخلية متقنة التسلسل لتيسير العمل على راحة النزلاء وتضم المجموعة فنادق معروفة مثل:
                                                    <br />
                                                    <span className="font-bold text-gold">
                                                        فندق رست إن - فندق شمس - فندق روائس - فندق ريسان
                                                    </span>
                                                </p>
                                                <div className="pt-4">
                                                    <h4 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gold">
                                                        <span className="w-8 h-[2px] bg-gold" />
                                                        حجم الاستثمار
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                                            {hospitalityStats.map((stat) => (
                                                <div
                                                    key={stat.label}
                                                    className="bg-white dark:bg-slate-800 p-8 rounded-[32px] text-center shadow-lg hover:-translate-y-2 transition-transform duration-300 group"
                                                >
                                                    <div className="bg-gold/10 dark:bg-slate-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gold transition-colors duration-300">
                                                        <span className="material-icons-round text-gold group-hover:text-white text-4xl">
                                                            {stat.icon}
                                                        </span>
                                                    </div>
                                                    <div className="text-4xl font-bold text-gold mb-1">
                                                        {stat.value}
                                                    </div>
                                                    <div className="text-secondary dark:text-gold font-medium">
                                                        {stat.label}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-3xl border border-white/20">
                                            <div className="flex flex-wrap justify-center items-center gap-10 grayscale hover:grayscale-0 transition-all duration-500 opacity-80 hover:opacity-100">
                                                {HOTEL_BRANDS.map((brand) => (
                                                    <div key={brand.name} className="flex flex-col items-center">
                                                        <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mb-1 text-gold">
                                                            <span className="material-icons-round">{brand.icon}</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-secondary dark:text-gray-300 uppercase">
                                                            {brand.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <a
                                                href="/hospitalityfund"
                                                className="bg-corporate hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all duration-300 group shadow-xl"
                                            >
                                                <span>أعرف أكثر عن صندوق روائس للضيافة</span>
                                                <span className="material-icons-round transform group-hover:-translate-x-1 transition-transform">
                                                    chevron_left
                                                </span>
                                            </a>
                                        </div>
                                    </>
                                )}
                                {activeTabId === "recruitment" && (
                                    <>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
                                            <div className="rounded-3xl overflow-hidden shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                                                <img
                                                    alt="International flags - global reach"
                                                    className="w-full h-[400px] object-cover contrast-125 brightness-90 grayscale hover:grayscale-0 transition-all duration-700"
                                                    src={RECRUITMENT_IMAGE}
                                                />
                                            </div>
                                            <div className="text-secondary dark:text-white space-y-6">
                                                <h3 className="text-3xl font-bold border-r-4 border-gold pr-4">
                                                    صندوق روائس للاستقدام
                                                </h3>
                                                <p className="text-lg leading-relaxed text-secondary/80 dark:text-gray-300 text-justify">
                                                    نفخر بتقديم خدمات استقدام العمالة المنزلية بجودة عالية لتلبية احتياجات منازلكم وضمان راحتكم. نحن فريق من الخبراء ملتزمون بتقديم حل شامل للأسر والأفراد الراغبين في خدمات منزلية موثوقة واحترافية.
                                                </p>
                                                <div className="pt-4">
                                                    <h4 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gold">
                                                        <span className="w-8 h-[2px] bg-gold" />
                                                        حجم الاستثمار
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                                            {recruitmentStats.map((stat) => (
                                                <div
                                                    key={stat.label}
                                                    className="bg-white dark:bg-slate-800 p-8 rounded-[32px] text-center shadow-lg hover:-translate-y-2 transition-transform duration-300 group"
                                                >
                                                    <div className="bg-gold/10 dark:bg-slate-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gold transition-colors duration-300">
                                                        <span className="material-icons-round text-gold group-hover:text-white text-4xl">
                                                            {stat.icon}
                                                        </span>
                                                    </div>
                                                    <div className="text-4xl font-bold text-gold mb-1">
                                                        {stat.value}
                                                    </div>
                                                    <div className="text-secondary dark:text-gold font-medium">
                                                        {stat.label}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-3xl border border-white/20">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center text-gold">
                                                    <span className="material-icons-round text-4xl">person</span>
                                                </div>
                                                <span className="font-bold text-secondary dark:text-gray-300">روائس للاستقدام</span>
                                                <span className="text-sm text-secondary/70 dark:text-gray-400">Rawaes Recruitment</span>
                                            </div>
                                            <a
                                                href="/recruitmentfund"
                                                className="bg-corporate hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all duration-300 group shadow-xl"
                                            >
                                                <span>أعرف أكثر عن صندوق روائس للاستقدام</span>
                                                <span className="material-icons-round transform group-hover:-translate-x-1 transition-transform">
                                                    chevron_left
                                                </span>
                                            </a>
                                        </div>
                                    </>
                                )}
                                {activeTabId === "cars" && (
                                    <>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
                                            <div className="rounded-3xl overflow-hidden shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                                                <img
                                                    alt="Rawaes car rental fleet"
                                                    className="w-full h-[400px] object-cover contrast-125 brightness-90 grayscale hover:grayscale-0 transition-all duration-700"
                                                    src={CARS_IMAGE}
                                                />
                                            </div>
                                            <div className="text-secondary dark:text-white space-y-6">
                                                <h3 className="text-3xl font-bold border-r-4 border-gold pr-4">
                                                    صندوق روائس لتأجير السيارات
                                                </h3>
                                                <p className="text-lg leading-relaxed text-secondary/80 dark:text-gray-300 text-justify">
                                                    نقدم لكم تشكيلة واسعة من السيارات تناسب مختلف الفئات والميزانيات، مع خدمات موثوقة ومريحة. نوفر خيارات التأمين والمساعدة على الطريق، وأسطولاً حديثاً مع صيانة دورية لضمان راحتكم وأمانكم.
                                                </p>
                                                <div className="pt-4">
                                                    <h4 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gold">
                                                        <span className="w-8 h-[2px] bg-gold" />
                                                        حجم الاستثمار
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                                            {carsStats.map((stat) => (
                                                <div
                                                    key={stat.label}
                                                    className="bg-white dark:bg-slate-800 p-8 rounded-[32px] text-center shadow-lg hover:-translate-y-2 transition-transform duration-300 group"
                                                >
                                                    <div className="bg-gold/10 dark:bg-slate-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gold transition-colors duration-300">
                                                        <span className="material-icons-round text-gold group-hover:text-white text-4xl">
                                                            {stat.icon}
                                                        </span>
                                                    </div>
                                                    <div className="text-4xl font-bold text-gold mb-1">
                                                        {stat.value}
                                                    </div>
                                                    <div className="text-secondary dark:text-gold font-medium">
                                                        {stat.label}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-3xl border border-white/20">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center text-gold">
                                                    <span className="material-icons-round text-4xl">directions_car</span>
                                                </div>
                                                <span className="font-bold text-secondary dark:text-gray-300">روائس لتأجير السيارات</span>
                                                <span className="text-sm text-secondary/70 dark:text-gray-400">Rawaes Rent Cars</span>
                                            </div>
                                            <a
                                                href="/carrentalfund"
                                                className="bg-corporate hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all duration-300 group shadow-xl"
                                            >
                                                <span>أعرف أكثر عن صندوق روائس لتأجير السيارات</span>
                                                <span className="material-icons-round transform group-hover:-translate-x-1 transition-transform">
                                                    chevron_left
                                                </span>
                                            </a>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </InvestmentFundsSection>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={itemVariants}
                >
                    <InvestmentHowToSection />
                </motion.div>
            </main>

            <Footer />

            <div className="fixed bottom-8 right-8 z-50">
                <ThemeToggle />
            </div>
        </div>
    );
}
