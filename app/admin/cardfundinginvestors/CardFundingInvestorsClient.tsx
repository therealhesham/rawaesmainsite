"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

type Row = {
  id: number;
  revenues: number | null;
  expenses: number | null;
  profit: number | null;
  withdrawen: number | null;
  afterwithdrawen: number | null;
  previousyear: number | null;
  netprofit: number | null;
  CARSCount: number | null;
  investorId: number;
  investor: { id: number; name: string };
};

function formatNum(n: number | null): string {
  if (n == null) return "0.00";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PAGE_SIZE = 10;

type Props = {
  rows: Row[];
};

export function CardFundingInvestorsClient({ rows }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) => r.investor.name.toLowerCase().includes(q));
  }, [rows, search]);

  const totalRevenues = useMemo(
    () => filtered.reduce((s, r) => s + (r.revenues ?? 0), 0),
    [filtered]
  );
  const totalCars = useMemo(
    () => filtered.reduce((s, r) => s + (r.CARSCount ?? 0), 0),
    [filtered]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-secondary dark:text-gray-100" dir="rtl">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-secondary dark:hover:text-white transition-colors"
              aria-label="العودة"
            >
              <span className="material-icons">arrow_forward</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">نظرة عامة على المستثمرين</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">نظام إدارة الاستثمارات والأسطول</p>
            </div>
          </div>
          <button type="button" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800" aria-label="إشعارات">
            <span className="material-icons text-secondary dark:text-white">notifications</span>
          </button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pr-10 pl-4 py-2 text-sm rounded-xl border-0 bg-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary dark:focus:ring-gold"
              placeholder="بحث عن مستثمر..."
            />
          </div>
          <button type="button" className="bg-secondary dark:bg-primary text-white p-2 rounded-xl flex items-center justify-center" aria-label="تصفية">
            <span className="material-icons">tune</span>
          </button>
          <button type="button" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl flex items-center justify-center text-secondary dark:text-white" aria-label="تحميل">
            <span className="material-icons">file_download</span>
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">إجمالي الإيرادات</p>
            <p className="text-lg font-bold">{formatNum(totalRevenues)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">إجمالي السيارات</p>
            <p className="text-lg font-bold">{totalCars} مركبة</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold min-w-[50px]">م</th>
                  <th className="px-4 py-3 font-semibold min-w-[140px] sticky right-0 z-10 bg-gray-50 dark:bg-gray-900 shadow-[ -4px 0 8px -2px rgba(0,0,0,0.05)] dark:shadow-[ -4px 0 8px -2px rgba(0,0,0,0.2)]">اسم المستثمر</th>
                  <th className="px-4 py-3 font-semibold text-center">السيارات</th>
                  <th className="px-4 py-3 font-semibold">الايراد</th>
                  <th className="px-4 py-3 font-semibold text-red-500">المصروف</th>
                  <th className="px-4 py-3 font-semibold">الصافي</th>
                  <th className="px-4 py-3 font-semibold">المسحوب</th>
                  <th className="px-4 py-3 font-semibold">المتبقى</th>
                  <th className="px-4 py-3 font-semibold">رصيد سابق</th>
                  <th className="px-4 py-3 font-semibold bg-gray-100 dark:bg-gray-700/50">الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      لا توجد بيانات
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-4 text-gray-400">{row.investorId}</td>
                      <td className="px-4 py-4 font-semibold sticky right-0 z-10 bg-white dark:bg-gray-800 shadow-[ -4px 0 8px -2px rgba(0,0,0,0.05)] dark:shadow-[ -4px 0 8px -2px rgba(0,0,0,0.2)]">
                        {row.investor.name}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold">
                          {row.CARSCount ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-4">{formatNum(row.revenues)}</td>
                      <td className="px-4 py-4 text-red-500">{formatNum(row.expenses)}</td>
                      <td className="px-4 py-4">{formatNum(row.profit)}</td>
                      <td className="px-4 py-4">{(row.withdrawen ?? 0) > 0 ? <span className="text-orange-500">{formatNum(row.withdrawen)}</span> : formatNum(row.withdrawen)}</td>
                      <td className="px-4 py-4">{formatNum(row.afterwithdrawen)}</td>
                      <td className="px-4 py-4 text-gray-500">{formatNum(row.previousyear)}</td>
                      <td className="px-4 py-4 font-bold bg-gray-50/50 dark:bg-gray-700/20">{formatNum(row.netprofit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500">
              عرض {filtered.length === 0 ? 0 : start + 1}-{Math.min(start + PAGE_SIZE, filtered.length)} من {filtered.length} مستثمر
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
                className="p-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 disabled:opacity-50"
              >
                <span className="material-icons text-sm">chevron_right</span>
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page <= 0}
                className="p-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-secondary dark:text-white disabled:opacity-50"
              >
                <span className="material-icons text-sm">chevron_left</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/admin/funds/cars"
            className="w-full bg-secondary dark:bg-primary text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <span className="material-icons">add</span>
            إضافة مستثمر جديد
          </Link>
          <button
            type="button"
            className="w-full bg-white dark:bg-gray-800 text-secondary dark:text-white border border-gray-200 dark:border-gray-700 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <span className="material-icons">description</span>
            تحميل التقارير السنوية
          </button>
        </div>
      </main>
    </div>
  );
}
