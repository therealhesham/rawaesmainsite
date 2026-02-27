"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { getInvestors, getInvestor, saveInvestorReports, searchInvestorByName } from "../actions";

type ExtractResult = {
    status: string;
    message?: string;
    success_count?: number;
    total_jobs?: number;
    investors_files?: Record<string, string[]>;
};

type SaveModalState = {
    excelName: string;
    urls: string[];
} | null;

export default function ExtractReportsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [result, setResult] = useState<ExtractResult | null>(null);
    const [reportType, setReportType] = useState("lease");
    const [isDragging, setIsDragging] = useState(false);

    const [saveModal, setSaveModal] = useState<SaveModalState>(null);
    const [investors, setInvestors] = useState<{ id: number; name: string }[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [investorSearch, setInvestorSearch] = useState("");
    const [showInvestorDropdown, setShowInvestorDropdown] = useState(false);
    const autocompleteRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    /** أسماء المستثمرين اللي تم حفظ ملفاتهم — يُخفَوون من القائمة عشان ميترفعوش تاني */
    const [savedInvestorNames, setSavedInvestorNames] = useState<string[]>([]);
    /** URLs مستبعدة من كل مستثمر */
    const [removedUrls, setRemovedUrls] = useState<Record<string, string[]>>({});
    /** تقارير المستثمر المختار (للعرض في المودال) */
    const [existingReports, setExistingReports] = useState<{ id: number; fileName: string | null; linkUrl: string; type: string; createdAt: Date }[]>([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<{ id: number; name: string }[]>([]);
    const [autoMatchedExact, setAutoMatchedExact] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) {
            setFile(f);
            setResult(null);
            setSavedInvestorNames([]);
        }
    };

    const handleExtract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setIsExtracting(true);
        setResult(null);
        setSavedInvestorNames([]);
        setRemovedUrls({});
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/admin/extract-reports", {
                method: "POST",
                body: formData,
            });
            const data: ExtractResult = await res.json();
            setResult(data);
            if (!res.ok) throw new Error(data.message || "فشل الطلب");
        } catch (err) {
            setResult({
                status: "error",
                message: err instanceof Error ? err.message : "حدث خطأ أثناء الاستخراج.",
            });
        } finally {
            setIsExtracting(false);
        }
    };

    useEffect(() => {
        if (saveModal) {
            setSelectedUserId("");
            setInvestorSearch(saveModal.excelName);
            setSaveSuccess(null);
            setExistingReports([]);
            setAutoMatchedExact(false);
            setSearchResults([]);

            // Auto-search the DB with the Excel name
            setIsSearching(true);
            searchInvestorByName(saveModal.excelName).then((res) => {
                if (res.exact) {
                    // Exact match found — auto-select
                    setSelectedUserId(String(res.exact.id));
                    setInvestorSearch(res.exact.name);
                    setAutoMatchedExact(true);
                    setShowInvestorDropdown(false);
                } else {
                    setSearchResults(res.suggestions);
                    setShowInvestorDropdown(res.suggestions.length > 0);
                }
            }).finally(() => setIsSearching(false));

            // Also load all investors for manual search fallback
            getInvestors("").then((list) => {
                setInvestors(list.map((u: { id: number; name: string }) => ({ id: u.id, name: u.name })));
            });
        }
    }, [saveModal]);

    // Close autocomplete dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
                setShowInvestorDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // When typing manually, do server-side search
    const handleInvestorSearchChange = async (value: string) => {
        setInvestorSearch(value);
        setAutoMatchedExact(false);
        if (!value.trim()) {
            setSelectedUserId("");
            setSearchResults([]);
            setShowInvestorDropdown(false);
            return;
        }
        setIsSearching(true);
        const res = await searchInvestorByName(value);
        if (res.exact) {
            setSearchResults([res.exact]);
        } else {
            setSearchResults(res.suggestions);
        }
        setShowInvestorDropdown(true);
        setIsSearching(false);
    };

    // Combine search results — DB results first, then client-side fallback
    const filteredInvestors = (() => {
        if (searchResults.length > 0) return searchResults;
        if (!investorSearch.trim()) return investors;
        // Client-side fallback
        return investors.filter(u =>
            u.name.toLowerCase().includes(investorSearch.toLowerCase())
        );
    })();

    useEffect(() => {
        if (!selectedUserId) {
            setExistingReports([]);
            return;
        }
        setLoadingReports(true);
        getInvestor(parseInt(selectedUserId, 10)).then((investor) => {
            setExistingReports(investor?.reports ?? []);
            setLoadingReports(false);
        }).catch(() => setLoadingReports(false));
    }, [selectedUserId]);

    const handleOpenSaveModal = (excelName: string, urls: string[]) => {
        setSaveModal({ excelName, urls });
    };

    const handleSaveOneInvestor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!saveModal || !selectedUserId) return;
        setIsSaving(true);
        setSaveSuccess(null);
        try {
            const res = await saveInvestorReports(parseInt(selectedUserId, 10), saveModal.urls, reportType);
            if (res.error) {
                setSaveSuccess("error:" + res.error);
            } else {
                setSaveSuccess(`تم حفظ ${res.created} تقريراً بنجاح.`);
                setSavedInvestorNames((prev) => [...prev, saveModal.excelName]);
                setTimeout(() => {
                    setSaveModal(null);
                }, 1200);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const investorsFiles = result?.investors_files && Object.keys(result.investors_files).length > 0;

    return (
        <div className="space-y-8" dir="rtl">
            <div>
                <h1 className="text-3xl font-bold text-secondary dark:text-white flex items-center gap-2">
                    <span className="material-icons text-primary">table_chart</span>
                    استخراج تقارير من Excel
                </h1>
                <p className="text-gray-500 mt-1">
                    ارفع ملف Excel (يحتوي شيت &quot;قائمة المستثمرين&quot;) ليتم استخراج ملفات PDF لكل مستثمر ثم حفظ الروابط في جدول التقارير.
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6"
            >
                <h2 className="text-lg font-bold text-secondary dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-icons text-primary">upload_file</span>
                    رفع ملف Excel
                </h2>
                <form onSubmit={handleExtract} className="space-y-4">
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                    setFile(f);
                                    setResult(null);
                                    setSavedInvestorNames([]);
                                }
                            }}
                            className="absolute w-0 h-0 opacity-0"
                            id="excel-upload"
                        />
                        <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center gap-3">
                            <div
                                className={`w-14 h-14 rounded-full flex items-center justify-center ${file ? "bg-green-100 text-green-600 dark:bg-green-500/20" : "bg-primary/10 text-primary"
                                    }`}
                            >
                                <span className="material-icons text-3xl">{file ? "check_circle" : "table_chart"}</span>
                            </div>
                            <div>
                                <p className="font-medium text-secondary dark:text-white">
                                    {file ? file.name : "اضغط أو اسحب ملف Excel هنا"}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "xlsx أو xls، بحد أقصى 50 ميجا"}
                                </p>
                            </div>
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={isExtracting || !file}
                        className="w-full md:w-auto px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExtracting ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                جاري الاستخراج...
                            </>
                        ) : (
                            <>
                                <span className="material-icons">hub</span>
                                استخراج PDF من Excel
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                    {result.status === "error" || result.status === "warning" ? (
                        <div className="p-6">
                            <div
                                className={`flex items-center gap-2 p-4 rounded-xl ${result.status === "error"
                                    ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300"
                                    : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                    }`}
                            >
                                <span className="material-icons">{result.status === "error" ? "error" : "warning"}</span>
                                <span>{result.message}</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <span className="material-icons">check_circle</span>
                                    <span>{result.message}</span>
                                </div>
                                {result.success_count != null && (
                                    <span className="text-sm text-gray-500">
                                        {result.success_count} من {result.total_jobs} ملف PDF
                                    </span>
                                )}
                            </div>

                            {investorsFiles && (
                                <div className="p-6">
                                    <div className="flex flex-wrap items-center gap-4 mb-4">
                                        <h3 className="text-lg font-bold text-secondary dark:text-white">
                                            الملفات حسب المستثمر
                                        </h3>
                                        <span className="text-sm text-gray-500">اختر نوع التقرير ثم اضغط حفظ بجانب كل مستثمر لربطه بمستثمر في النظام.</span>
                                        <select
                                            value={reportType}
                                            onChange={(e) => setReportType(e.target.value)}
                                            required
                                            className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                        >
                                            <option value="">اختر نوع التقرير</option>
                                            <option value="lease">تقرير تأجير سيارات</option>
                                            {/* <option value="lease">عقد استثمار تأجير</option> */}
                                            <option value="contract">العقود العامة</option>
                                            <option value="hotel">عقد استثمار فنادق</option>
                                            <option value="real_estate">عقد استثمار عقاري</option>
                                            <option value="installment">عقد استثمار تقسيط</option>
                                        </select>
                                    </div>
                                    <div className="space-y-6">
                                        {Object.entries(result.investors_files!)
                                            .filter(([name]) => !savedInvestorNames.includes(name))
                                            .map(([name, allUrls]) => {
                                                const urls = allUrls.filter((u) => !(removedUrls[name] || []).includes(u));
                                                return (
                                                    <div
                                                        key={name}
                                                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30"
                                                    >
                                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                                            <div className="font-bold text-secondary dark:text-white flex items-center gap-2">
                                                                <span className="material-icons text-primary">person</span>
                                                                {name}
                                                                <span className="text-xs font-normal text-gray-400">({urls.length} ملف)</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenSaveModal(name, urls)}
                                                                disabled={urls.length === 0}
                                                                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <span className="material-icons text-lg">save</span>
                                                                حفظ
                                                            </button>
                                                        </div>
                                                        {urls.length === 0 ? (
                                                            <p className="text-sm text-gray-400 text-center py-4">تم استبعاد جميع الملفات.</p>
                                                        ) : (
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                                {urls.map((url, i) => (
                                                                    <div key={url} className="group relative rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary overflow-hidden bg-white dark:bg-gray-800/50 transition-all">
                                                                        {/* Remove button */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setRemovedUrls((prev) => ({
                                                                                    ...prev,
                                                                                    [name]: [...(prev[name] || []), url],
                                                                                }));
                                                                            }}
                                                                            className="absolute top-1.5 right-1.5 z-10 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                                                                            title="استبعاد هذا الملف"
                                                                        >
                                                                            <span className="material-icons text-base">close</span>
                                                                        </button>
                                                                        {/* PDF Preview */}
                                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                                                                            <div className="relative w-full h-36 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                                                                                <iframe
                                                                                    src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                                                                    className="w-full h-full border-0 pointer-events-none"
                                                                                    title={`PDF ${i + 1}`}
                                                                                    loading="lazy"
                                                                                />
                                                                                <div className="absolute inset-0 bg-transparent group-hover:bg-primary/5 transition-colors" />
                                                                            </div>
                                                                            <div className="p-2 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700">
                                                                                <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                                                                    <span className="material-icons text-base">picture_as_pdf</span>
                                                                                </div>
                                                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">PDF {i + 1}</span>
                                                                            </div>
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            <AnimatePresence>
                                {saveModal && (
                                    <motion.div
                                        key="save-modal"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                                    >
                                        <div
                                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                            onClick={() => !isSaving && setSaveModal(null)}
                                            aria-hidden
                                        />
                                        <motion.div
                                            initial={{ scale: 0.95 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0.95 }}
                                            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col"
                                            dir="rtl"
                                        >
                                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                                                <h3 className="text-xl font-bold text-secondary dark:text-white">
                                                    ربط التقارير بمستثمر في النظام
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => !isSaving && setSaveModal(null)}
                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                >
                                                    <span className="material-icons">close</span>
                                                </button>
                                            </div>
                                            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">
                                                        الاسم في Excel: <strong className="text-gray-700 dark:text-gray-300">{saveModal.excelName}</strong>
                                                    </p>
                                                    {autoMatchedExact ? (
                                                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                                            <span className="material-icons text-sm">check_circle</span>
                                                            تم العثور على المستثمر تلقائياً!
                                                        </p>
                                                    ) : isSearching ? (
                                                        <p className="text-sm text-primary flex items-center gap-1">
                                                            <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                            جاري البحث عن المستثمر...
                                                        </p>
                                                    ) : searchResults.length > 0 && !selectedUserId ? (
                                                        <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                            <span className="material-icons text-sm">info</span>
                                                            لم يتم العثور على تطابق تام — اختر من الأسماء المقاربة أدناه
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">
                                                            {saveModal.urls.length} ملف PDF — اختر المستثمر في النظام لربط التقارير به.
                                                        </p>
                                                    )}
                                                </div>
                                                <form onSubmit={handleSaveOneInvestor} className="space-y-4" id="save-investor-form">
                                                    <div ref={autocompleteRef} className={`relative ${showInvestorDropdown ? 'pb-56' : ''}`}>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            المستثمر في النظام
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={investorSearch}
                                                                onChange={(e) => handleInvestorSearchChange(e.target.value)}
                                                                onFocus={() => {
                                                                    if (filteredInvestors.length > 0) setShowInvestorDropdown(true);
                                                                }}
                                                                placeholder="ابحث عن اسم المستثمر..."
                                                                className={`w-full p-2.5 pe-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${selectedUserId ? 'ps-9' : ''}`}
                                                                autoComplete="off"
                                                            />
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                                {isSearching ? (
                                                                    <span className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin block" />
                                                                ) : (
                                                                    <span className="material-icons text-xl">search</span>
                                                                )}
                                                            </span>
                                                            {selectedUserId && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedUserId("");
                                                                        setInvestorSearch("");
                                                                        setShowInvestorDropdown(false);
                                                                    }}
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <span className="material-icons text-lg">close</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        {/* Hidden required input for form validation */}
                                                        <input type="hidden" name="selectedUserId" value={selectedUserId} required />
                                                        <AnimatePresence>
                                                            {showInvestorDropdown && (
                                                                <motion.ul
                                                                    initial={{ opacity: 0, y: -4 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -4 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="absolute z-[9999] mt-1 w-full max-h-52 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl"
                                                                >
                                                                    {filteredInvestors.length === 0 ? (
                                                                        <li className="p-3 text-sm text-gray-500 text-center">لا توجد نتائج</li>
                                                                    ) : (
                                                                        filteredInvestors.map((u) => (
                                                                            <li
                                                                                key={u.id}
                                                                                onClick={() => {
                                                                                    setSelectedUserId(String(u.id));
                                                                                    setInvestorSearch(u.name);
                                                                                    setShowInvestorDropdown(false);
                                                                                }}
                                                                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2 ${String(u.id) === selectedUserId
                                                                                    ? "bg-primary/10 text-primary font-medium"
                                                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                                    }`}
                                                                            >
                                                                                <span className="material-icons text-base opacity-60">person</span>
                                                                                {u.name}
                                                                            </li>
                                                                        ))
                                                                    )}
                                                                </motion.ul>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </form>

                                                {selectedUserId && (
                                                    <div>
                                                        <h4 className="text-sm font-bold text-secondary dark:text-white mb-3 flex items-center gap-2">
                                                            <span className="material-icons text-primary text-lg">folder_open</span>
                                                            ملفاته السابقة ({existingReports.length})
                                                        </h4>
                                                        {loadingReports ? (
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                                {[1, 2, 3, 4].map((i) => (
                                                                    <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                                                                ))}
                                                            </div>
                                                        ) : existingReports.length === 0 ? (
                                                            <p className="text-sm text-gray-500 py-4">لا توجد تقارير مسجلة لهذا المستثمر.</p>
                                                        ) : (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                                {existingReports.map((report) => (
                                                                    <a
                                                                        key={report.id}
                                                                        href={report.linkUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="group flex flex-col rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-lg transition-all overflow-hidden bg-white dark:bg-gray-800/50"
                                                                    >
                                                                        {/* PDF Preview */}
                                                                        <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                                                                            <iframe
                                                                                src={`${report.linkUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                                                                className="w-full h-full border-0 pointer-events-none"
                                                                                title={report.fileName || report.type}
                                                                                loading="lazy"
                                                                            />
                                                                            {/* Overlay for click-through */}
                                                                            <div className="absolute inset-0 bg-transparent group-hover:bg-primary/5 transition-colors" />
                                                                            {/* Hover icon */}
                                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
                                                                                    <span className="material-icons text-2xl">open_in_new</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {/* File info */}
                                                                        <div className="p-3 flex items-center gap-3 border-t border-gray-100 dark:border-gray-700">
                                                                            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                                                                <span className="material-icons text-xl">picture_as_pdf</span>
                                                                            </div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={report.fileName || report.type}>
                                                                                    {report.fileName || report.type}
                                                                                </p>
                                                                                <p className="text-[11px] text-gray-400">
                                                                                    {new Date(report.createdAt).toLocaleDateString("ar-EG")}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {saveSuccess && (
                                                    <div
                                                        className={`p-3 rounded-xl text-sm ${saveSuccess.startsWith("error:")
                                                            ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300"
                                                            : "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300"
                                                            }`}
                                                    >
                                                        {saveSuccess.startsWith("error:") ? saveSuccess.slice(6) : saveSuccess}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => !isSaving && setSaveModal(null)}
                                                    className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl"
                                                >
                                                    إلغاء
                                                </button>
                                                <button
                                                    type="submit"
                                                    form="save-investor-form"
                                                    disabled={isSaving || !selectedUserId}
                                                    className="flex-1 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            جاري الحفظ...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-icons text-lg">save</span>
                                                            حفظ
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </motion.div>
            )}
        </div>
    );
}
