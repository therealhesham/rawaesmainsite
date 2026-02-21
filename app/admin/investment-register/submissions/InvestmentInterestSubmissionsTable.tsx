"use client";

import { useState } from "react";

const FUND_LABELS: Record<string, string> = {
  hospitality: "صندوق الضيافة",
  cars: "صندوق السيارات",
  recruitment: "صندوق الاستقدام",
};

const AMOUNT_LABELS: Record<string, string> = {
  "50-100": "50,000 - 100,000",
  "100-500": "100,000 - 500,000",
  "500+": "أكثر من 500,000",
};

type Submission = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fund: string | null;
  amount: string | null;
  createdAt: Date | string;
};

export function InvestmentInterestSubmissionsTable({
  submissions,
}: {
  submissions: Submission[];
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const selected = submissions.find((s) => s.id === openId);

  return (
    <>
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
          <tr>
            <th className="px-6 py-4 text-right font-medium">الاسم</th>
            <th className="px-6 py-4 text-right font-medium">البريد</th>
            <th className="px-6 py-4 text-right font-medium">الجوال</th>
            <th className="px-6 py-4 text-right font-medium">الصندوق</th>
            <th className="px-6 py-4 text-right font-medium">المبلغ</th>
            <th className="px-6 py-4 text-center font-medium">التاريخ</th>
            <th className="px-6 py-4 text-center font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {submissions.map((sub) => (
            <tr
              key={sub.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="px-6 py-4">
                <span className="font-medium text-secondary dark:text-white">
                  {sub.firstName} {sub.lastName}
                </span>
              </td>
              <td className="px-6 py-4">
                <a
                  href={`mailto:${sub.email}`}
                  className="text-primary hover:underline font-mono text-sm"
                >
                  {sub.email}
                </a>
              </td>
              <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-300 dir-ltr text-right">
                {sub.phone}
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                {sub.fund ? FUND_LABELS[sub.fund] ?? sub.fund : "—"}
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                {sub.amount ? AMOUNT_LABELS[sub.amount] ?? sub.amount : "—"}
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-500 whitespace-nowrap">
                {new Date(sub.createdAt).toLocaleString("ar-EG", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  type="button"
                  onClick={() => setOpenId(sub.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <span className="material-icons text-sm">visibility</span>
                  عرض
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <SubmissionModal
          submission={selected}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}

function SubmissionModal({
  submission: sub,
  onClose,
}: {
  submission: Submission;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2
            id="submission-modal-title"
            className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2"
          >
            <span className="material-icons text-primary">how_to_reg</span>
            طلب سجل اهتمام — {sub.firstName} {sub.lastName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-secondary dark:hover:text-white transition-colors"
            aria-label="إغلاق"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">الاسم</span>
            <p className="text-secondary dark:text-white font-medium">
              {sub.firstName} {sub.lastName}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">البريد الإلكتروني</span>
            <a
              href={`mailto:${sub.email}`}
              className="text-primary hover:underline font-mono text-sm"
            >
              {sub.email}
            </a>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">رقم الجوال</span>
            <p className="font-mono text-sm text-gray-700 dark:text-gray-300 dir-ltr">
              {sub.phone}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">الصندوق المراد</span>
            <p className="text-gray-700 dark:text-gray-300">
              {sub.fund ? FUND_LABELS[sub.fund] ?? sub.fund : "—"}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">نطاق الاستثمار</span>
            <p className="text-gray-700 dark:text-gray-300">
              {sub.amount ? AMOUNT_LABELS[sub.amount] ?? sub.amount : "—"}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">التاريخ</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(sub.createdAt).toLocaleString("ar-EG", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>
        <div className="p-6 pt-0 flex justify-end gap-2">
          <a
            href={`mailto:${sub.email}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <span className="material-icons text-sm">reply</span>
            رد بالبريد
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
