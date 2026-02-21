"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { updateContactUs, uploadContactEmailLogo } from "../contact-actions";
import { ContactSection } from "@/app/components/ContactSection";
import type { ContactUsData } from "@/app/contact/getContactUs";

type ContactWithLogoDisplay = ContactUsData & { emailLogoUrlDisplay?: string | null };

type Props = {
  contact: ContactWithLogoDisplay;
};

export function ContactUsForm({ contact }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

      {/* إعدادات الإشعارات — البريد المستلم لرسائل النموذج */}
      <form onSubmit={handleSubmit}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark p-6 mb-6">
            <h2 className="text-lg font-bold text-secondary dark:text-white mb-2 flex items-center gap-2">
              <span className="material-icons text-primary">image</span>
              شعار البريد الإلكتروني
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              يظهر في فوتر بريد «تواصل معنا». يُرفع إلى Digital Ocean.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {(logoPreview ?? contact?.emailLogoUrlDisplay) && (
                <img
                  src={logoPreview ?? contact?.emailLogoUrlDisplay ?? ""}
                  alt="شعار البريد"
                  className="h-14 w-auto object-contain rounded border border-gray-200 dark:border-gray-600"
                />
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (logoPreview) URL.revokeObjectURL(logoPreview);
                  setLogoPreview(file ? URL.createObjectURL(file) : null);
                  setLogoError(null);
                }}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-secondary dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                اختر صورة
              </button>
              <button
                type="button"
                disabled={logoUploading}
                onClick={async () => {
                  const file = logoInputRef.current?.files?.[0];
                  if (!file) {
                    setLogoError("اختر صورة أولاً.");
                    return;
                  }
                  setLogoError(null);
                  setLogoUploading(true);
                  const formData = new FormData();
                  formData.set("file", file);
                  const result = await uploadContactEmailLogo(formData);
                  setLogoUploading(false);
                  if (result.success) {
                    setMessage("تم رفع شعار البريد بنجاح.");
                    setLogoPreview(null);
                    if (logoInputRef.current) logoInputRef.current.value = "";
                    window.location.reload();
                  } else {
                    setLogoError(result.error ?? "تعذر الرفع.");
                  }
                }}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {logoUploading ? "جاري الرفع..." : "رفع إلى Digital Ocean"}
              </button>
            </div>
            {logoError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{logoError}</p>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark p-6 mb-8">
            <h2 className="text-lg font-bold text-secondary dark:text-white mb-2 flex items-center gap-2">
              <span className="material-icons text-primary">mail</span>
              إعدادات الإشعارات
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              البريد المستلم + حساب الإرسال (بريد وكلمة مرور). يمكن أن يكون بريد شركة أو Gmail.
            </p>
            <div className="max-w-md space-y-4 text-right">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-secondary dark:text-gray-200">
                  البريد المستلم لرسائل تواصل معنا
                </label>
                <input
                  name="formRecipientEmail"
                  type="email"
                  defaultValue={contact?.formRecipientEmail ?? ""}
                  placeholder="info@company.com"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-secondary dark:text-gray-200">
                  بريد الإرسال (SMTP)
                </label>
                <input
                  name="mailSenderEmail"
                  type="email"
                  defaultValue={contact?.mailSenderEmail ?? ""}
                  placeholder="noreply@company.com أو xxx@gmail.com"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
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
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </section>
        </div>
        {/* القسم نفسه كما يظهر للزائر، مع حقول قابلة للتعديل */}
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
