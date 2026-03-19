"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { getInvestors, getInvestor, searchInvestorByName, getPresignedUploadUrl, createReportRecord } from "../actions";
import { FileSpreadsheet, Upload, CheckCircle, FileOutput, AlertCircle, AlertTriangle, User, Save, X, FileText, Info, Search, FolderOpen, ExternalLink, Archive } from "lucide-react";

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
    const [reportType, setReportType] = useState("");
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
    const [year, setYear] = useState<string>("");

    /** حالة حفظ الكل: المستثمرون الذين لا يوجد لهم تطابق تام */
    type UnmatchedItem = { excelName: string; urls: string[]; suggestions: { id: number; name: string }[] };
    const [saveAllModalOpen, setSaveAllModalOpen] = useState(false);
    const [unmatchedForSaveAll, setUnmatchedForSaveAll] = useState<UnmatchedItem[]>([]);
    const [saveAllSelections, setSaveAllSelections] = useState<Record<string, string>>({}); // excelName -> userId
    const [saveAllYear, setSaveAllYear] = useState<string>("");
    const [isSaveAllProcessing, setIsSaveAllProcessing] = useState(false);
    const [saveAllResult, setSaveAllResult] = useState<{ autoSaved: number; manualSaved: number; error?: string } | null>(null);
    /** Autocomplete لحفظ الكل: قيمة البحث، القائمة المفتوحة، نتائج البحث */
    const [saveAllSearchInputs, setSaveAllSearchInputs] = useState<Record<string, string>>({});
    const [saveAllDropdownOpen, setSaveAllDropdownOpen] = useState<string | null>(null);
    const [saveAllSearchResults, setSaveAllSearchResults] = useState<Record<string, { id: number; name: string }[]>>({});
    const [saveAllSearching, setSaveAllSearching] = useState<string | null>(null);
    const saveAllAutocompleteRef = useRef<HTMLDivElement>(null);
    const [uploadProgress, setUploadProgress] = useState<{ filesDone: number; filesTotal: number; mbDone: number } | null>(null);

    /** رفع ملف واحد من المتصفح: تحميل من URL ثم رفع مباشرة لـ DO Spaces */
    const clientUploadOneFile = async (
        pdfUrl: string,
        userId: number,
        fileName: string,
        reportType: string,
        year: number,
        onProgress?: (bytes: number) => void
    ): Promise<{ success: boolean; bytes?: number }> => {
        try {
            const res = await fetch(pdfUrl);
            if (!res.ok) return { success: false };
            const blob = await res.blob();
            const bytes = blob.size;

            const presigned = await getPresignedUploadUrl(userId, fileName);
            if (!presigned) return { success: false };

            const putRes = await fetch(presigned.presignedUrl, {
                method: "PUT",
                body: blob,
                headers: { "Content-Type": "application/pdf" },
            });
            if (!putRes.ok) return { success: false };

            const cr = await createReportRecord(userId, presigned.finalUrl, fileName, reportType, year);
            if (!cr.success) return { success: false };

            onProgress?.(bytes);
            return { success: true, bytes };
        } catch {
            return { success: false };
        }
    };

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
        if (!file || !reportType) return;
        setIsExtracting(true);
        setResult(null);
        setSavedInvestorNames([]);
        setRemovedUrls({});
        setSaveAllResult(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("reportType", reportType);
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
            setYear("");

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
            if (saveAllAutocompleteRef.current && !saveAllAutocompleteRef.current.contains(e.target as Node)) {
                setSaveAllDropdownOpen(null);
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
        const userId = parseInt(selectedUserId, 10);
        const parsedYear = year ? parseInt(year, 10) : new Date().getFullYear() - 1;
        try {
            setUploadProgress({ filesDone: 0, filesTotal: saveModal.urls.length, mbDone: 0 });
            let done = 0, mb = 0;
            const results = await Promise.all(
                saveModal.urls.map(async (url) => {
                    const fileName = decodeURIComponent(url.split("/").pop() || "report.pdf");
                    const r = await clientUploadOneFile(url, userId, fileName, reportType, parsedYear, (bytes) => {
                        done++;
                        mb += bytes;
                        setUploadProgress({ filesDone: done, filesTotal: saveModal.urls.length, mbDone: mb });
                    });
                    return r.success;
                })
            );
            const created = results.filter(Boolean).length;
            setUploadProgress(null);
            if (created === saveModal.urls.length) {
                setSaveSuccess(`تم حفظ ${created} تقريراً بنجاح.`);
                setSavedInvestorNames((prev) => [...prev, saveModal.excelName]);
                setTimeout(() => setSaveModal(null), 1200);
            } else {
                setSaveSuccess(created > 0 ? `error: تم حفظ ${created} فقط، فشل الباقي.` : "error: فشل الرفع. تحقق من CORS على DO Spaces.");
            }
        } catch {
            setUploadProgress(null);
            setSaveSuccess("error: حدث خطأ أثناء الرفع.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAll = async () => {
        if (!result?.investors_files || !reportType) return;
        setIsSaveAllProcessing(true);
        setSaveAllResult(null);
        setUnmatchedForSaveAll([]);
        setSaveAllSelections({});
        setSaveAllModalOpen(false);

        const previousYear = new Date().getFullYear() - 1;
        const parsedYear = saveAllYear ? parseInt(saveAllYear, 10) : previousYear;

        const entries = Object.entries(result.investors_files)
            .filter(([name]) => !savedInvestorNames.includes(name))
            .map(([name, allUrls]) => ({
                excelName: name,
                urls: allUrls.filter((u) => !(removedUrls[name] || []).includes(u)),
            }))
            .filter((e) => e.urls.length > 0);

        if (entries.length === 0) {
            setIsSaveAllProcessing(false);
            return;
        }

        let autoSaved = 0;
        const unmatched: UnmatchedItem[] = [];

        const searchResults = await Promise.all(
            entries.map(async (e) => ({
                ...e,
                search: await searchInvestorByName(e.excelName),
            }))
        );

        const exactMatches = searchResults.filter((r) => r.search.exact);
        if (exactMatches.length > 0) {
            const items: { userId: number; url: string; excelName: string }[] = [];
            exactMatches.forEach(({ excelName, urls, search }) => {
                urls.forEach((url) => items.push({ userId: search.exact!.id, url, excelName }));
            });
            setUploadProgress({ filesDone: 0, filesTotal: items.length, mbDone: 0 });
            let done = 0, mb = 0;
            const savedByExcel = new Set<string>();
            const results = await Promise.all(
                items.map(async (it) => {
                    const r = await clientUploadOneFile(it.url, it.userId, decodeURIComponent(it.url.split("/").pop() || "report.pdf"), reportType, parsedYear);
                    if (r.success) {
                        done++;
                        mb += r.bytes ?? 0;
                        savedByExcel.add(it.excelName);
                    }
                    setUploadProgress({ filesDone: done, filesTotal: items.length, mbDone: mb });
                    return r.success;
                })
            );
            autoSaved = results.filter(Boolean).length;
            if (savedByExcel.size > 0) setSavedInvestorNames((prev) => [...prev, ...savedByExcel]);
            setUploadProgress(null);
        }

        for (const { excelName, urls, search } of searchResults) {
            if (!search.exact) {
                unmatched.push({
                    excelName,
                    urls,
                    suggestions: search.suggestions,
                });
            }
        }

        if (unmatched.length > 0) {
            const initialSelections: Record<string, string> = {};
            const initialInputs: Record<string, string> = {};
            const initialResults: Record<string, { id: number; name: string }[]> = {};
            unmatched.forEach((u) => {
                if (u.suggestions.length > 0) {
                    initialSelections[u.excelName] = String(u.suggestions[0].id);
                    initialInputs[u.excelName] = u.suggestions[0].name;
                    initialResults[u.excelName] = u.suggestions;
                } else {
                    initialInputs[u.excelName] = u.excelName;
                    initialResults[u.excelName] = [];
                }
            });
            setSaveAllSelections(initialSelections);
            setSaveAllSearchInputs(initialInputs);
            setSaveAllSearchResults(initialResults);
            setUnmatchedForSaveAll(unmatched);
            setSaveAllYear(String(previousYear));
            setSaveAllModalOpen(true);
        }

        setSaveAllResult({ autoSaved, manualSaved: 0 });
        setIsSaveAllProcessing(false);
    };

    const handleConfirmSaveAllModal = async () => {
        if (unmatchedForSaveAll.length === 0) {
            setSaveAllModalOpen(false);
            return;
        }
        const withSelection = unmatchedForSaveAll.filter((u) => saveAllSelections[u.excelName]);
        if (withSelection.length === 0) {
            alert("الرجاء اختيار مستثمر واحد على الأقل من القائمة.");
            return;
        }

        setIsSaveAllProcessing(true);
        const previousYear = new Date().getFullYear() - 1;
        const parsedYear = saveAllYear ? parseInt(saveAllYear, 10) : previousYear;

        const items: { userId: number; url: string; excelName: string }[] = [];
        withSelection.forEach((u) => {
            const userId = parseInt(saveAllSelections[u.excelName], 10);
            u.urls.forEach((url) => items.push({ userId, url, excelName: u.excelName }));
        });

        let filesDone = 0;
        let mbDone = 0;
        const savedByExcel = new Set<string>();
        setUploadProgress({ filesDone: 0, filesTotal: items.length, mbDone: 0 });

        const results = await Promise.all(
            items.map((it) =>
                clientUploadOneFile(it.url, it.userId, decodeURIComponent(it.url.split("/").pop() || "report.pdf"), reportType, parsedYear, (bytes: number) => {
                    filesDone++;
                    mbDone += bytes;
                    setUploadProgress({ filesDone, filesTotal: items.length, mbDone });
                    savedByExcel.add(it.excelName);
                })
            )
        );

        const manualSaved = results.filter((r) => r.success).length;
        if (savedByExcel.size > 0) setSavedInvestorNames((prev) => [...prev, ...savedByExcel]);

        setSaveAllResult((prev) => (prev ? { ...prev, manualSaved } : { autoSaved: 0, manualSaved }));
        setSaveAllModalOpen(false);
        setUnmatchedForSaveAll([]);
        setSaveAllSelections({});
        setUploadProgress(null);
        setIsSaveAllProcessing(false);
    };

    const handleSaveAllAutocompleteChange = async (excelName: string, value: string) => {
        setSaveAllSearchInputs((prev) => ({ ...prev, [excelName]: value }));
        setSaveAllDropdownOpen(excelName);
        if (!value.trim()) {
            setSaveAllSearchResults((prev) => ({ ...prev, [excelName]: [] }));
            setSaveAllSelections((prev) => ({ ...prev, [excelName]: "" }));
            return;
        }
        setSaveAllSearching(excelName);
        const res = await searchInvestorByName(value);
        const list = res.exact ? [res.exact] : res.suggestions;
        setSaveAllSearchResults((prev) => ({ ...prev, [excelName]: list }));
        if (res.exact) {
            setSaveAllSelections((prev) => ({ ...prev, [excelName]: String(res.exact.id) }));
        } else {
            setSaveAllSelections((prev) => ({ ...prev, [excelName]: list.length > 0 ? String(list[0].id) : "" }));
        }
        setSaveAllSearching(null);
    };

    const investorsFiles = result?.investors_files && Object.keys(result.investors_files).length > 0;
    const previousYear = new Date().getFullYear() - 1;

    return (
        <div className="space-y-8" dir="rtl">
            <div>
                <h1 className="text-3xl font-bold text-secondary dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="text-primary" size={32} />
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
                    <Upload className="text-primary" size={24} />
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
                                {file ? <CheckCircle size={32} /> : <FileSpreadsheet size={32} />}
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

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            نوع التقرير
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            required
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                        >
                            <option value="">اختر نوع التقرير</option>
                            <option value="lease">تقرير تأجير سيارات</option>
                            <option value="contract">العقود العامة</option>
                            <option value="hotel">عقد استثمار فنادق</option>
                            <option value="real_estate">عقد استثمار عقاري</option>
                            <option value="installment">عقد استثمار تقسيط</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isExtracting || !file || !reportType}
                        className="w-full md:w-auto px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExtracting ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                جاري الاستخراج...
                            </>
                        ) : (
                            <>
                                <FileOutput size={20} />
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
                                {result.status === "error" ? <AlertCircle size={24} className="shrink-0" /> : <AlertTriangle size={24} className="shrink-0" />}
                                <span>{result.message}</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <CheckCircle size={24} />
                                    <span>{result.message}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    {result.success_count != null && (
                                        <span className="text-sm text-gray-500">
                                            {result.success_count} من {result.total_jobs} ملف PDF
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleSaveAll}
                                        disabled={isSaveAllProcessing || !investorsFiles || Object.keys(result.investors_files || {}).filter((n) => !savedInvestorNames.includes(n)).length === 0}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaveAllProcessing ? (
                                            <>
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                جاري الحفظ...
                                            </>
                                        ) : (
                                            <>
                                                <Archive size={20} />
                                                حفظ الكل
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            {uploadProgress && (
                                <div className="px-6 pb-4">
                                    <div className="p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                                        <div className="flex justify-between text-sm text-secondary dark:text-white mb-2">
                                            <span>جاري الرفع: {uploadProgress.filesDone} / {uploadProgress.filesTotal} ملف</span>
                                            <span>{(uploadProgress.mbDone / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-primary"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${uploadProgress.filesTotal > 0 ? (uploadProgress.filesDone / uploadProgress.filesTotal) * 100 : 0}%` }}
                                                transition={{ duration: 0.2 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {saveAllResult && (saveAllResult.autoSaved > 0 || saveAllResult.manualSaved > 0) && (
                                <div className="px-6 pb-4">
                                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
                                        <CheckCircle size={18} />
                                        تم حفظ {saveAllResult.autoSaved + saveAllResult.manualSaved} تقريراً
                                        {saveAllResult.autoSaved > 0 && ` (${saveAllResult.autoSaved} تطابق تام)`}
                                        {saveAllResult.manualSaved > 0 && ` (${saveAllResult.manualSaved} من المودال)`}
                                    </div>
                                </div>
                            )}

                            {investorsFiles && (
                                <div className="p-6">
                                    <div className="flex flex-wrap items-center gap-4 mb-4">
                                        <h3 className="text-lg font-bold text-secondary dark:text-white">
                                            الملفات حسب المستثمر
                                        </h3>
                                        <span className="text-sm text-gray-500">تم اختيار نوع التقرير: {reportType === "lease" ? "تأجير سيارات" : reportType === "hotel" ? "فنادق" : reportType === "contract" ? "العقود العامة" : reportType === "real_estate" ? "عقاري" : reportType === "installment" ? "تقسيط" : reportType}. اضغط حفظ بجانب كل مستثمر لربطه بمستثمر في النظام.</span>
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
                                                                <User className="text-primary" size={20} />
                                                                {name}
                                                                <span className="text-xs font-normal text-gray-400">({urls.length} ملف)</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenSaveModal(name, urls)}
                                                                disabled={urls.length === 0}
                                                                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <Save size={18} />
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
                                                                            <X size={16} />
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
                                                                                    <FileText size={16} />
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
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">
                                                        الاسم في Excel: <strong className="text-gray-700 dark:text-gray-300">{saveModal.excelName}</strong>
                                                    </p>
                                                    {autoMatchedExact ? (
                                                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                                            <CheckCircle size={16} />
                                                            تم العثور على المستثمر تلقائياً!
                                                        </p>
                                                    ) : isSearching ? (
                                                        <p className="text-sm text-primary flex items-center gap-1">
                                                            <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                            جاري البحث عن المستثمر...
                                                        </p>
                                                    ) : searchResults.length > 0 && !selectedUserId ? (
                                                        <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                            <Info size={16} />
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
                                                                    <Search size={20} />
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
                                                                    <X size={18} />
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
                                                                                <User size={16} className="opacity-60" />
                                                                                {u.name}
                                                                            </li>
                                                                        ))
                                                                    )}
                                                                </motion.ul>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                سنة التقرير
                                                            </label>
                                                            <select
                                                                value={year}
                                                                onChange={(e) => setYear(e.target.value)}
                                                                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                                                            >
                                                                <option value="">
                                                                    السنة الماضية ({previousYear}) – افتراضيًا
                                                                </option>
                                                                {[0, 1, 2, 3, 4].map((offset) => {
                                                                    const y = previousYear - offset;
                                                                    return (
                                                                        <option key={y} value={y}>
                                                                            {y}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                إذا لم تختَر سنة، سيتم حفظ التقارير تلقائيًا على سنة {previousYear}.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </form>

                                                {selectedUserId && (
                                                    <div>
                                                        <h4 className="text-sm font-bold text-secondary dark:text-white mb-3 flex items-center gap-2">
                                                            <FolderOpen className="text-primary" size={20} />
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
                                                                                    <ExternalLink size={24} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {/* File info */}
                                                                        <div className="p-3 flex items-center gap-3 border-t border-gray-100 dark:border-gray-700">
                                                                            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                                                                <FileText size={20} />
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
                                                            <Save size={18} />
                                                            حفظ
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}

                                {saveAllModalOpen && unmatchedForSaveAll.length > 0 && (
                                    <motion.div
                                        key="save-all-modal"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                                    >
                                        <div
                                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                            onClick={() => !isSaveAllProcessing && setSaveAllModalOpen(false)}
                                            aria-hidden
                                        />
                                        <motion.div
                                            initial={{ scale: 0.95 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0.95 }}
                                            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-card-dark shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col"
                                            dir="rtl"
                                        >
                                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                                                <h3 className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2">
                                                    <Info className="text-amber-500" size={24} />
                                                    ربط المستثمرين غير المطابقين
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => !isSaveAllProcessing && setSaveAllModalOpen(false)}
                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            <p className="px-6 py-2 text-sm text-gray-500 border-b border-gray-100 dark:border-gray-800">
                                                لم يتم العثور على تطابق تام — اختر المستثمر المناسب لكل اسم من القائمة أدناه:
                                            </p>
                                            <div className="p-6 overflow-y-auto flex-1">
                                                <div ref={saveAllAutocompleteRef} className="space-y-4 mb-4 min-w-0">
                                                    {unmatchedForSaveAll.map((item) => {
                                                        const isOpen = saveAllDropdownOpen === item.excelName;
                                                        const options = saveAllSearchResults[item.excelName] ?? item.suggestions;
                                                        const inputVal = saveAllSearchInputs[item.excelName] ?? item.excelName;
                                                        const isSearching = saveAllSearching === item.excelName;
                                                        return (
                                                            <div
                                                                key={item.excelName}
                                                                className={`grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${isOpen ? "relative z-10" : ""}`}
                                                            >
                                                                <div className="min-w-0">
                                                                    <span className="text-xs text-gray-500 block mb-1">الاسم في Excel</span>
                                                                    <p className="text-secondary dark:text-white font-medium truncate" title={item.excelName}>
                                                                        {item.excelName}
                                                                    </p>
                                                                    <span className="text-xs text-gray-400">({item.urls.length} ملف)</span>
                                                                </div>
                                                                <div className="min-w-0 relative">
                                                                    <span className="text-xs text-gray-500 block mb-1">المستثمر المقترح</span>
                                                                    <div className="relative">
                                                                            <input
                                                                                type="text"
                                                                                value={inputVal}
                                                                                onChange={(e) => handleSaveAllAutocompleteChange(item.excelName, e.target.value)}
                                                                                onFocus={() => setSaveAllDropdownOpen(item.excelName)}
                                                                                placeholder="ابحث أو اختر مستثمر..."
                                                                                autoComplete="off"
                                                                                className={`w-full min-w-0 p-2 pe-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm ${saveAllSelections[item.excelName] ? "ps-10" : ""}`}
                                                                            />
                                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                                                {isSearching ? (
                                                                                    <span className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin block" />
                                                                                ) : (
                                                                                    <Search size={18} />
                                                                                )}
                                                                            </span>
                                                                            {saveAllSelections[item.excelName] && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setSaveAllSelections((prev) => ({ ...prev, [item.excelName]: "" }));
                                                                                        setSaveAllSearchInputs((prev) => ({ ...prev, [item.excelName]: item.excelName }));
                                                                                    }}
                                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                                >
                                                                                    <X size={16} />
                                                                                </button>
                                                                            )}
                                                                            <AnimatePresence>
                                                                                {isOpen && (
                                                                                    <motion.ul
                                                                                        initial={{ opacity: 0, y: -4 }}
                                                                                        animate={{ opacity: 1, y: 0 }}
                                                                                        exit={{ opacity: 0, y: -4 }}
                                                                                        className="absolute z-[9999] mt-1 left-0 right-0 max-h-40 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl"
                                                                                    >
                                                                                        {options.length === 0 ? (
                                                                                            <li className="p-3 text-sm text-gray-500 text-center">لا توجد نتائج</li>
                                                                                        ) : (
                                                                                            options.map((s) => (
                                                                                                <li
                                                                                                    key={s.id}
                                                                                                    onClick={() => {
                                                                                                        setSaveAllSelections((prev) => ({ ...prev, [item.excelName]: String(s.id) }));
                                                                                                        setSaveAllSearchInputs((prev) => ({ ...prev, [item.excelName]: s.name }));
                                                                                                        setSaveAllDropdownOpen(null);
                                                                                                    }}
                                                                                                    className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${String(s.id) === saveAllSelections[item.excelName] ? "bg-primary/10 text-primary font-medium" : ""}`}
                                                                                                >
                                                                                                    <User size={14} />
                                                                                                    {s.name}
                                                                                                </li>
                                                                                            ))
                                                                                        )}
                                                                                    </motion.ul>
                                                                                )}
                                                                            </AnimatePresence>
                                                                        </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سنة التقرير</label>
                                                    <select
                                                        value={saveAllYear}
                                                        onChange={(e) => setSaveAllYear(e.target.value)}
                                                        className="w-full max-w-[120px] p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                                                    >
                                                        {[0, 1, 2, 3, 4].map((offset) => {
                                                            const y = new Date().getFullYear() - 1 - offset;
                                                            return (
                                                                <option key={y} value={y}>
                                                                    {y}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => !isSaveAllProcessing && setSaveAllModalOpen(false)}
                                                    className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl"
                                                >
                                                    إلغاء
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleConfirmSaveAllModal}
                                                    disabled={isSaveAllProcessing || !unmatchedForSaveAll.some((u) => saveAllSelections[u.excelName])}
                                                    className="flex-1 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {isSaveAllProcessing ? (
                                                        <>
                                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            جاري الحفظ...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save size={18} />
                                                            حفظ الكل
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
