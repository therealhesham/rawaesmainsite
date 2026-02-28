"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, FileText, Loader2, Sidebar, ChevronRight, ChevronLeft, ZoomOut, ZoomIn, Printer, Download, Maximize, Minimize } from "lucide-react";

const PDF_PAGE_HEIGHT = 842;
const PDF_PAGE_WIDTH = 595;

interface PdfViewerProps {
    url: string;
    fileName?: string;
    reportType?: string;
    fitToView?: boolean;
}

export default function PdfViewer({ url, fileName, reportType, fitToView = false }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1);
    const [fitScale, setFitScale] = useState(1);
    const [pdfLib, setPdfLib] = useState<any>(null);
    const [error, setError] = useState<string>("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showThumbnails, setShowThumbnails] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);
    const pageInputRef = useRef<HTMLInputElement>(null);

    // Load react-pdf library
    useEffect(() => {
        if (typeof Promise.withResolvers === "undefined") {
            (Promise as any).withResolvers = function () {
                let resolve: any, reject: any;
                const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
                return { promise, resolve, reject };
            };
        }
        let isMounted = true;
        import("react-pdf").then((pdf) => {
            if (!isMounted) return;
            pdf.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdf.pdfjs.version}/build/pdf.worker.min.mjs`;
            setPdfLib(pdf);
        }).catch(err => {
            console.error("Failed to load react-pdf", err);
            if (isMounted) setError(err.message);
        });
        return () => { isMounted = false; };
    }, []);

    // Reset state when URL changes
    useEffect(() => {
        setCurrentPage(1);
        setNumPages(0);
    }, [url]);

    // Always fit PDF to container width
    useEffect(() => {
        if (!scrollRef.current) return;
        const el = scrollRef.current;
        const updateFit = () => {
            const w = el.clientWidth;
            if (w > 0) {
                const s = Math.max(0.3, Math.min(w / PDF_PAGE_WIDTH, 2.5));
                setFitScale(s);
                setScale(s);
            }
        };
        updateFit();
        const ro = new ResizeObserver(updateFit);
        ro.observe(el);
        return () => ro.disconnect();
    }, [url]);

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        pageRefs.current = new Array(numPages).fill(null);
        thumbnailRefs.current = new Array(numPages).fill(null);
    }, []);

    // Zoom controls
    const zoomIn = () => setScale((s) => Math.min(s + 0.2, 4));
    const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.3));
    const resetZoom = () => setScale(fitScale);

    // Page navigation
    const goToPage = (page: number) => {
        const clamped = Math.max(1, Math.min(page, numPages));
        setCurrentPage(clamped);
        pageRefs.current[clamped - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
        thumbnailRefs.current[clamped - 1]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    const prevPage = () => goToPage(currentPage - 1);
    const nextPage = () => goToPage(currentPage + 1);

    const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const val = parseInt((e.target as HTMLInputElement).value);
            if (!isNaN(val)) goToPage(val);
        }
    };

    // Intersection observer: track which page is currently visible
    useEffect(() => {
        if (numPages === 0 || !scrollRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = pageRefs.current.indexOf(entry.target as HTMLDivElement);
                        if (idx !== -1) setCurrentPage(idx + 1);
                    }
                }
            },
            { root: scrollRef.current, threshold: 0.5 }
        );
        pageRefs.current.forEach((el) => { if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, [numPages, scale]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            switch (e.key) {
                case "ArrowLeft": nextPage(); break;
                case "ArrowRight": prevPage(); break;
                case "+": case "=": zoomIn(); break;
                case "-": zoomOut(); break;
                case "Escape": if (isFullscreen) setIsFullscreen(false); break;
                case "f": case "F": if (e.ctrlKey || e.metaKey) { e.preventDefault(); } else setIsFullscreen(prev => !prev); break;
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [currentPage, numPages, isFullscreen]);

    // Print the PDF
    const handlePrint = () => {
        const printWindow = window.open(url, "_blank");
        if (printWindow) {
            printWindow.addEventListener("load", () => {
                printWindow.print();
            });
        }
    };

    // Force Download
    const handleDownload = async () => {
        if (!url || isDownloading) return;
        try {
            setIsDownloading(true);
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'report.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Failed to download file:", err);
            // Fallback to opening in new tab if fetch fails (e.g., severe CORS issues)
            window.open(url, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    // Keep thumbnail active page in view
    useEffect(() => {
        if (showThumbnails && thumbnailRefs.current[currentPage - 1]) {
            thumbnailRefs.current[currentPage - 1]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [currentPage, showThumbnails]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-sm text-red-500 text-center">فشل تحميل مكتبة العرض: {error}</p>
            </div>
        );
    }

    if (!pdfLib) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 h-full">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <span className="text-sm text-gray-500 dark:text-gray-400">جاري تحميل قارئ الـ PDF...</span>
            </div>
        );
    }

    const { Document, Page } = pdfLib;

    const viewerContent = (
        <div className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-[100] bg-gray-900" : "h-full"}`}>
            {/* ─── Premium Toolbar ─── */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60 shrink-0 gap-2" dir="rtl">
                {/* Right group: File info + Thumbnails toggle */}
                <div className="flex items-center gap-2 min-w-0">
                    {/* Thumbnail toggle */}
                    <button
                        onClick={() => setShowThumbnails(!showThumbnails)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${showThumbnails
                            ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        title="الصفحات المصغّرة"
                    >
                        <Sidebar className="w-5 h-5" />
                    </button>

                    {/* File info */}
                    {fileName && (
                        <div className="hidden sm:flex items-center gap-2 min-w-0">
                            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-secondary dark:text-gray-200 truncate max-w-[180px]">{fileName}</p>
                                {reportType && <p className="text-[10px] text-gray-400 truncate">{reportType}</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Center group: Page navigation */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={prevPage}
                        disabled={currentPage <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="الصفحة السابقة"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1 px-1">
                        <input
                            ref={pageInputRef}
                            type="text"
                            value={currentPage}
                            onChange={(e) => {
                                const v = parseInt(e.target.value);
                                if (!isNaN(v)) setCurrentPage(Math.max(1, Math.min(v, numPages)));
                            }}
                            onKeyDown={handlePageInput}
                            onBlur={(e) => goToPage(parseInt(e.target.value) || currentPage)}
                            className="w-8 h-7 text-center text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-secondary dark:text-gray-200"
                        />
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">/ {numPages || "—"}</span>
                    </div>

                    <button
                        onClick={nextPage}
                        disabled={currentPage >= numPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="الصفحة التالية"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>

                {/* Left group: Zoom + Actions */}
                <div className="flex items-center gap-1">
                    {/* Zoom controls */}
                    <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="تصغير">
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <button
                        onClick={resetZoom}
                        className="px-2 h-7 flex items-center justify-center rounded-md text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-w-[44px] tabular-nums"
                        title="إعادة ضبط"
                    >
                        {Math.round(scale * 100)}%
                    </button>
                    <button onClick={zoomIn} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="تكبير">
                        <ZoomIn className="w-5 h-5" />
                    </button>

                    {/* Separator */}
                    <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />

                    {/* Print */}
                    <button onClick={handlePrint} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="طباعة">
                        <Printer className="w-5 h-5" />
                    </button>

                    {/* Download */}
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                        title={isDownloading ? "جاري التحميل..." : "تحميل"}
                    >
                        {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    </button>

                    {/* Fullscreen toggle */}
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${isFullscreen
                            ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        title={isFullscreen ? "إغلاق ملء الشاشة" : "ملء الشاشة"}
                    >
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* ─── Body: Thumbnails + Document ─── */}
            <div className="flex-1 flex min-h-0" dir="rtl">
                {/* Thumbnail sidebar */}
                <AnimatePresence>
                    {showThumbnails && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 140, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="shrink-0 bg-gray-50 dark:bg-gray-900/80 overflow-hidden"
                        >
                            <div className="w-[140px] h-full overflow-y-auto py-3 px-2 space-y-2 scrollbar-thin">
                                {numPages > 0 && (
                                    <Document file={url} loading={null} error={null}>
                                        {Array.from({ length: numPages }, (_, i) => (
                                            <div
                                                key={`thumb_${i}`}
                                                ref={(el: HTMLDivElement | null) => { thumbnailRefs.current[i] = el; }}
                                                onClick={() => goToPage(i + 1)}
                                                className={`group cursor-pointer rounded-lg p-1.5 transition-all duration-200 ${currentPage === i + 1
                                                    ? "bg-primary/10 ring-2 ring-primary/50"
                                                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    }`}
                                            >
                                                <div className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden">
                                                    <Page
                                                        pageNumber={i + 1}
                                                        width={110}
                                                        renderTextLayer={false}
                                                        renderAnnotationLayer={false}
                                                    />
                                                </div>
                                                <p className={`text-[10px] text-center mt-1 font-medium ${currentPage === i + 1
                                                    ? "text-primary"
                                                    : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                                    }`}>
                                                    {i + 1}
                                                </p>
                                            </div>
                                        ))}
                                    </Document>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main document area */}
                <div ref={scrollRef} className="flex-1 overflow-auto bg-white dark:bg-gray-900" style={{ minHeight: 0 }}>
                    <div className="flex flex-col items-center w-full">
                        <Document
                            file={url}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                    <span className="text-sm text-gray-400">جاري تحميل الملف...</span>
                                </div>
                            }
                            error={
                                <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-400">
                                    <AlertCircle className="w-10 h-10" />
                                    <span className="text-sm">فشل تحميل الملف</span>
                                </div>
                            }
                        >
                            {Array.from({ length: numPages }, (_, index) => (
                                <div
                                    key={`page_${index}`}
                                    ref={(el: HTMLDivElement | null) => { pageRefs.current[index] = el; }}
                                    className="bg-white overflow-hidden shadow-sm mb-3 last:mb-0"
                                >
                                    <Page
                                        pageNumber={index + 1}
                                        scale={scale}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />
                                </div>
                            ))}
                        </Document>
                    </div>
                </div>
            </div>

            {/* ─── Bottom status bar ─── */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-gray-100/80 dark:bg-gray-900/90 border-t border-gray-200/60 dark:border-gray-700/60 text-[11px] text-gray-400 dark:text-gray-500 shrink-0" dir="rtl">
                <span>{numPages > 0 ? `${numPages} صفحة` : "—"}</span>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:inline opacity-60">← → للتنقل · +/- للتكبير · F ملء الشاشة</span>
                </div>
            </div>
        </div>
    );

    // When fullscreen, wrap in overlay
    if (isFullscreen) {
        return (
            <>
                {/* Non-fullscreen placeholder so layout doesn't collapse */}
                <div className="flex flex-col h-full items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-2xl">
                    <Maximize className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2 opacity-50" />
                    <p className="text-sm text-gray-500 mt-2">المستند معروض في وضع ملء الشاشة</p>
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="mt-4 px-5 py-2.5 text-sm bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors font-semibold"
                    >
                        إغلاق ملء الشاشة
                    </button>
                </div>
                {/* Fullscreen overlay */}
                <AnimatePresence>
                    <motion.div
                        key="fullscreen-overlay"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                    >
                        {viewerContent}
                    </motion.div>
                </AnimatePresence>
            </>
        );
    }

    return viewerContent;
}
