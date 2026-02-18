"use client";

import { useState } from "react";
import type { FundsData } from "../../investment/getFunds";
import {
  updateCarsFund,
  updateRecruitmentFund,
  updateHospitalityFund,
} from "../funds-actions";

type Props = {
  initialFunds: FundsData;
};

export function InvestmentFundsAdmin({ initialFunds }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
    kind: "cars" | "recruitment" | "hospitality",
  ) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    let result:
      | Awaited<ReturnType<typeof updateCarsFund>>
      | Awaited<ReturnType<typeof updateRecruitmentFund>>
      | Awaited<ReturnType<typeof updateHospitalityFund>>;

    if (kind === "cars") {
      result = await updateCarsFund(formData);
    } else if (kind === "recruitment") {
      result = await updateRecruitmentFund(formData);
    } else {
      result = await updateHospitalityFund(formData);
    }

    if (result.success) {
      setMessage("تم حفظ بيانات الصندوق بنجاح.");
    } else {
      setError(result.error || "حدث خطأ أثناء الحفظ.");
    }
    setIsSubmitting(false);
  }

  const cars = initialFunds.cars;
  const recruitment = initialFunds.recruitment;
  const hospitality = initialFunds.hospitality;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary dark:text-white">
            إدارة صناديق الاستثمار
          </h1>
          <p className="text-gray-500 mt-1">
            تعديل الأرقام المعروضة في صفحة صناديق الاستثمار.
          </p>
        </div>
      </header>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Cars Fund */}
      <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-secondary dark:text-white">
            صندوق روائس لتأجير السيارات
          </h2>
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary">
            <span className="material-icons-round">directions_car</span>
          </span>
        </div>
        <form
          className="grid md:grid-cols-4 gap-4 mt-4"
          onSubmit={(e) => handleSubmit(e, "cars")}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عملية تأجير في اليوم
            </label>
            <input
              name="daysRental"
              defaultValue={cars?.daysRental ?? ""}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الخدمات المتوفرة
            </label>
            <input
              name="availableServices"
              defaultValue={cars?.availableServices ?? ""}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عدد السيارات
            </label>
            <input
              name="avaiableCars"
              defaultValue={cars?.avaiableCars ?? ""}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عدد الفروع
            </label>
            <input
              name="branches"
              type="number"
              defaultValue={cars?.branches ?? ""}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              حفظ بيانات الصندوق
            </button>
          </div>
        </form>
      </section>

      {/* Recruitment Fund */}
      <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-secondary dark:text-white">
            صندوق روائس للاستقدام
          </h2>
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary">
            <span className="material-icons-round">group</span>
          </span>
        </div>
        <form
          className="grid md:grid-cols-4 gap-4 mt-4"
          onSubmit={(e) => handleSubmit(e, "recruitment")}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عدد الفروع
            </label>
            <input
              name="branches"
              type="number"
              defaultValue={recruitment?.branches ?? ""}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عدد العقود في الشهر
            </label>
            <input
              name="contractsCount"
              defaultValue={recruitment?.contractsCount ?? ""}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عدد العمال
            </label>
            <input
              name="homemaidsCound"
              defaultValue={recruitment?.homemaidsCound ?? ""}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              تقييم مساند
            </label>
            <input
              name="musanadRating"
              defaultValue={recruitment?.musanadRating ?? ""}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              required
            />
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              حفظ بيانات الصندوق
            </button>
          </div>
        </form>
      </section>

      {/* Hospitality Fund */}
      <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-secondary dark:text-white">
            صندوق روائس للضيافة
          </h2>
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary">
            <span className="material-icons-round">apartment</span>
          </span>
        </div>
        <form
          className="grid md:grid-cols-4 gap-4 mt-4"
          onSubmit={(e) => handleSubmit(e, "hospitality")}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              القوة العاملة
            </label>
            <input
              name="homemaidsCound"
              defaultValue={hospitality?.homemaidsCound ?? ""}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              المرافق المتنوعة
            </label>
            <input
              name="facilities"
              defaultValue={
                (hospitality as { facilities?: string | null })?.facilities ??
                ""
              }
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عدد الغرف
            </label>
            <input
              name="contractsCount"
              defaultValue={hospitality?.contractsCount ?? ""}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              عدد الفنادق
            </label>
            <input
              name="branches"
              type="number"
              defaultValue={hospitality?.branches ?? ""}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              تقييم مساند
            </label>
            <input
              name="musanadRating"
              defaultValue={hospitality?.musanadRating ?? ""}
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              required
            />
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              حفظ بيانات الصندوق
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

