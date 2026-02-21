"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { InvestmentRegisterBlockData } from "@/app/investment/getInvestmentRegisterBlock";
import { updateInvestmentRegisterBlock, uploadInvestmentRegisterHowToImage } from "../investment-register-actions";

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

/** صورة افتراضية عند عدم وجود رفع */
const DEFAULT_HOW_TO_IMAGE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' text-anchor='middle' dy='.3em'%3Eصورة%3C/text%3E%3C/svg%3E";

type Props = {
    block: InvestmentRegisterBlockData | null;
};

export function InvestmentRegisterEditable({ block }: Props) {
    const router = useRouter();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const b = block ?? null;
    const howToTitle = b?.howToTitle ?? "كيفية البدء";
    const howToSubtitle = b?.howToSubtitle ?? "خطوات بسيطة لتبدأ رحلتك الاستثمارية معنا في مجموعة رواس";
    const howToImageUrl = b?.howToImageUrlDisplay ?? b?.howToImageUrl ?? DEFAULT_HOW_TO_IMAGE;
    const displayImageUrl = previewUrl ?? howToImageUrl;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);
    const howToSteps = [
        { step: "01", title: b?.step1Title ?? "التسجيل", description: b?.step1Description ?? "سجل معنا وانهي اجراءات التسجيل بكل سهولة عبر موقعنا الالكتروني" },
        { step: "02", title: b?.step2Title ?? "الاستشارة الشخصية", description: b?.step2Description ?? "سنتواصل معك ونقدم لك استشارة شخصية تلبي طموحاتك المالية" },
        { step: "03", title: b?.step3Title ?? "اختر القطاع", description: b?.step3Description ?? "اختر القطاع المراد الاستثمار فيه وتصفح كافة معلوماته وعوائده" },
        { step: "04", title: b?.step4Title ?? "ابدأ الاستثمار", description: b?.step4Description ?? "ابدأ استثمارك الآن واحصل على العوائد الربحية المتوقعة بذكاء" },
    ];
    const registerHeading = b?.registerHeading ?? "امتداد عريق بخبرة تجاوزت الثلاثة عقود";
    const registerSubheading = b?.registerSubheading ?? "الصناديق الاستثمارية";
    const registerFormTitle = b?.registerFormTitle ?? "سجل اهتمامك واستثمر معنا";
    const formRecipientEmail = b?.formRecipientEmail ?? "";
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

            <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
                <h2 className="text-lg font-bold text-secondary dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-icons text-primary">mail</span>
                    إعدادات الإشعارات
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    البريد المستلم + حساب الإرسال (بريد وكلمة مرور). يمكن أن يكون بريد شركة أو Gmail.
                </p>
                <div className="max-w-md space-y-4 text-right">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-secondary dark:text-gray-200">
                            البريد المستلم لطلبات سجل الاهتمام
                        </label>
                        <input
                            name="formRecipientEmail"
                            type="email"
                            defaultValue={formRecipientEmail}
                            placeholder="info@company.com"
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-secondary dark:text-gray-200">
                            بريد الإرسال (SMTP)
                        </label>
                        <input
                            name="mailSenderEmail"
                            type="email"
                            defaultValue={b?.mailSenderEmail ?? ""}
                            placeholder="noreply@company.com أو xxx@gmail.com"
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-secondary dark:text-gray-200">
                            كلمة مرور بريد الإرسال
                        </label>
                        <input
                            name="mailSenderPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="اتركه فارغاً للإبقاء على الحالي"
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </section>

            <section className="relative bg-white dark:bg-background-dark pt-16 pb-32 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                        <div className="md:w-1/2 order-2 md:order-1 space-y-3">
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 p-3">
                                <p className="text-sm font-bold text-secondary dark:text-gray-200 mb-2 text-right">
                                    {previewUrl ? "معاينة قبل الرفع" : "معاينة الصورة"}
                                </p>
                                <img
                                    alt="معاينة صورة كيفية البدء"
                                    className="w-full h-auto max-w-md max-h-64 object-contain mx-auto rounded-lg mix-blend-multiply opacity-80 dark:opacity-40 filter grayscale"
                                    src={displayImageUrl}
                                />
                            </div>
                            <input type="hidden" name="howToImageUrl" value={b?.howToImageUrl ?? ""} />
                            <div className="space-y-2 text-right">
                                <label className="block text-sm font-bold text-secondary dark:text-gray-200">صورة «كيفية البدء»</label>
                                <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        name="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="text-sm text-secondary dark:text-gray-300 file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary file:text-white file:font-medium"
                                    />
                                    <button
                                        type="button"
                                        disabled={imageUploading}
                                        onClick={async () => {
                                            const file = fileInputRef.current?.files?.[0];
                                            if (!file) return;
                                            setImageError(null);
                                            setImageUploading(true);
                                            const formData = new FormData();
                                            formData.set("file", file);
                                            const result = await uploadInvestmentRegisterHowToImage(formData);
                                            setImageUploading(false);
                                            if (result.success) {
                                                if (previewUrl) URL.revokeObjectURL(previewUrl);
                                                setPreviewUrl(null);
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                                router.refresh();
                                            } else {
                                                setImageError(result.error ?? "تعذر رفع الصورة.");
                                            }
                                        }}
                                        className="px-4 py-2 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 disabled:opacity-50"
                                    >
                                        {imageUploading ? "جاري الرفع..." : "رفع الصورة"}
                                    </button>
                                </div>
                                {imageError && (
                                    <p className="text-red-600 dark:text-red-400 text-sm">{imageError}</p>
                                )}
                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                    تُخزَّن الصورة في DigitalOcean كمفتاح قصير (بدون روابط طويلة).
                                </p>
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
