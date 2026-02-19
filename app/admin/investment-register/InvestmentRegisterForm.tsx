"use client";

import React, { useState } from "react";
import Link from "next/link";
import { updateInvestmentRegisterBlock } from "../investment-register-actions";
import type { InvestmentRegisterBlockData } from "@/app/investment/getInvestmentRegisterBlock";

type Props = {
  block: InvestmentRegisterBlockData;
};

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-secondary dark:text-gray-300 mb-1">
        {label}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-secondary dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
      />
    </label>
  );
}

export function InvestmentRegisterForm({ block }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const b = block as Record<string, unknown> | null;

  const val = (key: string) => String(b?.[key] ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateInvestmentRegisterBlock(formData);
    if (result.success) setMessage("تم حفظ المحتوى بنجاح.");
    else setError(result.error || "حدث خطأ أثناء الحفظ.");
    setIsSubmitting(false);
  }

  return (
    <div className="py-8 px-4 bg-gray-50 dark:bg-background-dark" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-secondary dark:hover:text-white transition-colors"
              aria-label="العودة للوحة التحكم"
            >
              <span className="material-icons">arrow_forward</span>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary dark:text-white">
                سجل اهتمامك واستثمر معنا
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                محتوى قسم «كيفية البدء» وقسم «سجل اهتمامك واستثمر معنا» في صفحة الاستثمار
              </p>
            </div>
          </div>
        </header>

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-emerald-700 dark:text-emerald-300 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-primary border-r-4 border-gold pr-3 mb-6">
              كيفية البدء
            </h2>
            <div className="space-y-4">
              <Field name="howToTitle" label="عنوان القسم" defaultValue={val("howToTitle")} />
              <Field name="howToSubtitle" label="النص التحتي" defaultValue={val("howToSubtitle")} />
              <Field name="howToImageUrl" label="رابط صورة القسم" defaultValue={val("howToImageUrl")} placeholder="https://..." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                    <Field name={`step${i}Title`} label={`الخطوة ${i} — العنوان`} defaultValue={val(`step${i}Title`)} />
                    <Field name={`step${i}Description`} label={`الخطوة ${i} — الوصف`} defaultValue={val(`step${i}Description`)} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-primary border-r-4 border-gold pr-3 mb-6">
              سجل اهتمامك واستثمر معنا
            </h2>
            <div className="space-y-4">
              <Field name="registerHeading" label="العنوان الرئيسي (امتداد عريق...)" defaultValue={val("registerHeading")} />
              <Field name="registerSubheading" label="العنوان الفرعي (الصناديق الاستثمارية)" defaultValue={val("registerSubheading")} />
              <Field name="registerFormTitle" label="عنوان النموذج (سجل اهتمامك واستثمر معنا)" defaultValue={val("registerFormTitle")} />
              <div className="pt-4">
                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">بطاقات الصناديق (3)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                    <Field name="fund1Title" label="البطاقة 1 — النص" defaultValue={val("fund1Title")} />
                    <Field name="fund1Href" label="البطاقة 1 — الرابط" defaultValue={val("fund1Href")} placeholder="/hospitalityfund" />
                  </div>
                  <div className="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                    <Field name="fund2Title" label="البطاقة 2 — النص" defaultValue={val("fund2Title")} />
                    <Field name="fund2Href" label="البطاقة 2 — الرابط" defaultValue={val("fund2Href")} placeholder="/carrentalfund" />
                  </div>
                  <div className="space-y-2 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                    <Field name="fund3Title" label="البطاقة 3 — النص" defaultValue={val("fund3Title")} />
                    <Field name="fund3Href" label="البطاقة 3 — الرابط" defaultValue={val("fund3Href")} placeholder="/carrentalfund" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-4">
            <Link
              href="/admin"
              className="px-6 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 text-secondary dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
