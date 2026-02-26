"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getInvestor, uploadReport, deleteReport } from "../../actions";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });

export default function InvestorDetails() {
    const params = useParams();
    const investorId = parseInt(params.id as string);
    const [investor, setInvestor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reportType, setReportType] = useState('lease');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState<string>("");

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
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
        }
    };

    useEffect(() => {
        async function fetchInvestor() {
            const data = await getInvestor(investorId);
            setInvestor(data);
            setIsLoading(false);
        }
        fetchInvestor();
    }, [investorId]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("userId", investorId.toString());
        formData.append("type", reportType);
        formData.append("file", file);

        // Get file name from input
        const fileNameInput = (e.currentTarget.querySelector('input[name="fileName"]') as HTMLInputElement).value;
        if (fileNameInput) {
            formData.append("fileName", fileNameInput);
        }

        const result = await uploadReport(formData);
        if (result.success) {
            setFile(null);
            setUploadError("");
            // Refresh data
            const data = await getInvestor(investorId);
            setInvestor(data);
            // Close modal on success
            setShowAddModal(false);
        } else {
            setUploadError('فشل رفع التقرير، حاول مرة أخرى.');
        }
        setIsUploading(false);
    };

    const handleDelete = async (reportId: number) => {
        setConfirmDelete(reportId);
    };

    const confirmDeleteReport = async () => {
        if (confirmDelete === null) return;
        await deleteReport(confirmDelete, investorId);
        // Refresh data
        const data = await getInvestor(investorId);
        setInvestor(data);
        // Clear preview if the deleted report was selected
        if (selectedReport?.id === confirmDelete) {
            setSelectedReport(null);
        }
        setConfirmDelete(null);
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!investor) return <div className="p-8 text-center text-red-500">Investor not found</div>;

    const reportTypes = [
        { id: 'lease', label: 'عقد استثمار تأجير' },
        { id: 'hotel', label: 'عقد استثمار فنادق' },
        { id: 'real_estate', label: 'عقد استثمار عقاري' },
        { id: 'installment', label: 'عقد استثمار تقسيط' },
        { id: 'contract', label: 'العقود العامة' },
    ];

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <span className="material-icons">arrow_forward</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-secondary dark:text-white">{investor.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                                <span className="material-icons text-sm">phone</span>
                                <span dir="ltr">{investor.phoneNumber}</span>
                            </span>
                            {investor.nationalId && (
                                <span className="flex items-center gap-1">
                                    <span className="material-icons text-sm">badge</span>
                                    <span>{investor.nationalId}</span>
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <span className="material-icons text-sm">calendar_today</span>
                                <span>{new Date(investor.createdAt).toLocaleDateString('ar-EG')}</span>
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl flex items-center justify-center transition-colors shadow-sm gap-2"
                    title="إضافة تقرير جديد"
                >
                    <span className="material-icons text-xl">add</span>
                    إضافة تقرير
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Reports List - Right Column in RTL */}
                <div className="w-full lg:w-1/3  ">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
                            <span className="material-icons text-primary">folder_open</span>
                            التقارير ({investor.reports.length})
                        </h2>
                    </div>

                    {investor.reports.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-card-dark rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <span className="material-icons text-4xl text-gray-300 mb-2">folder_off</span>
                            <p className="text-gray-500">لا توجد تقارير لهذا المستثمر</p>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {investor.reports.map((report: any) => (
                                <motion.div
                                    key={report.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setSelectedReport(report)}
                                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border cursor-pointer transition-all ${selectedReport?.id === report.id
                                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }`}
                                >
                                    <div className="w-7 h-7 rounded-md bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                                        <span className="material-icons text-sm">picture_as_pdf</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-secondary dark:text-gray-200 text-xs truncate">
                                            {report.fileName || reportTypes.find((t: any) => t.id === report.type)?.label || report.type}
                                        </div>
                                        <div className="text-[10px] text-gray-400 truncate">
                                            {reportTypes.find((t: any) => t.id === report.type)?.label} · {new Date(report.createdAt).toLocaleDateString('ar-EG')}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }}
                                        className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                                        title="حذف"
                                    >
                                        <span className="material-icons text-base">delete_outline</span>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* PDF Preview - Left Column in RTL */}
                <div className="w-full lg:flex-1 min-w-0">
                    <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden sticky top-24" style={{ height: 'calc(100vh - 180px)' }}>
                        {selectedReport ? (
                            <div className="flex flex-col h-full">
                                {/* Preview Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                                            <span className="material-icons">picture_as_pdf</span>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-secondary dark:text-white text-sm truncate">
                                                {selectedReport.fileName || reportTypes.find((t: any) => t.id === selectedReport.type)?.label || selectedReport.type}
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                {reportTypes.find((t: any) => t.id === selectedReport.type)?.label} — {new Date(selectedReport.createdAt).toLocaleDateString('ar-EG')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">

                                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                                        <button
                                            onClick={() => setSelectedReport(null)}
                                            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            title="إغلاق التقرير"
                                        >
                                            <span className="material-icons">close</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Custom PDF Viewer */}
                                <div className="flex-1" style={{ minHeight: 0 }}>
                                    <PdfViewer
                                        url={selectedReport.linkUrl}
                                        fileName={selectedReport.fileName || selectedReport.type}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-12 h-full">
                                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                    <span className="material-icons text-4xl text-gray-300 dark:text-gray-600">description</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500 mb-1">اختر تقريراً لعرضه</h3>
                                <p className="text-sm text-gray-400 dark:text-gray-600">اضغط على أي تقرير من القائمة لعرضه هنا</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Report Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        key="add-report-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => !isUploading && setShowAddModal(false)}
                            aria-hidden
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-card-dark shadow-xl border border-gray-200 dark:border-gray-700"
                            dir="rtl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
                                    <span className="material-icons text-primary">upload_file</span>
                                    إضافة تقرير جديد
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => !isUploading && setShowAddModal(false)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleUpload} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع التقرير</label>
                                    <select
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        {reportTypes.map(t => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الملف (اختياري)</label>
                                    <input
                                        type="text"
                                        name="fileName"
                                        placeholder="أدخل اسم الملف أو سيتم استخدام الاسم الأصلي"
                                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملف التقرير (PDF)</label>
                                    <div
                                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
                                            ? 'border-primary bg-primary/5 scale-[1.02]'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center gap-3 pointer-events-none">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${file ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                                                }`}>
                                                <span className="material-icons text-2xl">
                                                    {file ? 'check' : 'cloud_upload'}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {file ? file.name : 'اضغط أو اسحب الملف هنا'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF فقط، بحد أقصى 10MB'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {uploadError && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm">
                                        <span className="material-icons text-base">error_outline</span>
                                        {uploadError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isUploading || !file}
                                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>جاري الرفع...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons text-sm">cloud_upload</span>
                                            <span>رفع التقرير</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Delete Modal */}
            <AnimatePresence>
                {confirmDelete !== null && (
                    <motion.div
                        key="confirm-delete-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    >
                        <div
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
                                <span className="material-icons text-3xl">delete_outline</span>
                            </div>
                            <h3 className="text-lg font-bold text-secondary dark:text-white mb-1">حذف التقرير</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">هل أنت متأكد من حذف هذا التقرير؟ لا يمكن التراجع عن هذا الإجراء.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={confirmDeleteReport}
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
