"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getUnpublishedReports, toggleReportPublish, deleteReport } from "../actions";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("../investors/[id]/PdfViewer"), { ssr: false });

type Report = {
    id: number;
    type: string;
    fileName: string | null;
    linkUrl: string;
    isPublished: boolean;
    createdAt: Date;
    user: { id: number; name: string };
};

export default function ReviewPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [publishing, setPublishing] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const reportTypes: Record<string, string> = {
        lease: "عقد استثمار تأجير",
        hotel: "عقد استثمار فنادق",
        real_estate: "عقد استثمار عقاري",
        installment: "عقد استثمار تقسيط",
        contract: "العقود العامة",
    };

    const fetchReports = async () => {
        setIsLoading(true);
        const data = await getUnpublishedReports();
        setReports(data as Report[]);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handlePublish = async (reportId: number) => {
        setPublishing(reportId);
        await toggleReportPublish(reportId, true);
        // Remove from list
        setReports(prev => prev.filter(r => r.id !== reportId));
        if (selectedReport?.id === reportId) setSelectedReport(null);
        setPublishing(null);
    };

    const handleDelete = async () => {
        if (confirmDelete === null) return;
        await deleteReport(confirmDelete, reports.find(r => r.id === confirmDelete)?.user.id || 0);
        setReports(prev => prev.filter(r => r.id !== confirmDelete));
        if (selectedReport?.id === confirmDelete) setSelectedReport(null);
        setConfirmDelete(null);
    };

    // Group reports by investor
    const grouped = reports.reduce((acc, r) => {
        const key = r.user.name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(r);
        return acc;
    }, {} as Record<string, Report[]>);

    if (isLoading) {
        return (
            <div className="space-y-8" dir="rtl">
                <div>
                    <h1 className="text-3xl font-bold text-secondary dark:text-white flex items-center gap-2">
                        <span className="material-icons text-primary">rate_review</span>
                        مراجعة التقارير
                    </h1>
                </div>
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-white dark:bg-card-dark rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary dark:text-white flex items-center gap-2">
                        <span className="material-icons text-primary">rate_review</span>
                        مراجعة التقارير
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {reports.length} تقرير في انتظار المراجعة والنشر
                    </p>
                </div>
            </div>

            {reports.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 bg-white dark:bg-card-dark rounded-2xl border border-dashed border-gray-200 dark:border-gray-700"
                >
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mb-4">
                        <span className="material-icons text-4xl text-green-500">check_circle</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1">لا توجد تقارير للمراجعة</h3>
                    <p className="text-sm text-gray-400">كل التقارير تم مراجعتها ونشرها</p>
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
                            {/* Investor Header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <span className="material-icons text-primary text-lg">person</span>
                                <span className="font-bold text-sm text-secondary dark:text-white">{investorName}</span>
                                <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium mr-auto">
                                    {investorReports.length} تقرير
                                </span>
                            </div>

                            {/* Reports */}
                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                {investorReports.map(report => (
                                    <div
                                        key={report.id}
                                        onClick={() => setSelectedReport(report)}
                                        className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/30"
                                    >
                                        <div className="w-7 h-7 rounded-md bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                                            <span className="material-icons text-sm">picture_as_pdf</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-xs text-secondary dark:text-gray-200 truncate">
                                                {report.fileName || reportTypes[report.type] || report.type}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {reportTypes[report.type] || report.type} · {new Date(report.createdAt).toLocaleDateString('ar-EG')}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePublish(report.id); }}
                                                disabled={publishing === report.id}
                                                className="p-1 text-gray-300 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                title="نشر"
                                            >
                                                {publishing === report.id ? (
                                                    <span className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin block" />
                                                ) : (
                                                    <span className="material-icons text-base">check_circle_outline</span>
                                                )}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setConfirmDelete(report.id); }}
                                                className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="حذف"
                                            >
                                                <span className="material-icons text-base">delete_outline</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Fullscreen PDF Viewer Overlay */}
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
                        {/* Top bar */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 shrink-0 shadow-sm">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                                    <span className="material-icons">picture_as_pdf</span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-secondary dark:text-white text-sm truncate">
                                        {selectedReport.fileName || reportTypes[selectedReport.type] || selectedReport.type}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {selectedReport.user.name} — {reportTypes[selectedReport.type]} — {new Date(selectedReport.createdAt).toLocaleDateString('ar-EG')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => handlePublish(selectedReport.id)}
                                    disabled={publishing === selectedReport.id}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {publishing === selectedReport.id ? (
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <span className="material-icons text-sm">check</span>
                                    )}
                                    نشر التقرير
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(selectedReport.id)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <span className="material-icons text-sm">delete</span>
                                    حذف
                                </button>
                                <div className="w-px h-7 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    title="رجوع"
                                >
                                    <span className="material-icons">close</span>
                                </button>
                            </div>
                        </div>

                        {/* PDF takes all remaining space */}
                        <div className="flex-1" style={{ minHeight: 0 }}>
                            <PdfViewer
                                url={selectedReport.linkUrl}
                                fileName={selectedReport.fileName || selectedReport.type}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Delete Modal */}
            <AnimatePresence>
                {confirmDelete !== null && (
                    <motion.div
                        key="confirm-delete"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} aria-hidden />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-card-dark shadow-xl border border-gray-200 dark:border-gray-700 p-6 text-center"
                            dir="rtl"
                        >
                            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons text-3xl">delete_outline</span>
                            </div>
                            <h3 className="text-lg font-bold text-secondary dark:text-white mb-1">حذف التقرير</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">هل أنت متأكد من حذف هذا التقرير نهائياً؟</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
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
