"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateCarsFund,
  uploadFundImage,
  createRentalCarReportDetail,
  updateRentalCarReportDetail,
  deleteRentalCarReportDetail,
} from "../../funds-actions";

/** شكل بيانات صندوق تأجير السيارات من السكيما (بدون تعديل الداتابيس) */
type CarsFund = {
  id?: number;
  daysRental: string | null;
  availableServices: string | null;
  avaiableCars: string | null;
  branches: number;
  imageUrl: string | null;
  createdAt?: Date;
  updatedAt?: Date;
} | null;

/** سطر من rentalcarfundReportsDetails مع المستثمر */
type ReportDetailRow = {
  id: number;
  revenues: number | null;
  expenses: number | null;
  profit: number | null;
  investorId: number;
  investor: { id: number; name: string };
};

type UserMinimal = { id: number; name: string };

const CARS_IMAGE = "/CarLeasing.avif";

const FIELDS = [
  { name: "daysRental", icon: "car_rental", label: "عملية تأجير في اليوم", type: "text" as const },
  { name: "availableServices", icon: "support_agent", label: "الخدمات المتوفرة", type: "text" as const },
  { name: "avaiableCars", icon: "directions_car", label: "عدد السيارات", type: "text" as const },
  { name: "branches", icon: "store", label: "عدد الفروع", type: "number" as const },
];

type Props = {
  fund: CarsFund;
  reportDetails: ReportDetailRow[];
  users: UserMinimal[];
};

export function CarsFundForm({ fund, reportDetails, users }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reportBusy, setReportBusy] = useState(false);

  async function handleImageUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setImageError(null);
    setImageUploading(true);
    const formData = new FormData(e.currentTarget);
    const result = await uploadFundImage("cars", formData);
    setImageUploading(false);
    if (result.success) router.refresh();
    else setImageError(result.error || "تعذر رفع الصورة.");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateCarsFund(formData);
    if (result.success) setMessage("تم حفظ بيانات صندوق تأجير السيارات بنجاح.");
    else setError(result.error || "حدث خطأ أثناء الحفظ.");
    setIsSubmitting(false);
  }

  async function handleAddReportDetail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setReportError(null);
    setReportMessage(null);
    setReportBusy(true);
    const formData = new FormData(e.currentTarget);
    const result = await createRentalCarReportDetail(formData);
    setReportBusy(false);
    if (result.success) {
      setReportMessage("تمت إضافة التفاصيل الاستثمارية.");
      router.refresh();
      (e.target as HTMLFormElement).reset();
    } else setReportError(result.error || "تعذر الإضافة.");
  }

  async function handleUpdateReportDetail(id: number, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setReportError(null);
    setReportMessage(null);
    setReportBusy(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateRentalCarReportDetail(id, formData);
    setReportBusy(false);
    if (result.success) {
      setReportMessage("تم تحديث التفاصيل.");
      setEditingId(null);
      router.refresh();
    } else setReportError(result.error || "تعذر التحديث.");
  }

  async function handleDeleteReportDetail(id: number) {
    if (!confirm("هل تريد حذف هذا السطر؟")) return;
    setReportError(null);
    setReportMessage(null);
    setReportBusy(true);
    const result = await deleteRentalCarReportDetail(id);
    setReportBusy(false);
    if (result.success) {
      setReportMessage("تم الحذف.");
      setEditingId(null);
      router.refresh();
    } else setReportError(result.error || "تعذر الحذف.");
  }

  const c = fund;

  return (
    <section className="py-8 px-4 bg-gray-50 dark:bg-background-dark" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/funds"
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-secondary dark:hover:text-white transition-colors"
              aria-label="العودة لصناديق الاستثمار"
            >
              <span className="material-icons">arrow_forward</span>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary dark:text-white">
                قطاع تأجير السيارات
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                تعديل بيانات صندوق روائس لتأجير السيارات
              </p>
            </div>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-3">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
                <img
                  alt="تأجير السيارات"
                  className="w-full h-[320px] object-cover"
                  src={c?.imageUrl || CARS_IMAGE}
                />
              </div>
              <form onSubmit={handleImageUpload} className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  className="text-sm text-secondary dark:text-gray-300 file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary file:text-white file:font-medium"
                  required
                />
                <button
                  type="submit"
                  disabled={imageUploading}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 disabled:opacity-50"
                >
                  {imageUploading ? "جاري الرفع..." : "تغيير الصورة"}
                </button>
              </form>
            </div>
            <div className="text-secondary dark:text-white space-y-4">
              <h2 className="text-2xl font-bold border-r-4 border-gold pr-4">
                صندوق روائس لتأجير السيارات
              </h2>
              <p className="text-base leading-relaxed text-secondary/80 dark:text-gray-300 text-justify">
                نقدم لكم تشكيلة واسعة من السيارات تناسب مختلف الفئات والميزانيات، مع خدمات تأجير مرنة وفروع متعددة.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-secondary dark:text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-gold" />
              حجم الاستثمار (قابل للتعديل)
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {FIELDS.map(({ name, icon, label, type }) => (
                <div
                  key={name}
                  className="bg-white dark:bg-slate-800 p-6 rounded-3xl text-center shadow-lg border border-gray-100 dark:border-slate-700"
                >
                  <div className="bg-gold/10 dark:bg-slate-700 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gold">
                    <span className="material-icons-round text-3xl">{icon}</span>
                  </div>
                  <input
                    type={type}
                    name={name}
                    required={name === "branches"}
                    defaultValue={String((c && name in c ? (c as Record<string, unknown>)[name] : null) ?? "")}
                    className="w-full text-xl font-bold text-gold bg-transparent border-b-2 border-gold/30 py-1 text-center focus:outline-none focus:border-gold"
                  />
                  <div className="text-secondary dark:text-gold font-medium text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* التفاصيل الاستثمارية (rentalcarfundReportsDetails) */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-10">
            <h3 className="text-lg font-bold text-secondary dark:text-white mb-4 flex items-center gap-2">
              <span className="material-icons-round text-gold">assessment</span>
              <span className="w-6 h-0.5 bg-gold" />
              التفاصيل الاستثمارية
            </h3>
            {reportMessage && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 text-emerald-700 dark:text-emerald-300 text-sm">
                {reportMessage}
              </div>
            )}
            {reportError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-red-700 dark:text-red-300 text-sm">
                {reportError}
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50">
                    <th className="p-3 font-semibold text-secondary dark:text-white">المستثمر</th>
                    <th className="p-3 font-semibold text-secondary dark:text-white">الإيرادات</th>
                    <th className="p-3 font-semibold text-secondary dark:text-white">المصروفات</th>
                    <th className="p-3 font-semibold text-secondary dark:text-white">الربح</th>
                    <th className="p-3 font-semibold text-secondary dark:text-white w-28">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {reportDetails.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500 dark:text-gray-400">
                        لا توجد تفاصيل استثمارية. أضف سطراً من النموذج أدناه.
                      </td>
                    </tr>
                  ) : (
                    reportDetails.map((row) =>
                      editingId === row.id ? (
                        <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700 bg-gold/5">
                          <td colSpan={5} className="p-4">
                            <form
                              onSubmit={(e) => handleUpdateReportDetail(row.id, e)}
                              className="flex flex-wrap items-end gap-4"
                            >
                              <label className="flex flex-col gap-1 text-sm text-secondary dark:text-gray-300">
                                المستثمر
                                <select
                                  name="investorId"
                                  required
                                  defaultValue={row.investorId}
                                  className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 min-w-[180px]"
                                >
                                  {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                  ))}
                                </select>
                              </label>
                              <label className="flex flex-col gap-1 text-sm text-secondary dark:text-gray-300">
                                الإيرادات
                                <input type="number" name="revenues" defaultValue={row.revenues ?? ""} className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 w-28" />
                              </label>
                              <label className="flex flex-col gap-1 text-sm text-secondary dark:text-gray-300">
                                المصروفات
                                <input type="number" name="expenses" defaultValue={row.expenses ?? ""} className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 w-28" />
                              </label>
                              <label className="flex flex-col gap-1 text-sm text-secondary dark:text-gray-300">
                                الربح
                                <input type="number" name="profit" defaultValue={row.profit ?? ""} className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 w-28" />
                              </label>
                              <div className="flex gap-2">
                                <button type="submit" disabled={reportBusy} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50">
                                  حفظ
                                </button>
                                <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm">
                                  إلغاء
                                </button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      ) : (
                        <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                          <td className="p-3 text-secondary dark:text-white">{row.investor.name}</td>
                          <td className="p-3 text-secondary dark:text-white">{row.revenues ?? "—"}</td>
                          <td className="p-3 text-secondary dark:text-white">{row.expenses ?? "—"}</td>
                          <td className="p-3 text-secondary dark:text-white">{row.profit ?? "—"}</td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => setEditingId(row.id)}
                              className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-600 hover:text-primary"
                              title="تعديل"
                            >
                              <span className="material-icons text-lg">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReportDetail(row.id)}
                              disabled={reportBusy}
                              className="p-2 rounded-lg text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 disabled:opacity-50"
                              title="حذف"
                            >
                              <span className="material-icons text-lg">delete</span>
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-6 rounded-2xl border border-dashed border-gold/40 bg-gold/5 dark:bg-gold/10">
              <h4 className="font-semibold text-secondary dark:text-white mb-4">إضافة تفاصيل استثمارية</h4>
              <form onSubmit={handleAddReportDetail} className="flex flex-wrap items-end gap-4">
                <label className="flex flex-col gap-1 text-sm text-secondary dark:text-gray-300">
                  المستثمر
                  <select
                    name="investorId"
                    required
                    className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 min-w-[180px]"
                  >
                    <option value="">اختر المستثمر</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm text-secondary dark:text-gray-300">
                  الإيرادات
                  <input type="number" name="revenues" className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 w-28" />
                </label>
                <label className="flex flex-col gap-1 text-sm text-secondary dark:text-gray-300">
                  المصروفات
                  <input type="number" name="expenses" className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 w-28" />
                </label>
                <label className="flex flex-col gap-1 text-sm text-secondary dark:text-gray-300">
                  الربح
                  <input type="number" name="profit" className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 w-28" />
                </label>
                <button type="submit" disabled={reportBusy} className="px-5 py-2.5 rounded-xl bg-gold text-secondary font-medium hover:bg-gold/90 disabled:opacity-50">
                  {reportBusy ? "جاري الحفظ..." : "إضافة"}
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-4">
            <Link
              href="/admin/funds"
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
    </section>
  );
}
