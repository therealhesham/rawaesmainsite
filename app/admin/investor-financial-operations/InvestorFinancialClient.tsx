"use client";

import { useState, useTransition, useMemo, useRef, useEffect } from "react";
import {
  createFinancialOperation,
  listFinancialOperations,
  type FinancialOpRow,
} from "./actions";
import { Wallet, User, Calendar, Coins, AlertCircle, CheckCircle, RefreshCw, ChevronDown, Plus, X } from "lucide-react";
import type { InvestorFinancialOperationType } from "@prisma/client";

type Investor = { id: number; name: string };

const TYPE_LABELS: Record<InvestorFinancialOperationType, string> = {
  INVESTMENT_INJECTION: "ضخ استثمار",
  DISTRIBUTION_ACCRUAL: "إثبات استحقاق توزيعات",
  BALANCE_WITHDRAWAL: "سحب من الرصيد",
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function normalizeSearch(s: string) {
  return s.trim().toLowerCase();
}

function InvestorAutocomplete({
  investors,
  userId,
  onUserIdChange,
  disabled,
}: {
  investors: Investor[];
  userId: string;
  onUserIdChange: (id: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return investors.slice(0, 80);
    const byName = investors.filter((i) => normalizeSearch(i.name).includes(q));
    const idMatch = /^\d+$/.test(query.trim())
      ? investors.filter((i) => String(i.id).includes(query.trim()))
      : [];
    const seen = new Set<number>();
    const out: Investor[] = [];
    for (const i of [...byName, ...idMatch]) {
      if (!seen.has(i.id)) {
        seen.add(i.id);
        out.push(i);
      }
    }
    return out.slice(0, 50);
  }, [investors, query]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (inv: Investor) => {
    onUserIdChange(String(inv.id));
    setQuery(inv.name);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={18} />
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#003B46] z-10 disabled:opacity-40"
        aria-label="فتح القائمة"
      >
        <ChevronDown size={18} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
      <input
        type="text"
        autoComplete="off"
        disabled={disabled}
        value={query}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          onUserIdChange("");
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
            setOpen(true);
            return;
          }
          if (e.key === "Escape") {
            setOpen(false);
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, Math.max(0, filtered.length - 1)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(0, h - 1));
          } else if (e.key === "Enter" && open && filtered[highlight]) {
            e.preventDefault();
            pick(filtered[highlight]);
          }
        }}
        placeholder="ابحث بالاسم أو رقم المعرّف…"
        className="w-full rounded-xl border border-gray-200 py-3 pr-10 pl-10 text-gray-800 focus:ring-2 focus:ring-[#003B46]/20 focus:border-[#003B46] outline-none disabled:bg-gray-50"
        dir="rtl"
      />
      {open && filtered.length > 0 && (
        <ul
          className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1 text-right"
          role="listbox"
        >
          {filtered.map((inv, idx) => (
            <li key={inv.id} role="option" aria-selected={idx === highlight}>
              <button
                type="button"
                className={`w-full px-3 py-2.5 text-sm text-right hover:bg-[#003B46]/5 flex flex-col gap-0.5 ${
                  idx === highlight ? "bg-[#003B46]/10" : ""
                }`}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(inv)}
              >
                <span className="font-medium text-gray-900">{inv.name}</span>
                <span className="text-xs text-gray-400 font-mono dir-ltr text-right">#{inv.id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg px-3 py-4 text-sm text-gray-500 text-center">
          لا يوجد مستثمر مطابق
        </div>
      )}
    </div>
  );
}

export function InvestorFinancialClient({
  investors,
  initialRows,
}: {
  investors: Investor[];
  initialRows: FinancialOpRow[];
}) {
  const [rows, setRows] = useState<FinancialOpRow[]>(initialRows);
  const [investorFieldKey, setInvestorFieldKey] = useState(0);
  const [userId, setUserId] = useState("");
  const [type, setType] = useState<InvestorFinancialOperationType>("INVESTMENT_INJECTION");
  const [amount, setAmount] = useState("");
  const [operationDate, setOperationDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const resetForm = () => {
    setAmount("");
    setUserId("");
    setType("INVESTMENT_INJECTION");
    const d = new Date();
    setOperationDate(d.toISOString().slice(0, 10));
    setInvestorFieldKey((k) => k + 1);
  };

  const reload = () => {
    setRefreshing(true);
    startTransition(async () => {
      const next = await listFinancialOperations();
      setRows(next);
      setRefreshing(false);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    const fd = new FormData();
    fd.set("userId", userId);
    fd.set("type", type);
    fd.set("amount", amount);
    fd.set("operationDate", operationDate);
    startTransition(async () => {
      const res = await createFinancialOperation(fd);
      setResult(res as { success?: boolean; error?: string });
      if ((res as { success?: boolean }).success) {
        resetForm();
        setIsModalOpen(false);
        const next = await listFinancialOperations();
        setRows(next);
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-[#003B46] to-[#005F6B] p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <Wallet size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold">العمليات المالية</h1>
                <p className="text-sm text-white/70 mt-0.5">
                  يمكنك إضافة عملية جديدة عبر النافذة المنبثقة
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setResult(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/35 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <Plus size={15} />
              إضافة عملية
            </button>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-l from-[#C9A84C] via-[#F0C040] to-[#C9A84C]" />

        {result?.success && (
          <div className="mx-6 my-5 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm p-4">
            <CheckCircle size={18} />
            تم حفظ العملية بنجاح.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isPending && setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-100">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <h3 className="text-lg font-bold text-[#003B46]">إضافة عملية مالية</h3>
              <button
                type="button"
                onClick={() => !isPending && setIsModalOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">المستثمر</label>
                <InvestorAutocomplete
                  key={investorFieldKey}
                  investors={investors}
                  userId={userId}
                  onUserIdChange={setUserId}
                  disabled={investors.length === 0 || isPending}
                />
                <p className="text-xs text-gray-500 mt-1.5">اكتب للبحث أو اختر من القائمة</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نوع العملية</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as InvestorFinancialOperationType)}
                  className="w-full rounded-xl border border-gray-200 py-3 px-4 text-gray-800 focus:ring-2 focus:ring-[#003B46]/20 focus:border-[#003B46] outline-none"
                >
                  <option value="INVESTMENT_INJECTION">{TYPE_LABELS.INVESTMENT_INJECTION}</option>
                  <option value="DISTRIBUTION_ACCRUAL">{TYPE_LABELS.DISTRIBUTION_ACCRUAL}</option>
                  <option value="BALANCE_WITHDRAWAL">{TYPE_LABELS.BALANCE_WITHDRAWAL}</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">المبلغ</label>
                  <div className="relative">
                    <Coins className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="مثال: 5000 أو 5000.50"
                      className="w-full rounded-xl border border-gray-200 py-3 pr-10 pl-4 text-gray-800 focus:ring-2 focus:ring-[#003B46]/20 focus:border-[#003B46] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ العملية</label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      required
                      value={operationDate}
                      onChange={(e) => setOperationDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 py-3 pr-10 pl-4 text-gray-800 focus:ring-2 focus:ring-[#003B46]/20 focus:border-[#003B46] outline-none"
                    />
                  </div>
                </div>
              </div>

              {result?.error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm p-4">
                  <AlertCircle className="shrink-0 mt-0.5" size={18} />
                  <span>{result.error}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                  className="rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-semibold py-2.5 px-5 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isPending || investors.length === 0 || !userId}
                  className="rounded-xl bg-[#003B46] hover:bg-[#002830] disabled:opacity-50 text-white font-semibold py-2.5 px-6 transition-colors inline-flex items-center gap-2"
                >
                  {isPending ? "جاري الحفظ…" : "حفظ العملية"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#003B46]">آخر العمليات المسجّلة</h2>
          <button
            type="button"
            onClick={reload}
            disabled={refreshing || isPending}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#003B46] hover:underline disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            تحديث القائمة
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right min-w-[640px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                <th className="p-3 font-semibold">التاريخ</th>
                <th className="p-3 font-semibold">المستثمر</th>
                <th className="p-3 font-semibold">النوع</th>
                <th className="p-3 font-semibold">المبلغ</th>
                <th className="p-3 font-semibold">سجّلها</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    لا توجد عمليات بعد.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const amt = Number(r.amount);
                  return (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                      <td className="p-3 whitespace-nowrap">
                        {new Date(r.operationDate).toLocaleDateString("ar-SA", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3 font-medium">{r.user.name}</td>
                      <td className="p-3">{TYPE_LABELS[r.type]}</td>
                      <td className="p-3 font-mono tabular-nums">{formatMoney(amt)}</td>
                      <td className="p-3 text-gray-500 text-xs">
                        {r.createdByAdmin?.name ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
