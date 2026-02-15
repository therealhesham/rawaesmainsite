"use client";

import React, { useState } from "react";
import Link from "next/link";

const HOW_TO_STEPS = [
    {
        step: "01",
        title: "التسجيل",
        description: "سجل معنا وانشئ طلب استثمار عبر موقعنا الإلكتروني بكل سهولة.",
    },
    {
        step: "02",
        title: "استشارة شخصية",
        description: "نتواصل معك ونقدم لك استشارة شخصية تلبي طموحاتك المالية.",
    },
    {
        step: "03",
        title: "اختر القطاع",
        description: "اختر القطاع المراد الاستثمار فيه وتصفح كافة معلوماته وعوائده.",
    },
    {
        step: "04",
        title: "ابدأ الاستثمار",
        description: "ابدأ استثمارك الآن واحصل على العوائد الربحية المتوقعة بذكاء.",
    },
];

const FUND_CARDS = [
    { title: "صندوق روائس للضيافة", href: "/rawaeshotels" },
    { title: "صندوق روائس لتأجير السيارات", href: "https://rent.rawaes.com" },
    { title: "صندوق روائس للاستقدام", href: "https://rec.rawaes.com" },
];

const HOW_TO_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDAfJgwgYRZXLxGtNYJjEjtBnzIFOPutaVkD4yL8Ex77GnSQS2AtMuraoDg6OhOVMePfbBMLd6cf91TLdkgDbaIM_f_vJVS0O4_92NCsT4B1QPqvbpyzNNB-1-k73VqrPgZ5UhcI7-h2ns84DOItX0eOUPl-R2Mfb1pymyYDp5YafbotAlzNDVCu-9j0WaPMgCuH3TXs0JMD81hug0PTvx252HeWLNlbGjNI9cM5x5I9ijUohVOGykKZXsQt7ipYSV6MZll2YaQ5l4";

export function InvestmentHowToSection() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        // TODO: wire to API or form backend
        setTimeout(() => setIsSubmitting(false), 1000);
    };

    return (
        <>
            {/* كيفية البدء */}
            <section className="relative bg-white dark:bg-background-dark pt-16 pb-32">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                        <div className="md:w-1/2 order-2 md:order-1">
                            <img
                                alt="Financial Growth Illustration"
                                className="w-full h-auto max-w-md mix-blend-multiply opacity-80 dark:opacity-40 filter grayscale hover:grayscale-0 transition duration-500"
                                src={HOW_TO_IMAGE}
                            />
                        </div>
                        <div className="md:w-1/2 text-right order-1 md:order-2">
                            <h2 className="text-4xl md:text-5xl font-bold text-gold mb-4 leading-tight">
                                كيفية البدء
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                خطوات بسيطة لتبدأ رحلتك الاستثمارية معنا في مجموعة روائس
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-right">
                        {HOW_TO_STEPS.map((item) => (
                            <div
                                key={item.step}
                                className="group border-r-2 border-gold/20 pr-6 hover:border-gold transition-colors"
                            >
                                <span className="text-5xl font-bold text-gold opacity-60 group-hover:opacity-100 block mb-4">
                                    {item.step}
                                </span>
                                <h3 className="text-xl font-bold text-secondary dark:text-gold mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gold diagonal-wave" />
            </section>

            {/* الصناديق + نموذج سجل اهتمامك */}
            <section className="relative bg-desert pt-24 pb-20 px-6" id="contact">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                            امتداد عريق بخبرة تجاوزت الثلاثة عقود
                        </h2>
                        <h3 className="text-2xl md:text-3xl font-bold text-gold drop-shadow-md">
                            الصناديق الاستثمارية
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {FUND_CARDS.map((card) => (
                            <div
                                key={card.title}
                                className="bg-corporate/90 rounded-xl p-6 text-center border-b-4 border-gold shadow-xl transform hover:-translate-y-2 transition duration-300"
                            >
                                <h4 className="text-white font-bold mb-4">{card.title}</h4>
                                <Link
                                    href={card.href}
                                    className="text-gold text-xs flex items-center justify-center gap-1 hover:underline"
                                    {...(card.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                >
                                    اقرأ المزيد
                                    <span className="material-icons-round text-sm">arrow_back</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                    <div className="glass-panel rounded-xl p-8 md:p-12">
                        <div className="bg-corporate py-3 px-8 rounded-full w-fit mx-auto mb-10 -mt-16 shadow-lg">
                            <h4 className="text-white font-bold">سجل اهتمامك واستثمر معنا</h4>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 text-right">
                                    <label className="block text-white text-sm font-bold pr-2">الاسم</label>
                                    <input
                                        name="firstName"
                                        className="w-full bg-gold/80 border-none rounded-lg focus:ring-2 focus:ring-gold py-3 px-4 text-secondary placeholder-secondary/60"
                                        placeholder="الاسم الأول"
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="block text-white text-sm font-bold pr-2">الاسم الأخير</label>
                                    <input
                                        name="lastName"
                                        className="w-full bg-gold/80 border-none rounded-lg focus:ring-2 focus:ring-gold py-3 px-4 text-secondary placeholder-secondary/60"
                                        placeholder="العائلة"
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="block text-white text-sm font-bold pr-2">البريد الإلكتروني</label>
                                    <input
                                        name="email"
                                        className="w-full bg-gold/80 border-none rounded-lg focus:ring-2 focus:ring-gold py-3 px-4 text-secondary placeholder-secondary/60"
                                        placeholder="example@domain.com"
                                        type="email"
                                    />
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="block text-white text-sm font-bold pr-2">
                                        رقم الجوال <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        name="phone"
                                        required
                                        className="w-full bg-gold/80 border-none rounded-lg focus:ring-2 focus:ring-gold py-3 px-4 text-secondary placeholder-secondary/60"
                                        dir="ltr"
                                        placeholder="05XXXXXXXX"
                                        type="tel"
                                    />
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="block text-white text-sm font-bold pr-2">صناديق الاستثمار</label>
                                    <select
                                        name="fund"
                                        className="w-full bg-gold/80 border-none rounded-lg focus:ring-2 focus:ring-gold py-3 px-4 text-secondary appearance-none"
                                    >
                                        <option value="">اختر الصندوق</option>
                                        <option value="hospitality">صندوق الضيافة</option>
                                        <option value="cars">صندوق السيارات</option>
                                        <option value="recruitment">صندوق الاستقدام</option>
                                    </select>
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="block text-white text-sm font-bold pr-2">المبلغ الاستثماري</label>
                                    <select
                                        name="amount"
                                        className="w-full bg-gold/80 border-none rounded-lg focus:ring-2 focus:ring-gold py-3 px-4 text-secondary appearance-none"
                                    >
                                        <option value="">نطاق الاستثمار</option>
                                        <option value="50-100">50,000 - 100,000</option>
                                        <option value="100-500">100,000 - 500,000</option>
                                        <option value="500+">أكثر من 500,000</option>
                                    </select>
                                </div>
                            </div>
                        
                            <div className="text-center pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-gold hover:bg-[#d8ae6d] text-secondary font-bold px-12 py-3 rounded-full shadow-lg transition duration-300 transform hover:scale-105 disabled:opacity-70"
                                >
                                    {isSubmitting ? "جاري الإرسال..." : "ارسال"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}
