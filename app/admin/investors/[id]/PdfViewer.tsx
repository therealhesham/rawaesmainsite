"use client";

import { useState, useCallback, useEffect } from "react";

export default function PdfViewer({ url, fileName }: { url: string; fileName?: string }) {
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState(1.2);
    const [pdfLib, setPdfLib] = useState<any>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        // Next.js (Node < 22) polyfill for Promise.withResolvers used by pdfjs-dist
        if (typeof Promise.withResolvers === "undefined") {
            (Promise as any).withResolvers = function () {
                let resolve, reject;
                const promise = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                });
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

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    }, []);

    const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
    const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.4));
    const resetZoom = () => setScale(1.2);

    if (error) {
        return <div className="p-8 text-center text-red-500">فشل تحميل مكتبة العرض: {error}</div>;
    }

    if (!pdfLib) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 h-full">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">جاري تحميل قارئ الـ PDF...</span>
            </div>
        );
    }

    const { Document, Page } = pdfLib;

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {numPages > 0 ? `${numPages} صفحة` : "جاري التحميل..."}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="تصغير">
                        <span className="material-icons text-lg">remove</span>
                    </button>
                    <button onClick={resetZoom} className="px-2 h-8 flex items-center justify-center rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-w-[48px]" title="إعادة ضبط">
                        {Math.round(scale * 100)}%
                    </button>
                    <button onClick={zoomIn} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="تكبير">
                        <span className="material-icons text-lg">add</span>
                    </button>
                    <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <a href={url} download={fileName} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="تحميل">
                        <span className="material-icons text-lg">download</span>
                    </a>
                </div>
            </div>

            {/* PDF Pages */}
            <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900" style={{ minHeight: 0 }}>
                <div className="flex flex-col items-center py-4 gap-4">
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <span className="text-sm text-gray-500">جاري تحميل الملف...</span>
                            </div>
                        }
                        error={
                            <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
                                <span className="material-icons text-4xl">error_outline</span>
                                <span className="text-sm">فشل تحميل الملف</span>
                            </div>
                        }
                    >
                        {Array.from(new Array(numPages), (_, index) => (
                            <div key={`page_container_${index}`} className="mb-4 shadow-lg">
                                <Page
                                    pageNumber={index + 1}
                                    scale={scale}
                                    className="rounded-sm overflow-hidden"
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </div>
                        ))}
                    </Document>
                </div>
            </div>
        </div>
    );
}
