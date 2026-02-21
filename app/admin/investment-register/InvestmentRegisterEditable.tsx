"use client";

import React, { useState } from "react";
import type { InvestmentRegisterBlockData } from "@/app/investment/getInvestmentRegisterBlock";
import { updateInvestmentRegisterBlock } from "../investment-register-actions";

const DEFAULT_HOW_TO_STEPS = [
    { step: "01", title: "Ø§Ù„ØªØ³Ø¬ÙŠÙ„", description: "Ø³Ø¬Ù„ Ù…Ø¹Ù†Ø§ ÙˆØ§Ù†Ø´Ø¦ Ø·Ù„Ø¨ Ø§Ø³ØªØ«Ù…Ø§Ø± Ø¹Ø¨Ø± Ù…ÙˆÙ‚Ø¹Ù†Ø§ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø¨ÙƒÙ„ Ø³Ù‡ÙˆÙ„Ø©." },
    { step: "02", title: "Ø§Ø³ØªØ´Ø§Ø±Ø© Ø´Ø®ØµÙŠØ©", description: "Ù†ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ ÙˆÙ†Ù‚Ø¯Ù… Ù„Ùƒ Ø§Ø³ØªØ´Ø§Ø±Ø© Ø´Ø®ØµÙŠØ© ØªÙ„Ø¨ÙŠ Ø·Ù…ÙˆØ­Ø§ØªÙƒ Ø§Ù„Ù…Ø§Ù„ÙŠØ©." },
    { step: "03", title: "Ø§Ø®ØªØ± Ø§Ù„Ù‚Ø·Ø§Ø¹", description: "Ø§Ø®ØªØ± Ø§Ù„Ù‚Ø·Ø§Ø¹ Ø§Ù„Ù…Ø±Ø§Ø¯ Ø§Ù„Ø§Ø³ØªØ«Ù…Ø§Ø± Ù ÙŠÙ‡ ÙˆØªØµÙ Ø­ ÙƒØ§Ù Ø© Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙ‡ ÙˆØ¹ÙˆØ§Ø¦Ø¯Ù‡." },
    { step: "04", title: "Ø§Ø¨Ø¯Ø£ Ø§Ù„Ø§Ø³ØªØ«Ù…Ø§Ø±", description: "Ø§Ø¨Ø¯Ø£ Ø§Ø³ØªØ«Ù…Ø§Ø±Ùƒ Ø§Ù„Ø¢Ù† ÙˆØ§Ø­ØµÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ø¹ÙˆØ§Ø¦Ø¯ Ø§Ù„Ø±Ø¨Ø­ÙŠØ© Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø© Ø¨Ø°ÙƒØ§Ø¡." },
];

const DEFAULT_FUND_CARDS = [
    { title: "صندوق رواد للضيافة", href: "/hospitalityfund" },
    { title: "صندوق رواد لتأجير السيارات", href: "/carrentalfund" },
    { title: "صندوق رواد للاستقدام", href: "/carrentalfund" },
];

const DEFAULT_HOW_TO_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDAfJgwgYRZXLxGtNYJjEjtBnzIFOPutaVkD4yL8Ex77GnSQS2AtMuraoDg6OhOVMePfbBMLd6cf91TLdkgDbaIM_f_vJVS0O4_92NCsT4B1QPqvbpyzNNB-1-k73VqrPgZ5UhcI7-h2ns84DOItX0eOUPl-R2Mfb1pymyYDp5YafbotAlzNDVCu-9j0WaPMgCuH3TXs0JMD81hug0PTvx252HeWLNlbGjNI9cM5x5I9ijUohVOGykKZXsQt7ipYSV6MZll2YaQ5l4";

type Props = {
    block: InvestmentRegisterBlockData | null;
};

export function InvestmentRegisterEditable({ block }: Props) {
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const b = block ?? null;
    const howToTitle = b?.howToTitle ?? "كيفية البدء";
    const howToSubtitle = b?.howToSubtitle ?? "خطوات بسيطة لتبدأ رحلتك الاستثمارية معنا في مجموعة رواس";
    const howToImageUrl = b?.howToImageUrl ?? DEFAULT_HOW_TO_IMAGE;
    const howToSteps = [
        { step: "01", title: b?.step1Title ?? "التسجيل", description: b?.step1Description ?? "سجل معنا وانهي اجراءات التسجيل بكل سهولة عبر موقعنا الالكتروني" },
        { step: "02", title: b?.step2Title ?? "الاستشارة الشخصية", description: b?.step2Description ?? "سنتواصل معك ونقدم لك استشارة شخصية تلبي طموحاتك المالية" },
        { step: "03", title: b?.step3Title ?? "اختر القطاع", description: b?.step3Description ?? "اختر القطاع المراد الاستثمار فيه وتصفح كافة معلوماته وعوائده" },
        { step: "04", title: b?.step4Title ?? "ابدأ الاستثمار", description: b?.step4Description ?? "ابدأ استثمارك الآن واحصل على العوائد الربحية المتوقعة بذكاء" },
    ];
    const registerHeading = b?.registerHeading ?? "امتداد عريق بخبرة تجاوزت الثلاثة عقود";
    const registerSubheading = b?.registerSubheading ?? "الصناديق الاستثمارية";
    const registerFormTitle = b?.registerFormTitle ?? "سجل اهتمامك واستثمر معنا";
    const fundCards = [
        { title: b?.fund1Title ?? DEFAULT_FUND_CARDS[0].title, href: b?.fund1Href ?? DEFAULT_FUND_CARDS[0].href },
        { title: b?.fund2Title ?? DEFAULT_FUND_CARDS[1].title, href: b?.fund2Href ?? DEFAULT_FUND_CARDS[1].href },
        { title: b?.fund3Title ?? DEFAULT_FUND_CARDS[2].title, href: b?.fund3Href ?? DEFAULT_FUND_CARDS[2].href },
    ];

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const result = await updateInvestmentRegisterBlock(formData);
        if (result.success) {
            setMessage("تم حفظ بيانات نموذج استثمر معنا.");
        } else {
            setError(result.error || "حدث خطأ أثناء الحفظ.");
        }
        setIsSubmitting(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary dark:text-white">نموذج استثمر معنا</h1>
                    <p className="text-gray-500 mt-1">
                        نفس المنظر المعروض في صفحة الاستثمار — قم بتعديل النصوص والروابط ثم احفظ.
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-60"
                >
                    {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
            </header>

            {message && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 px-4 py-3 text-emerald-700 dark:text-emerald-300 text-sm">
                    {message}
                </div>
            )}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            <section className="relative bg-white dark:bg-background-dark pt-16 pb-32 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                        <div className="md:w-1/2 order-2 md:order-1 space-y-3">
                            <img
                                alt="Financial Growth Illustration"
                                className="w-full h-auto max-w-md mix-blend-multiply opacity-80 dark:opacity-40 filter grayscale"
                                src={howToImageUrl}
                            />
                            <div className="space-y-2 text-right">
                                <label className="block text-sm font-bold text-secondary dark:text-gray-200">رابط الصورة</label>
                                <input
                                    name="howToImageUrl"
                                    defaultValue={howToImageUrl}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="md:w-1/2 text-right order-1 md:order-2 space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-secondary dark:text-gray-200">العنوان الرئيسي</label>
                                <input
                                    name="howToTitle"
                                    defaultValue={howToTitle}
                                    className="w-full text-3xl md:text-4xl font-bold text-gold bg-transparent border-b-2 border-gold/30 focus:border-gold outline-none py-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-secondary dark:text-gray-200">الوصف</label>
                                <textarea
                                    name="howToSubtitle"
                                    defaultValue={howToSubtitle}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm min-h-[120px]"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-right">
                        {howToSteps.map((item, index) => (
                            <div
                                key={item.step}
                                className="group border-r-2 border-gold/20 pr-6"
                            >
                                <span className="text-5xl font-bold text-gold opacity-60 block mb-4">
                                    {item.step}
                                </span>
                                <input
                                    name={`step${index + 1}Title`}
                                    defaultValue={item.title}
                                    className="w-full text-xl font-bold text-secondary dark:text-gold bg-transparent border-b-2 border-gold/30 focus:border-gold outline-none mb-3"
                                />
                                <textarea
                                    name={`step${index + 1}Description`}
                                    defaultValue={item.description}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm min-h-[120px]"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gold diagonal-wave" />
            </section>

            <section className="relative bg-desert pt-24 pb-20 px-6 rounded-3xl overflow-hidden">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-12 space-y-3">
                        <input
                            name="registerHeading"
                            defaultValue={registerHeading}
                            className="w-full text-3xl md:text-4xl font-bold text-white text-center bg-transparent border-b-2 border-white/40 focus:border-white outline-none py-2"
                        />
                        <input
                            name="registerSubheading"
                            defaultValue={registerSubheading}
                            className="w-full text-2xl md:text-3xl font-bold text-gold text-center bg-transparent border-b-2 border-gold/40 focus:border-gold outline-none py-2"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {fundCards.map((card, index) => (
                            <div
                                key={card.title}
                                className="bg-corporate/90 rounded-xl p-6 text-center border-b-4 border-gold shadow-xl space-y-4"
                            >
                                <input
                                    name={`fund${index + 1}Title`}
                                    defaultValue={card.title}
                                    className="w-full bg-transparent text-white font-bold text-center border-b border-white/40 focus:border-white outline-none pb-1"
                                />
                                <input
                                    name={`fund${index + 1}Href`}
                                    defaultValue={card.href}
                                    className="w-full bg-transparent text-gold text-xs text-center border-b border-gold/50 focus:border-gold outline-none pb-1"
                                />
                                <div className="text-gold text-xs flex items-center justify-center gap-1">
                                    اقرأ المزيد
                                    <span className="material-icons-round text-sm">arrow_back</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="glass-panel rounded-xl p-8 md:p-12">
                        <div className="bg-corporate py-3 px-8 rounded-full w-fit mx-auto mb-10 -mt-16 shadow-lg">
                            <input
                                name="registerFormTitle"
                                defaultValue={registerFormTitle}
                                className="bg-transparent text-white font-bold text-center outline-none"
                            />
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 text-right">
                                    <label className="block text-white text-sm font-bold pr-2">الاسم الاول</label>
                                    <input
                                        disabled
                                        className="w-full bg-gold/60 border-none rounded-lg py-3 px-4 text-secondary/70"
                                        placeholder="الاسم الاول"
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="block text-white text-sm font-bold pr-2">الاسم الاخير</label>
                                    <input
                                        disabled
                                        className="w-full bg-gold/60 border-none rounded-lg py-3 px-4 text-secondary/70"
                                        placeholder="العائلة"
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="block text-white text-sm font-bold pr-2">البريد الالكتروني</label>
                                    <input
                                        disabled
                                        className="w-full bg-gold/60 border-none rounded-lg py-3 px-4 text-secondary/70"
                                        placeholder="example@domain.com"
                                        type="email"
                                    />
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="block text-white text-sm font-bold pr-2">
                                        رقم الجوال <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        disabled
                                        className="w-full bg-gold/60 border-none rounded-lg py-3 px-4 text-secondary/70"
                                        dir="ltr"
                                        placeholder="05XXXXXXXX"
                                        type="tel"
                                    />
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="block text-white text-sm font-bold pr-2">صناديق الاستثمار</label>
                                    <select
                                        disabled
                                        className="w-full bg-gold/60 border-none rounded-lg py-3 px-4 text-secondary/70 appearance-none"
                                    >
                                        <option>اختر الصندوق</option>
                                    </select>
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="block text-white text-sm font-bold pr-2">المبلغ الاستثماري</label>
                                    <select
                                        disabled
                                        className="w-full bg-gold/60 border-none rounded-lg py-3 px-4 text-secondary/70 appearance-none"
                                    >
                                        <option>نطاق الاستثمار</option>
                                    </select>
                                </div>
                            </div>

                            <div className="text-center pt-6">
                                <button
                                    type="button"
                                    className="bg-gold text-secondary font-bold px-12 py-3 rounded-full shadow-lg opacity-80 cursor-not-allowed"
                                >
                                    ارسل
                                </button>
                            </div>
                            <p className="text-center text-white/80 text-xs">
                                حقول النموذج معينة فقط — ليست قابلة للتعديل من هنا.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </form>
    );
}
