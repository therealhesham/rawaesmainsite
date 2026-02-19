"use client";

import React, { useState } from "react";
import Link from "next/link";
import { updateContactUs } from "../contact-actions";
import { ContactSection } from "@/app/components/ContactSection";
import type { ContactUsData } from "@/app/contact/getContactUs";

type Props = {
  contact: ContactUsData;
};

export function ContactUsForm({ contact }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateContactUs(formData);
    if (result.success) setMessage("تم حفظ بيانات اتصل بنا بنجاح.");
    else setError(result.error || "حدث خطأ أثناء الحفظ.");
    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark" dir="rtl">
      {/* Admin header — فوق القسم بنفس أسلوب صناديق الاستثمار */}
      <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-background-dark/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                إدارة قسم اتصل بنا
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                نفس القسم المعروض في الصفحة الرئيسية — عدّل النصوص أدناه ثم احفظ.
              </p>
            </div>
          </div>
        </div>
        {message && (
          <div className="max-w-6xl mx-auto mt-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 px-4 py-3 text-emerald-700 dark:text-emerald-300 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="max-w-6xl mx-auto mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* القسم نفسه كما يظهر للزائر، مع حقول قابلة للتعديل */}
      <form onSubmit={handleSubmit}>
        <ContactSection contact={contact} editMode />
        <div className="max-w-6xl mx-auto px-4 py-8 flex justify-end">
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
  );
}
