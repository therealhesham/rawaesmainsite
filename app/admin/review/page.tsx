"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getReportsReviewPageData, toggleReportPublish, deleteReport } from "../actions";
import { type ReportReviewFilter, type ReviewPageReport } from "../lib/reportsReview";
import dynamic from "next/dynamic";
import {
    Star,
    CheckCircle,
    User,
    FileText,
    FileMinus,
    Trash,
    Check,
    Trash2,
    X,
    LayoutGrid,
    ShieldAlert,
    Send,
    CloudCheck,
} from "lucide-react";
import { reportTypeLabelAr } from "@/lib/reportTypeAr";

const PdfViewer = dynamic(() => import("../investors/[id]/PdfViewer"), { ssr: false });

const FILTER_CHIPS: {
    key: ReportReviewFilter;
    label: string;
    icon: React.ReactNode;
}[] = [
    { key: "all", label: "الكل", icon: <LayoutGrid size={18} /> },
    { key: "unapproved", label: "غير معتمدة", icon: <ShieldAlert size={18} /> },
    { key: "pending-publish", label: "في انتظار النشر", icon: <Send size={18} /> },
    { key: "published", label: "منشورة", icon: <CloudCheck size={18} /> },
];

export default function ReviewPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [reports, setReports] = useState<ReviewPageReport[]>([]);
    const [counts, setCounts] = useState({
        all: 0,
        unapproved: 0,
        pendingPublish: 0,
        published: 0,
    });
    const [activeFilter, setActiveFilter] = useState<ReportReviewFilter>("all");

    const [isLoading, setIsLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<ReviewPageReport | null>(null);
    const [publishing, setPublishing] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const filterRaw = searchParams.get("filter");
    const refresh = useCallback(
        async (opts?: { silent?: boolean }) => {
            if (!opts?.silent) setIsLoading(true);
            const data = await getReportsReviewPageData(filterRaw);
            setActiveFilter(data.filter);
            setCounts(data.counts);
            setReports(data.reports);
            if (!opts?.silent) setIsLoading(false);
        },
        [filterRaw],
    );

    useEffect(() => {
        refresh();
    }, [refresh]);

    const setFilter = (key: ReportReviewFilter) => {
        const params = new URLSearchParams(searchParams.toString());
        if (key === "all") {
            params.delete("filter");
        } else {
            params.set("filter", key);
        }
        const q = params.toString();
        router.replace(q ? `${pathname}?${q}` : pathname);
    };

    const handleTogglePublish = async (reportId: number, publish: boolean) => {
        setPublishing(reportId);
        await toggleReportPublish(reportId, publish);
        await refresh({ silent: true });
        setSelectedReport((prev) => (prev?.id === reportId ? null : prev));
        setPublishing(null);
    };

    const handleDelete = async () => {
        if (confirmDelete === null) return;
        const reportToDelete = reports.find((r) => r.id === confirmDelete);
        if (!reportToDelete) return;

        await deleteReport(confirmDelete, reportToDelete.user.id);
        await refresh({ silent: true });
        if (selectedReport?.id === confirmDelete) setSelectedReport(null);
        setConfirmDelete(null);
    };

    const grouped = reports.reduce((acc, r) => {
        const key = r.user.name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(r);
        return acc;
    }, {} as Record<string, ReviewPageReport[]>);

    const emptyMessage = (() => {
        switch (activeFilter) {
            case "all":
                return { title: "لا توجد تقارير", hint: "لم يُضف أي تقرير بعد" };
            case "unapproved":
                return { title: "لا توجد تقارير غير معتمدة", hint: "كل التقارير معتمدة أو لا يوجد تقارير" };
            case "pending-publish":
                return {
                    title: "لا توجد تقارير في انتظار النشر",
                    hint: "لا توجد تقارير معتمدة وغير منشورة حالياً",
                };
            case "published":
                return { title: "لا توجد تقارير منشورة", hint: "لم يُنشر أي تقرير بعد" };
            default:
                return { title: "لا توجد نتائج", hint: "" };
        }
    })();

    if (isLoading) {
        return (
            <div className="space-y-8" dir="rtl">
                <div>
                    <h1 className="text-3xl font-bold text-secondary dark:text-white flex items-center gap-2">
                        <Star size={28} className="text-primary" />
                        مراجعة التقارير
                    </h1>
                </div>
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-white dark:bg-card-dark rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary dark:text-white flex items-center gap-2">
                        <Star size={28} className="text-primary" />
                        مراجعة التقارير
                    </h1>
                    <p className="text-gray-500 mt-1">
                        تصفية التقارير حسب الاعتماد والنشر — يتوافق العرض مع الاستعلام في الخادم
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl">
                    {FILTER_CHIPS.map(({ key, label, icon }) => {
                        const count =
                            key === "all"
                                ? counts.all
                                : key === "unapproved"
                                  ? counts.unapproved
                                  : key === "pending-publish"
                                    ? counts.pendingPublish
                                    : counts.published;
                        const isActive = activeFilter === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setFilter(key)}
                                className={`flex items-center justify-center gap-2 min-w-0 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    isActive
                                        ? "bg-white dark:bg-card-dark text-primary shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                            >
                                {icon}
                                <span>{label}</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs mr-0.5 ${
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {reports.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 bg-white dark:bg-card-dark rounded-2xl border border-dashed border-gray-200 dark:border-gray-700"
                >
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mb-4 text-green-500">
                        <CheckCircle size={36} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1">
                        {emptyMessage.title}
                    </h3>
                    {emptyMessage.hint ? (
                        <p className="text-sm text-gray-400">{emptyMessage.hint}</p>
                    ) : null}
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(grouped).map(([investorName, investorReports]) => (
                        <motion.div
                            key={investorName}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                        >
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <User size={18} className="text-primary" />
                                <span className="font-bold text-sm text-secondary dark:text-white">
                                    {investorName}
                                </span>
                                <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium mr-auto">
                                    {investorReports.length} تقرير
                                </span>
                            </div>

                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                {investorReports.map((report) => {
                                    const canPublish = report.isApproved && !report.isPublished;
                                    const canUnpublish = report.isPublished;
                                    return (
                                        <div
                                            key={report.id}
                                            onClick={() => setSelectedReport(report)}
                                            className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/30"
                                        >
                                            <div className="w-7 h-7 rounded-md bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                                                <FileText size={14} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-xs text-secondary dark:text-gray-200 truncate">
                                                    {report.fileName || reportTypeLabelAr(report.type)}
                                                </div>
                                                <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                                                    <span>{reportTypeLabelAr(report.type)}</span>
                                                    <span>
                                                        {new Date(report.createdAt).toLocaleDateString("ar-EG")}
                                                    </span>
                                                    <span
                                                        className={
                                                            report.isApproved
                                                                ? "text-emerald-600 dark:text-emerald-400"
                                                                : "text-amber-600 dark:text-amber-400"
                                                        }
                                                    >
                                                        {report.isApproved ? "معتمد" : "غير معتمد"}
                                                    </span>
                                                    <span
                                                        className={
                                                            report.isPublished
                                                                ? "text-blue-600 dark:text-blue-400"
                                                                : "text-gray-500"
                                                        }
                                                    >
                                                        {report.isPublished ? "منشور" : "غير منشور"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (canUnpublish) {
                                                            handleTogglePublish(report.id, false);
                                                        } else if (canPublish) {
                                                            handleTogglePublish(report.id, true);
                                                        }
                                                    }}
                                                    disabled={
                                                        publishing === report.id ||
                                                        (!canPublish && !canUnpublish)
                                                    }
                                                    className={`p-1 rounded-lg transition-colors disabled:opacity-40 ${
                                                        canUnpublish
                                                            ? "text-green-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                                            : canPublish
                                                              ? "text-gray-300 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10"
                                                              : "text-gray-300 cursor-not-allowed"
                                                    }`}
                                                    title={
                                                        canUnpublish
                                                            ? "إلغاء النشر"
                                                            : canPublish
                                                              ? "نشر التقرير"
                                                              : !report.isApproved
                                                                ? "اعتماد التقرير من صفحة المستثمر أولاً"
                                                                : ""
                                                    }
                                                >
                                                    {publishing === report.id ? (
                                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                                                    ) : canUnpublish ? (
                                                        <FileMinus size={16} />
                                                    ) : (
                                                        <CheckCircle size={16} />
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfirmDelete(report.id);
                                                    }}
                                                    className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {selectedReport && (
                    <motion.div
                        key="pdf-fullscreen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col bg-gray-100 dark:bg-gray-900"
                        dir="rtl"
                    >
                        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 shrink-0 shadow-sm">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                                    <FileText size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-secondary dark:text-white text-sm truncate">
                                        {selectedReport.fileName || reportTypeLabelAr(selectedReport.type)}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {selectedReport.user.name} — {reportTypeLabelAr(selectedReport.type)} —{" "}
                                        {new Date(selectedReport.createdAt).toLocaleDateString("ar-EG")}
                                        {" · "}
                                        {selectedReport.isApproved ? "معتمد" : "غير معتمد"}
                                        {" · "}
                                        {selectedReport.isPublished ? "منشور" : "غير منشور"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {selectedReport.isPublished ? (
                                    <button
                                        type="button"
                                        onClick={() => handleTogglePublish(selectedReport.id, false)}
                                        disabled={publishing === selectedReport.id}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        {publishing === selectedReport.id ? (
                                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <FileMinus size={14} />
                                        )}
                                        إلغاء النشر
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleTogglePublish(selectedReport.id, true)}
                                        disabled={
                                            publishing === selectedReport.id || !selectedReport.isApproved
                                        }
                                        className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
                                        title={
                                            !selectedReport.isApproved
                                                ? "يجب اعتماد التقرير من صفحة المستثمر أولاً"
                                                : undefined
                                        }
                                    >
                                        {publishing === selectedReport.id ? (
                                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Check size={14} />
                                        )}
                                        نشر التقرير
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(selectedReport.id)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <Trash2 size={14} />
                                    حذف
                                </button>
                                <div className="w-px h-7 bg-gray-200 dark:bg-gray-700 mx-1" />
                                <button
                                    type="button"
                                    onClick={() => setSelectedReport(null)}
                                    className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    title="رجوع"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1" style={{ minHeight: 0 }}>
                            <PdfViewer
                                url={selectedReport.linkUrl}
                                fileName={selectedReport.fileName || selectedReport.type}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmDelete !== null && (
                    <motion.div
                        key="confirm-delete"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    >
                        <div
                            role="presentation"
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setConfirmDelete(null)}
                            aria-hidden
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-card-dark shadow-xl border border-gray-200 dark:border-gray-700 p-6 text-center"
                            dir="rtl"
                        >
                            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                                <Trash size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-secondary dark:text-white mb-1">
                                حذف التقرير
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                هل أنت متأكد من حذف هذا التقرير نهائياً؟
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
                                >
                                    حذف
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
