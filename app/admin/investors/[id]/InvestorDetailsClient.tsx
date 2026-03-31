"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Phone, IdCard, Calendar, Plus, FolderOpen, FolderX, FileText, Settings, X, UploadCloud, CheckCircle2, Trash2, FileOutput, AlertCircle, Loader2, Briefcase, Save, Paperclip, ExternalLink, Download } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getInvestor,
  uploadReport,
  deleteReport,
  toggleReportPublish,
  updateReportApproval,
  getInvestmentSectors,
  setInvestorInvestmentSectors,
} from "../../actions";
import { REPORT_TYPE_OPTIONS, reportTypeLabelAr } from "@/lib/reportTypeAr";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });

export type InvestorPagePermissions = {
  canApprove: boolean;
  canUpload: boolean;
  canDeleteFile: boolean;
  canPublish: boolean;
};

export default function InvestorDetailsClient({
  investorId,
  permissions,
  canManageInvestors,
}: {
  investorId: number;
  permissions: InvestorPagePermissions;
  canManageInvestors: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null);
  const [openMenuReportId, setOpenMenuReportId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [investmentSectorsList, setInvestmentSectorsList] = useState<
    { id: number; key: string; nameAr: string | null }[]
  >([]);
  const [sectorSelection, setSectorSelection] = useState<number[]>([]);
  const [sectorsSaving, setSectorsSaving] = useState(false);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState<number | null>(null);

  const hasAnyReportAction = permissions.canApprove || permissions.canPublish || permissions.canDeleteFile;

  async function downloadAttachmentFile(url: string, attachmentId: number, suggestedName: string) {
    if (!url || downloadingAttachmentId !== null) return;
    const baseName = suggestedName?.trim() || "مرفق";
    const downloadName = /\.[a-z0-9]+$/i.test(baseName) ? baseName : `${baseName}.pdf`;
    setDownloadingAttachmentId(attachmentId);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("تم تحميل الملف");
    } catch {
      toast.error("تعذر التحميل، جاري فتح الرابط في تبويب جديد");
      window.open(url, "_blank");
    } finally {
      setDownloadingAttachmentId(null);
    }
  }

  useEffect(() => {
    getInvestmentSectors().then(setInvestmentSectorsList);
  }, []);

  useEffect(() => {
    if (investor?.investmentSectors) {
      setSectorSelection(
        (investor.investmentSectors as { sectorId: number }[]).map((x) => x.sectorId)
      );
    }
  }, [investor]);

  function toggleSector(sectorId: number) {
    setSectorSelection((prev) =>
      prev.includes(sectorId) ? prev.filter((id) => id !== sectorId) : [...prev, sectorId]
    );
  }

  async function saveSectors() {
    setSectorsSaving(true);
    try {
      const result = await setInvestorInvestmentSectors(investorId, sectorSelection);
      if ("success" in result && result.success) {
        const data = await getInvestor(investorId);
        setInvestor(data);
        toast.success("تم حفظ القطاعات بنجاح");
      } else {
        const msg =
          "error" in result && typeof result.error === "string"
            ? result.error
            : "فشل حفظ القطاعات";
        toast.error(msg);
      }
    } catch {
      toast.error("فشل حفظ القطاعات");
    } finally {
      setSectorsSaving(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuReportId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      const reportIdParam = searchParams.get('report');
      if (reportIdParam && data && data.reports) {
        const reportToSelect = data.reports.find((r: any) => r.id.toString() === reportIdParam);
        if (reportToSelect) {
          setSelectedReport(reportToSelect);
        }
      }
    }
    fetchInvestor();
  }, [investorId, searchParams]);

  const handleSelectReport = (report: any | null) => {
    setSelectedReport(report);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (report) {
      newSearchParams.set('report', report.id.toString());
    } else {
      newSearchParams.delete('report');
    }
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("userId", investorId.toString());
    formData.append("type", reportType);
    formData.append("file", file);

    const fileNameInput = (e.currentTarget.querySelector('input[name="fileName"]') as HTMLInputElement).value;
    if (fileNameInput) {
      formData.append("fileName", fileNameInput);
    }

    const result = await uploadReport(formData);
    if (result.success) {
      setFile(null);
      setUploadError("");
      const data = await getInvestor(investorId);
      setInvestor(data);
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
    const data = await getInvestor(investorId);
    setInvestor(data);
    if (selectedReport?.id === confirmDelete) {
      handleSelectReport(null);
    }
    setConfirmDelete(null);
  };

  const handleApprove = async (reportId: number, isApproved: boolean) => {
    setUpdatingReportId(reportId);
    const result = await updateReportApproval(reportId, isApproved, investorId);
    if (result && !("error" in result)) {
      const data = await getInvestor(investorId);
      setInvestor(data);
      if (selectedReport?.id === reportId && data) handleSelectReport(data.reports.find((r: any) => r.id === reportId) || selectedReport);
    }
    setUpdatingReportId(null);
  };

  const handlePublish = async (reportId: number, publish: boolean) => {
    setUpdatingReportId(reportId);
    const result = await toggleReportPublish(reportId, publish, investorId);
    if (result && !("error" in result)) {
      const data = await getInvestor(investorId);
      setInvestor(data);
      if (selectedReport?.id === reportId && data) handleSelectReport(data.reports.find((r: any) => r.id === reportId) || selectedReport);
    }
    setUpdatingReportId(null);
  };

  const regularReports = (investor?.reports ?? []).filter((r: any) => r.type !== "attachment");
  const attachments = (investor?.reports ?? []).filter((r: any) => r.type === "attachment");

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!investor) return <div className="p-8 text-center text-red-500">Investor not found</div>;

  return (
    <>
      <div className="space-y-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center">
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-secondary dark:text-white">{investor.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{investor.phoneNumber}</span>
                </span>
                {investor.nationalId && (
                  <span className="flex items-center gap-1">
                    <IdCard className="w-4 h-4" />
                    <span>{investor.nationalId}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(investor.createdAt).toLocaleDateString('ar-EG')}</span>
                </span>
              </div>
            </div>
          </div>
          {permissions.canUpload && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl flex items-center justify-center transition-colors shadow-sm gap-2"
              title="إضافة تقرير جديد"
            >
              <Plus className="w-5 h-5" />
              إضافة تقرير
            </button>
          )}
        </div>

        {(canManageInvestors || (investor.investmentSectors?.length ?? 0) > 0) && (
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-5 shadow-sm">
            <h3 className="text-sm font-bold text-secondary dark:text-white flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-primary" />
              قطاعات الاستثمار
            </h3>
            {canManageInvestors ? (
              <div className="space-y-4">
                {investmentSectorsList.length === 0 ? (
                  <p className="text-sm text-gray-500">لا توجد قطاعات معرّفة في النظام.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {investmentSectorsList.map((s) => (
                        <label
                          key={s.id}
                          className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                        >
                          <input
                            type="checkbox"
                            checked={sectorSelection.includes(s.id)}
                            onChange={() => toggleSector(s.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span>{s.nameAr || s.key}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => void saveSectors()}
                      disabled={sectorsSaving}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {sectorsSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      حفظ القطاعات
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(investor.investmentSectors as { sectorId: number; sector: { nameAr: string | null; key: string } }[])?.map(
                  (row) => (
                    <span
                      key={row.sectorId}
                      className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-sm"
                    >
                      {row.sector?.nameAr || row.sector?.key}
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[350px] shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                التقارير ({regularReports.length})
              </h2>
            </div>

            {regularReports.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-card-dark rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <FolderX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد تقارير لهذا المستثمر</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {regularReports.map((report: any) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSelectReport(report)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border cursor-pointer transition-all ${selectedReport?.id === report.id
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                      : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                      <FileOutput className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-secondary dark:text-gray-200 text-xs break-words whitespace-normal line-clamp-2">
                        {report.fileName || reportTypeLabelAr(report.type)}
                      </div>
                      <div className="text-[10px] text-gray-400 break-words whitespace-normal">
                        {reportTypeLabelAr(report.type)} · {new Date(report.createdAt).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                    {hasAnyReportAction && (
                      <div className="relative shrink-0" ref={openMenuReportId === report.id ? menuRef : undefined} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setOpenMenuReportId(openMenuReportId === report.id ? null : report.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="خيارات"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {openMenuReportId === report.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute right-0 top-full mt-1 min-w-[140px] py-1 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 shadow-lg z-50"
                            >
                              {permissions.canApprove && (
                                <button
                                  type="button"
                                  onClick={() => { handleApprove(report.id, !report.isApproved); setOpenMenuReportId(null); }}
                                  disabled={updatingReportId === report.id}
                                  className={`w-full px-3 py-2 text-right text-sm font-medium transition-colors disabled:opacity-50 ${report.isApproved ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                >
                                  {report.isApproved ? 'إلغاء الاعتماد' : 'اعتماد'}
                                </button>
                              )}
                              {permissions.canPublish && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => { handlePublish(report.id, true); setOpenMenuReportId(null); }}
                                    disabled={updatingReportId === report.id || report.isPublished || !report.isApproved}
                                    title={!report.isApproved ? 'يجب اعتماد التقرير أولاً قبل النشر' : ''}
                                    className="w-full px-3 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                  >
                                    نشر
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { handlePublish(report.id, false); setOpenMenuReportId(null); }}
                                    disabled={updatingReportId === report.id || !report.isPublished}
                                    className="w-full px-3 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                  >
                                    إلغاء النشر
                                  </button>
                                </>
                              )}
                              {permissions.canDeleteFile && (
                                <button
                                  type="button"
                                  onClick={() => { handleDelete(report.id); setOpenMenuReportId(null); }}
                                  className="w-full px-3 py-2 text-right text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                >
                                  حذف
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden sticky top-20 flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>
              {selectedReport ? (
                <div className="flex-1 min-h-0 flex flex-col pt-1">
                  <PdfViewer
                    url={selectedReport.linkUrl}
                    fileName={selectedReport.fileName || selectedReport.type}
                    reportType={reportTypeLabelAr(selectedReport.type)}
                    fitToView
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-5">
                    <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500 mb-1">اختر تقريراً لعرضه</h3>
                  <p className="text-sm text-gray-400 dark:text-gray-600">اضغط على أي تقرير من القائمة</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-primary" />
                المرفقات ({attachments.length})
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {attachments.map((att: any) => (
                  <div
                    key={att.id}
                    className="group flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md bg-gray-50 dark:bg-gray-800/50 transition-all"
                  >
                    <a
                      href={att.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 min-w-0 flex-1"
                      title="فتح في تبويب جديد"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Paperclip className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-secondary dark:text-gray-200 truncate" title={att.fileName || "مرفق"}>
                          {att.fileName || "مرفق"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(att.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <button
                      type="button"
                      onClick={() => void downloadAttachmentFile(att.linkUrl, att.id, att.fileName || "مرفق")}
                      disabled={downloadingAttachmentId !== null}
                      className="shrink-0 p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/15 transition-colors disabled:opacity-50"
                      title="تحميل الملف"
                    >
                      {downloadingAttachmentId === att.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {permissions.canUpload && (
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
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-secondary dark:text-white flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-primary" />
                    إضافة تقرير جديد
                  </h3>
                  <button
                    type="button"
                    onClick={() => !isUploading && setShowAddModal(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpload} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع التقرير</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {REPORT_TYPE_OPTIONS.filter(t => t.id !== "attachment").map(t => (
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
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${file ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                          {file ? <CheckCircle2 className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
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
                      <AlertCircle className="w-4 h-4 shrink-0" />
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
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري الرفع...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>رفع التقرير</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

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
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
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
    </>
  );
}
