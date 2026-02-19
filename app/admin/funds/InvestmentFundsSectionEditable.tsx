"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { InvestmentFundsSection, type FundTab } from "../../components/InvestmentFundsSection";
import type { FundsData } from "../../investment/getFunds";
import {
    updateCarsFund,
    updateRecruitmentFund,
    updateHospitalityFund,
    uploadFundImage,
    type FundKind,
} from "../funds-actions";

const HOSPITALITY_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCj4ygmIs_eB2rNZI9TW4i4vXoUlIU-2nGsdTKJMLLv0j7qqyNAc9nB2029wLwXa7lhJrgCQObkG6Sx-o2Ct4_LPAlhqZeGCcKeJNZ7dGDNijkTMtIJ9bpipRLPYW-FT-zKPyQUy5dZsO7UWVlJSrGsYk0I6mR1dg9arDs1VsQZkC8oWT__9zKJ5t-ShzVL1F0KBYjq3N5cTgUWkw94rG6HLpPnn_HN3nwu480rcsjzNevxyx5dNSMzUwCL-95zi0wFkJHcVU2E1ss";
const CARS_IMAGE = "/CarLeasing.avif";
const RECRUITMENT_IMAGE = "istiqdam.avif";

const HOTEL_BRANDS = [
    { icon: "diamond", name: "Rest In Hotel" },
    { icon: "bed", name: "Resan Hotel" },
    { icon: "star", name: "Rawaes Hotel" },
    { icon: "wb_sunny", name: "Shams Hotel" },
];

type Props = {
    tabs: FundTab[];
    funds: FundsData;
};

export function InvestmentFundsSectionEditable({ tabs, funds }: Props) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "hospitality");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageUploading, setImageUploading] = useState<FundKind | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    async function handleImageUpload(e: React.FormEvent<HTMLFormElement>, kind: FundKind) {
        e.preventDefault();
        setImageError(null);
        setImageUploading(kind);
        const formData = new FormData(e.currentTarget);
        const result = await uploadFundImage(kind, formData);
        setImageUploading(null);
        if (result.success) {
            router.refresh();
        } else {
            setImageError(result.error || "تعذر رفع الصورة.");
        }
    }

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>,
        kind: "cars" | "recruitment" | "hospitality"
    ) {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const result =
            kind === "cars"
                ? await updateCarsFund(formData)
                : kind === "recruitment"
                  ? await updateRecruitmentFund(formData)
                  : await updateHospitalityFund(formData);
        if (result.success) {
            setMessage("تم حفظ بيانات الصندوق بنجاح.");
        } else {
            setError(result.error || "حدث خطأ أثناء الحفظ.");
        }
        setIsSubmitting(false);
    }

    const h = funds.hospitality;
    const r = funds.recruitment;
    const c = funds.cars;

    return (
        <section className="py-12 px-4 bg-gray-50 dark:bg-background-dark">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-secondary dark:text-white">
                        إدارة صناديق الاستثمار
                    </h1>
                    <p className="text-gray-500 text-sm">
                        نفس القسم المعروض في صفحة الاستثمار — يمكنك تعديل الأرقام أدناه ثم الحفظ.
                    </p>
                </header>

                {message && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 px-4 py-3 text-emerald-700 dark:text-emerald-300 text-sm">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-red-700 dark:text-red-300 text-sm">
                        {error}
                    </div>
                )}
                {imageError && (
                    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3 text-amber-800 dark:text-amber-200 text-sm">
                        {imageError}
                    </div>
                )}

                <InvestmentFundsSection
                    title="استثمارات الأقطاع — صناديق روائس"
                    tabs={tabs}
                    defaultTabId={tabs[0]?.id}
                    activeTabId={activeTab}
                    onTabChange={setActiveTab}
                    id="funds-editable"
                >
                    {(activeTabId) => (
                        <>
                            {activeTabId === "hospitality" && (
                                <form
                                    onSubmit={(e) => handleSubmit(e, "hospitality")}
                                    className="space-y-10"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                                        <div className="space-y-3">
                                            <div className="rounded-3xl overflow-hidden shadow-2xl">
                                                <img
                                                    alt="الضيافة"
                                                    className="w-full h-[400px] object-cover"
                                                    src={(h as { imageUrl?: string | null })?.imageUrl || HOSPITALITY_IMAGE}
                                                />
                                            </div>
                                            <form onSubmit={(e) => handleImageUpload(e, "hospitality")} className="flex flex-wrap items-center gap-2">
                                                <input type="file" name="file" accept="image/*" className="text-sm text-secondary dark:text-gray-300" required />
                                                <button type="submit" disabled={imageUploading === "hospitality"} className="px-4 py-2 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 disabled:opacity-50">
                                                    {imageUploading === "hospitality" ? "جاري الرفع..." : "تغيير الصورة"}
                                                </button>
                                            </form>
                                        </div>
                                        <div className="text-secondary dark:text-white space-y-6">
                                            <h3 className="text-3xl font-bold border-r-4 border-gold pr-4">
                                                صندوق روائس للضيافة
                                            </h3>
                                            <p className="text-lg leading-relaxed text-secondary/80 dark:text-gray-300 text-justify">
                                                إن الضيافة من الخدمات التي تعتني بها المجموعة... وتضم المجموعة فنادق معروفة مثل:
                                                <span className="font-bold text-gold"> فندق رست إن - فندق شمس - فندق روائس - فندق ريسان</span>
                                            </p>
                                            <h4 className="text-2xl font-bold flex items-center gap-2 text-gold">
                                                <span className="w-8 h-[2px] bg-gold" />
                                                حجم الاستثمار (قابل للتعديل)
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { name: "homemaidsCound", icon: "groups", label: "القوة العاملة", type: "text" as const },
                                            { name: "facilities", icon: "restaurant_menu", label: "المرافق المتنوعة", type: "text" as const },
                                            { name: "contractsCount", icon: "king_bed", label: "عدد الغرف", type: "text" as const },
                                            { name: "branches", icon: "apartment", label: "عدد الفنادق", type: "number" as const },
                                        ].map(({ name, icon, label, type }) => (
                                            <div
                                                key={name}
                                                className="bg-white dark:bg-slate-800 p-6 rounded-[32px] text-center shadow-lg border border-gray-100 dark:border-slate-700"
                                            >
                                                <div className="bg-gold/10 dark:bg-slate-700 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gold">
                                                    <span className="material-icons-round text-3xl">{icon}</span>
                                                </div>
                                                <input
                                                    type={type}
                                                    name={name}
                                                    defaultValue={
                                                        name === "facilities"
                                                            ? (h as { facilities?: string | null })?.facilities ?? ""
                                                            : name === "branches"
                                                              ? h?.branches ?? ""
                                                              : String((h as Record<string, unknown>)?.[name] ?? "")
                                                    }
                                                    className="w-full text-2xl font-bold text-gold bg-transparent border-b-2 border-gold/30 py-1 text-center focus:outline-none focus:border-gold"
                                                />
                                                <div className="text-secondary dark:text-gold font-medium text-sm mt-1">{label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap justify-center items-center gap-10">
                                        {HOTEL_BRANDS.map((brand) => (
                                            <div key={brand.name} className="flex flex-col items-center">
                                                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center text-gold">
                                                    <span className="material-icons-round">{brand.icon}</span>
                                                </div>
                                                <span className="text-xs font-bold text-secondary dark:text-gray-300">{brand.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-8 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            {isSubmitting ? "جاري الحفظ..." : "حفظ صندوق الضيافة"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTabId === "recruitment" && (
                                <form
                                    onSubmit={(e) => handleSubmit(e, "recruitment")}
                                    className="space-y-10"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                                        <div className="space-y-3">
                                            <div className="rounded-3xl overflow-hidden shadow-2xl">
                                                <img
                                                    alt="الاستقدام"
                                                    className="w-full h-[400px] object-cover"
                                                    src={(r as { imageUrl?: string | null })?.imageUrl || RECRUITMENT_IMAGE}
                                                />
                                            </div>
                                            <form onSubmit={(e) => handleImageUpload(e, "recruitment")} className="flex flex-wrap items-center gap-2">
                                                <input type="file" name="file" accept="image/*" className="text-sm text-secondary dark:text-gray-300" required />
                                                <button type="submit" disabled={imageUploading === "recruitment"} className="px-4 py-2 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 disabled:opacity-50">
                                                    {imageUploading === "recruitment" ? "جاري الرفع..." : "تغيير الصورة"}
                                                </button>
                                            </form>
                                        </div>
                                        <div className="text-secondary dark:text-white space-y-6">
                                            <h3 className="text-3xl font-bold border-r-4 border-gold pr-4">
                                                صندوق روائس للاستقدام
                                            </h3>
                                            <p className="text-lg leading-relaxed text-secondary/80 dark:text-gray-300 text-justify">
                                                نفخر بتقديم خدمات استقدام العمالة المنزلية بجودة عالية...
                                            </p>
                                            <h4 className="text-2xl font-bold flex items-center gap-2 text-gold">
                                                <span className="w-8 h-[2px] bg-gold" />
                                                حجم الاستثمار (قابل للتعديل)
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { name: "branches", icon: "location_city", label: "عدد الفروع", type: "number" as const },
                                            { name: "contractsCount", icon: "description", label: "عدد العقود في الشهر", type: "text" as const },
                                            { name: "homemaidsCound", icon: "group_add", label: "عدد العمال", type: "text" as const },
                                            { name: "musanadRating", icon: "workspace_premium", label: "تقييمنا على مساند", type: "text" as const },
                                        ].map(({ name, icon, label, type }) => (
                                            <div
                                                key={name}
                                                className="bg-white dark:bg-slate-800 p-6 rounded-[32px] text-center shadow-lg border border-gray-100 dark:border-slate-700"
                                            >
                                                <div className="bg-gold/10 dark:bg-slate-700 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gold">
                                                    <span className="material-icons-round text-3xl">{icon}</span>
                                                </div>
                                                <input
                                                    type={type}
                                                    name={name}
                                                    required={name === "musanadRating"}
                                                    defaultValue={String((r as Record<string, unknown>)?.[name] ?? "")}
                                                    className="w-full text-2xl font-bold text-gold bg-transparent border-b-2 border-gold/30 py-1 text-center focus:outline-none focus:border-gold"
                                                />
                                                <div className="text-secondary dark:text-gold font-medium text-sm mt-1">{label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-8 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            {isSubmitting ? "جاري الحفظ..." : "حفظ صندوق الاستقدام"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTabId === "cars" && (
                                <form
                                    onSubmit={(e) => handleSubmit(e, "cars")}
                                    className="space-y-10"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                                        <div className="space-y-3">
                                            <div className="rounded-3xl overflow-hidden shadow-2xl">
                                                <img
                                                    alt="تأجير السيارات"
                                                    className="w-full h-[400px] object-cover"
                                                    src={(c as { imageUrl?: string | null })?.imageUrl || CARS_IMAGE}
                                                />
                                            </div>
                                            <form onSubmit={(e) => handleImageUpload(e, "cars")} className="flex flex-wrap items-center gap-2">
                                                <input type="file" name="file" accept="image/*" className="text-sm text-secondary dark:text-gray-300" required />
                                                <button type="submit" disabled={imageUploading === "cars"} className="px-4 py-2 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 disabled:opacity-50">
                                                    {imageUploading === "cars" ? "جاري الرفع..." : "تغيير الصورة"}
                                                </button>
                                            </form>
                                        </div>
                                        <div className="text-secondary dark:text-white space-y-6">
                                            <h3 className="text-3xl font-bold border-r-4 border-gold pr-4">
                                                صندوق روائس لتأجير السيارات
                                            </h3>
                                            <p className="text-lg leading-relaxed text-secondary/80 dark:text-gray-300 text-justify">
                                                نقدم لكم تشكيلة واسعة من السيارات تناسب مختلف الفئات والميزانيات...
                                            </p>
                                            <h4 className="text-2xl font-bold flex items-center gap-2 text-gold">
                                                <span className="w-8 h-[2px] bg-gold" />
                                                حجم الاستثمار (قابل للتعديل)
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { name: "daysRental", icon: "car_rental", label: "عملية تأجير في اليوم", type: "text" as const },
                                            { name: "availableServices", icon: "support_agent", label: "الخدمات المتوفرة", type: "text" as const },
                                            { name: "avaiableCars", icon: "directions_car", label: "عدد السيارات", type: "text" as const },
                                            { name: "branches", icon: "store", label: "عدد الفروع", type: "number" as const },
                                        ].map(({ name, icon, label, type }) => (
                                            <div
                                                key={name}
                                                className="bg-white dark:bg-slate-800 p-6 rounded-[32px] text-center shadow-lg border border-gray-100 dark:border-slate-700"
                                            >
                                                <div className="bg-gold/10 dark:bg-slate-700 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gold">
                                                    <span className="material-icons-round text-3xl">{icon}</span>
                                                </div>
                                                <input
                                                    type={type}
                                                    name={name}
                                                    defaultValue={String((c as Record<string, unknown>)?.[name] ?? "")}
                                                    className="w-full text-2xl font-bold text-gold bg-transparent border-b-2 border-gold/30 py-1 text-center focus:outline-none focus:border-gold"
                                                />
                                                <div className="text-secondary dark:text-gold font-medium text-sm mt-1">{label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-8 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            {isSubmitting ? "جاري الحفظ..." : "حفظ صندوق تأجير السيارات"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </InvestmentFundsSection>
            </div>
        </section>
    );
}
