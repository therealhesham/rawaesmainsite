"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Paperclip, Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import { getInvestors, getInvestmentSectors, bulkUploadReport } from "../actions";

export default function BulkAttachmentsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [year, setYear] = useState("");
    const [sectorId, setSectorId] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; created?: number; error?: string } | null>(null);

    const [sectors, setSectors] = useState<{ id: number; key: string; nameAr: string | null }[]>([]);
    const [allInvestorIds, setAllInvestorIds] = useState<number[]>([]);

    const previousYear = new Date().getFullYear() - 1;

    useEffect(() => {
        getInvestmentSectors().then(setSectors);
        getInvestors("").then((list) =>
            setAllInvestorIds(list.filter((u: any) => !u.isAdmin).map((u: any) => u.id))
        );
    }, []);

    const handleUpload = async () => {
        if (!file || allInvestorIds.length === 0) return;
        setIsUploading(true);
        setResult(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("type", "attachment");
            fd.append("investorIds", allInvestorIds.join(","));
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

    return (
        <div className="space-y-8 max-w-2xl mx-auto" dir="rtl">
            <div>
                <h1 className="text-3xl font-bold text-secondary dark:text-white flex items-center gap-2">
                    <Paperclip className="text-primary" size={32} />
                    إرفاق ملف جماعي
                </h1>
                <p className="text-gray-500 mt-1">
                    ارفع ملف PDF واحد وسيتم إضافته كمرفق لكل المستثمرين أو لمستثمري قطاع معين.
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
                            لو اخترت قطاع، المرفق هيترفع بس لمستثمري القطاع ده.
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
                    disabled={isUploading || !file}
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
                            إضافة مرفق {sectorId ? "لمستثمري القطاع" : `لـ ${allInvestorIds.length} مستثمر`}
                        </>
                    )}
                </button>
            </motion.div>
        </div>
    );
}
