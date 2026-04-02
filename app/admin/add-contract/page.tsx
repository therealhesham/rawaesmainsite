"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileSignature,
    Upload,
    FileText,
    X,
    CheckCircle,
    Loader2,
    Search,
    User,
    Info,
} from "lucide-react";
import { getInvestors, uploadReport } from "../actions";

type Investor = { id: number; name: string };

/** عقد واحد لكل مستثمر واحد — يُخزَّن كنوع `contract` (العقود العامة) كما في صفحة المستثمر */
export default function AddContractPage() {
    const [file, setFile] = useState<File | null>(null);
    const [fileNameLabel, setFileNameLabel] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

    const [investorCatalog, setInvestorCatalog] = useState<Investor[]>([]);
    const [selected, setSelected] = useState<Investor | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerSearch, setPickerSearch] = useState("");

    useEffect(() => {
        getInvestors("").then((list) =>
            setInvestorCatalog(
                list.filter((u: { isAdmin?: boolean }) => !u.isAdmin).map((u: { id: number; name: string }) => ({
                    id: u.id,
                    name: u.name,
                }))
            )
        );
    }, []);

    const pickerOptions = investorCatalog.filter((u) => {
        if (!pickerSearch.trim()) return true;
        const q = pickerSearch.trim().toLowerCase();
        return u.name.toLowerCase().includes(q) || String(u.id).includes(q);
    });

    const handleUpload = async () => {
        if (!file || !selected) return;
        setIsUploading(true);
        setResult(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("type", "contract");
            fd.append("userId", String(selected.id));
            if (fileNameLabel.trim()) fd.append("fileName", fileNameLabel.trim());
            const res = await uploadReport(fd);
            if (res && "error" in res && res.error) {
                setResult({ error: res.error });
            } else {
                setResult({ success: true });
                setFile(null);
                setFileNameLabel("");
            }
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
                    <FileSignature className="text-primary" size={32} />
                    إضافة عقد
                </h1>
                <p className="text-gray-500 mt-1">
                    ارفع عقد PDF واحد واربطه بمستثمر واحد فقط، يظهر كـ «العقود العامة» في صفحة المستثمر.
                </p>
            </div>

    
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-6"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المستثمر</label>
                    {selected ? (
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                {selected.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-secondary dark:text-white truncate">{selected.name}</p>
                                <p className="text-xs text-gray-500">#{selected.id}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                title="إلغاء الاختيار"
                            >
                                <X size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setPickerOpen(true)}
                                className="text-sm text-primary font-medium hover:underline"
                            >
                                تغيير
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setPickerOpen(true)}
                            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                        >
                            <Search size={18} />
                            اختر مستثمراً واحداً
                        </button>
                    )}
                </div>

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
                                if (f) {
                                    setFile(f);
                                    setResult(null);
                                }
                            }}
                        />
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${file ? "bg-green-100 text-green-600 dark:bg-green-500/20" : "bg-primary/10 text-primary"}`}
                        >
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
                                onClick={(e) => {
                                    e.preventDefault();
                                    setFile(null);
                                    setResult(null);
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">اسم العرض (اختياري)</label>
                    <input
                        type="text"
                        value={fileNameLabel}
                        onChange={(e) => setFileNameLabel(e.target.value)}
                        placeholder="يظهر للمستثمر بدل اسم الملف الأصلي"
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                </div>

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl text-sm flex flex-col gap-2 ${
                            result.error
                                ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300"
                                : "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {result.error ? <X size={18} className="shrink-0" /> : <CheckCircle size={18} className="shrink-0" />}
                            {result.error ?? "تم إضافة العقد بنجاح."}
                        </div>
                        {result.success && selected && (
                            <Link
                                href={`/admin/investors/${selected.id}`}
                                className="text-primary font-medium hover:underline text-sm inline-block"
                            >
                                فتح صفحة المستثمر
                            </Link>
                        )}
                    </motion.div>
                )}

                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading || !file || !selected}
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
                            رفع العقد
                        </>
                    )}
                </button>
            </motion.div>

            <AnimatePresence>
                {pickerOpen && (
                    <motion.div
                        key="picker-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPickerOpen(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col"
                            dir="rtl"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
                                <h3 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
                                    <User className="text-primary" size={22} />
                                    اختيار مستثمر واحد
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
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={pickerSearch}
                                        onChange={(e) => setPickerSearch(e.target.value)}
                                        placeholder="ابحث بالاسم أو رقم المعرف..."
                                        className="w-full p-2.5 pe-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        autoComplete="off"
                                        autoFocus
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>

                                <ul className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-sm divide-y divide-gray-100 dark:divide-gray-700">
                                    {pickerOptions.length === 0 ? (
                                        <li className="p-4 text-center text-gray-500 text-xs">لا يوجد مستثمرون مطابقون.</li>
                                    ) : (
                                        pickerOptions.slice(0, 150).map((u) => (
                                            <li key={u.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelected(u);
                                                        setPickerOpen(false);
                                                        setPickerSearch("");
                                                    }}
                                                    className="w-full text-right px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors flex items-center gap-2"
                                                >
                                                    <User size={16} className="opacity-50 shrink-0" />
                                                    <span className="truncate">{u.name}</span>
                                                    <span className="text-xs text-gray-400 ms-auto">#{u.id}</span>
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
                                    className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-secondary dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
