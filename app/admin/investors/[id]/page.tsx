"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getInvestor, uploadReport, deleteReport } from "../../actions";

export default function InvestorDetails() {
    const params = useParams();
    const investorId = parseInt(params.id as string);
    const [investor, setInvestor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reportType, setReportType] = useState('lease');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

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
            // Reset file input (optional, via ref or key)
            // Refresh data
            const data = await getInvestor(investorId);
            setInvestor(data);
        } else {
            alert('Failed to upload report');
        }
        setIsUploading(false);
    };

    const handleDelete = async (reportId: number) => {
        if (!confirm('Are you sure you want to delete this report?')) return;
        await deleteReport(reportId, investorId);
        // Refresh data
        const data = await getInvestor(investorId);
        setInvestor(data);
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
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-secondary dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-icons text-primary">upload_file</span>
                            إضافة تقرير جديد
                        </h2>
                        <form onSubmit={handleUpload} className="space-y-4">
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
                    </div>
                </div>

                {/* Reports List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2">
                        <span className="material-icons text-primary">folder_open</span>
                        التقارير ({investor.reports.length})
                    </h2>

                    {investor.reports.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-card-dark rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <span className="material-icons text-4xl text-gray-300 mb-2">folder_off</span>
                            <p className="text-gray-500">لا توجد تقارير لهذا المستثمر</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {investor.reports.map((report: any) => (
                                <motion.div
                                    key={report.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
                                            <span className="material-icons">picture_as_pdf</span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-secondary dark:text-gray-200">
                                                {report.fileName || reportTypes.find(t => t.id === report.type)?.label || report.type}
                                            </div>
                                            <div className="text-sm text-gray-400 mt-0.5 flex items-center gap-2">
                                                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded textxs">
                                                    {reportTypes.find(t => t.id === report.type)?.label || report.type}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className="material-icons text-xs">schedule</span>
                                                {new Date(report.createdAt).toLocaleDateString('ar-EG')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={report.linkUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                            title="عرض الملف"
                                        >
                                            <span className="material-icons">visibility</span>
                                        </a>
                                        <button
                                            onClick={() => handleDelete(report.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="حذف"
                                        >
                                            <span className="material-icons">delete_outline</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
