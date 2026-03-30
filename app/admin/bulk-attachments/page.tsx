"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Paperclip, Upload, FileText, X, CheckCircle, Loader2, Users, Search, User } from "lucide-react";
import { getInvestors, getInvestmentSectors, getInvestorsBySector, bulkUploadReport } from "../actions";

type Investor = { id: number; name: string };

export default function BulkAttachmentsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [year, setYear] = useState("");
    const [sectorId, setSectorId] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; created?: number; error?: string } | null>(null);

    const [sectors, setSectors] = useState<{ id: number; key: string; nameAr: string | null }[]>([]);
    const [investorCatalog, setInvestorCatalog] = useState<Investor[]>([]);

    const [scopeMode, setScopeMode] = useState<"all" | "selected">("all");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerSearch, setPickerSearch] = useState("");

    const [sectorInvestors, setSectorInvestors] = useState<Investor[]>([]);
    const [sectorLoading, setSectorLoading] = useState(false);

    const previousYear = new Date().getFullYear() - 1;

    useEffect(() => {
        getInvestmentSectors().then(setSectors);
        getInvestors("").then((list) =>
            setInvestorCatalog(
                list.filter((u: any) => !u.isAdmin).map((u: any) => ({ id: u.id, name: u.name }))
            )
        );
    }, []);

    useEffect(() => {
        if (!sectorId) {
            setSectorInvestors([]);
            return;
        }
        setSectorLoading(true);
        getInvestorsBySector(Number(sectorId)).then((list) => {
            setSectorInvestors(list);
            setSectorLoading(false);
            setScopeMode("all");
            setSelectedIds([]);
        });
    }, [sectorId]);

    const activeCatalog = sectorId ? sectorInvestors : investorCatalog;

    const targetIds = scopeMode === "all"
        ? activeCatalog.map((u) => u.id)
        : selectedIds;

    const handleUpload = async () => {
        if (!file || targetIds.length === 0) return;
        setIsUploading(true);
        setResult(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("type", "attachment");
            fd.append("investorIds", targetIds.join(","));
            if (year) fd.append("year", year);
            if (sectorId) fd.append("sectorId", sectorId);
            const res = await bulkUploadReport(fd);
            setResult(res);
            if (res.success) setFile(null);
        } catch {
            setResult({ error: "حدث خطأ أثناء الرفع." });
        } finally {
            setIsUploading(false);
        }
    };

    const pickerOptions = activeCatalog.filter((u) => {
        if (selectedIds.includes(u.id)) return false;
        if (!pickerSearch.trim()) return true;
        const q = pickerSearch.trim().toLowerCase();
        return u.name.toLowerCase().includes(q) || String(u.id).includes(q);
    });

    return (
        <div className="space-y-8 max-w-2xl mx-auto" dir="rtl">
            <div>
                <h1 className="text-3xl font-bold text-secondary dark:text-white flex items-center gap-2">
                    <Paperclip className="text-primary" size={32} />
                    إرفاق ملف جماعي
                </h1>
                <p className="text-gray-500 mt-1">
                    ارفع ملف PDF واحد وسيتم إضافته كمرفق لكل المستثمرين أو لمستثمرين محددين.
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-6"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الملف (PDF)</label>
                    <label
                        className={`flex items-center gap-4 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                            file
                                ? "border-green-300 bg-green-50/50 dark:border-green-600 dark:bg-green-500/10"
                                : "border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            className="sr-only"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) { setFile(f); setResult(null); }
                            }}
                        />
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${file ? "bg-green-100 text-green-600 dark:bg-green-500/20" : "bg-primary/10 text-primary"}`}>
                            {file ? <CheckCircle size={24} /> : <FileText size={24} />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-secondary dark:text-white truncate">
                                {file ? file.name : "اضغط لاختيار ملف PDF"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF فقط"}
                            </p>
                        </div>
                        {file && (
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setFile(null); setResult(null); }}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </label>
                </div>

                {/* Scope selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المستثمرين المستهدفين</label>
                    <div className="flex gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => { setScopeMode("all"); setSelectedIds([]); }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                scopeMode === "all"
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                            <Users size={16} />
                            {sectorId
                                ? `مستثمرين القطاع (${sectorLoading ? "..." : activeCatalog.length})`
                                : `كل المستثمرين (${investorCatalog.length})`}
                        </button>
                        <button
                            type="button"
                            onClick={() => setScopeMode("selected")}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                scopeMode === "selected"
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                            <User size={16} />
                            مستثمرين محددين
                            {selectedIds.length > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-white/20 text-[11px] font-bold">
                                    {selectedIds.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {scopeMode === "selected" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-3"
                        >
                            {selectedIds.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                    {selectedIds.map((id) => {
                                        const inv = activeCatalog.find((x) => x.id === id) ?? investorCatalog.find((x) => x.id === id);
                                        return (
                                            <span
                                                key={id}
                                                className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-lg bg-primary/10 text-primary text-sm border border-primary/20"
                                            >
                                                <span className="truncate max-w-[160px]">{inv?.name ?? id}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedIds((prev) => prev.filter((x) => x !== id))}
                                                    className="p-0.5 rounded hover:bg-primary/20"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => { setPickerSearch(""); setPickerOpen(true); }}
                                className="w-full py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                            >
                                <Search size={16} />
                                {selectedIds.length === 0 ? "اختر مستثمرين" : "إضافة مستثمرين"}
                            </button>
                        </motion.div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">القطاع (اختياري)</label>
                        <select
                            value={sectorId}
                            onChange={(e) => setSectorId(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            <option value="">كل القطاعات</option>
                            {sectors.map((s) => (
                                <option key={s.id} value={s.id}>{s.nameAr || s.key}</option>
                            ))}
                        </select>
                        <p className="text-[11px] text-gray-400 mt-1">
                            {sectorId
                                ? sectorLoading
                                    ? "جاري تحميل مستثمري القطاع..."
                                    : `المرفق هيترفع لـ ${sectorInvestors.length} مستثمر في القطاع ده.`
                                : "لو اخترت قطاع، المرفق هيترفع بس لمستثمري القطاع ده."}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">سنة المرفق</label>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            <option value="">{previousYear} (افتراضي)</option>
                            {[0, 1, 2, 3, 4].map((offset) => {
                                const y = previousYear - offset;
                                return <option key={y} value={y}>{y}</option>;
                            })}
                        </select>
                    </div>
                </div>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                            result.error
                                ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300"
                                : "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300"
                        }`}
                    >
                        {result.error ? (
                            <X size={18} className="shrink-0" />
                        ) : (
                            <CheckCircle size={18} className="shrink-0" />
                        )}
                        {result.error
                            ? result.error
                            : `تم إضافة المرفق بنجاح لـ ${result.created} مستثمر.`}
                    </motion.div>
                )}

                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading || !file || targetIds.length === 0}
                    className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            جاري الرفع...
                        </>
                    ) : (
                        <>
                            <Upload size={20} />
                            إضافة مرفق لـ {scopeMode === "all"
                                ? `${activeCatalog.length} مستثمر${sectorId ? " (القطاع)" : ""}`
                                : `${selectedIds.length} مستثمر محدد`}
                        </>
                    )}
                </button>
            </motion.div>

            {/* Investor picker modal */}
            <AnimatePresence>
                {pickerOpen && (
                    <motion.div
                        key="picker-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setPickerOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col"
                            dir="rtl"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
                                <h3 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
                                    <Users className="text-primary" size={22} />
                                    اختيار مستثمرين
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setPickerOpen(false)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-5 space-y-4 overflow-y-auto flex-1">
                                {selectedIds.length > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500">
                                            تم تحديد {selectedIds.length} مستثمر
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedIds([])}
                                            className="text-xs text-red-500 hover:text-red-700 underline underline-offset-2"
                                        >
                                            مسح الكل
                                        </button>
                                    </div>
                                )}

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={pickerSearch}
                                        onChange={(e) => setPickerSearch(e.target.value)}
                                        placeholder="ابحث باسم المستثمر..."
                                        className="w-full p-2.5 pe-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        autoComplete="off"
                                        autoFocus
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>

                                <ul className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-sm divide-y divide-gray-100 dark:divide-gray-700">
                                    {pickerOptions.length === 0 ? (
                                        <li className="p-4 text-center text-gray-500 text-xs">
                                            {activeCatalog.length === 0
                                                ? (sectorLoading ? "جاري تحميل مستثمري القطاع..." : sectorId ? "لا يوجد مستثمرون في هذا القطاع." : "جاري تحميل القائمة...")
                                                : "لا يوجد مستثمرون مطابقون أو تمت إضافة الجميع."}
                                        </li>
                                    ) : (
                                        pickerOptions.slice(0, 100).map((u) => (
                                            <li key={u.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedIds((prev) => [...prev, u.id]);
                                                        setPickerSearch("");
                                                    }}
                                                    className="w-full text-right px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors flex items-center gap-2"
                                                >
                                                    <User size={16} className="opacity-50 shrink-0" />
                                                    <span className="truncate">{u.name}</span>
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>

                            <div className="p-5 border-t border-gray-100 dark:border-gray-800 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setPickerOpen(false)}
                                    className="w-full py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    تم ({selectedIds.length} مستثمر)
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
