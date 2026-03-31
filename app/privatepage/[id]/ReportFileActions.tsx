"use client";

import { useState } from "react";

type Props = {
  linkUrl: string;
  suggestedName: string;
  viewLabel?: string;
  downloadLabel?: string;
  viewClassName: string;
  downloadClassName: string;
};

export default function ReportFileActions({
  linkUrl,
  suggestedName,
  viewLabel = "عرض",
  downloadLabel = "تحميل",
  viewClassName,
  downloadClassName,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (!linkUrl || loading) return;
    const baseName = suggestedName?.trim() || "ملف";
    const downloadName = /\.[a-z0-9]+$/i.test(baseName) ? baseName : `${baseName}.pdf`;
    setLoading(true);
    try {
      const response = await fetch(linkUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(linkUrl, "_blank");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className={viewClassName}>
        {viewLabel}
      </a>
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={loading}
        className={downloadClassName}
      >
        {loading ? (
          <span className="inline-flex items-center gap-1.5">
            <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            جاري التحميل
          </span>
        ) : (
          downloadLabel
        )}
      </button>
    </div>
  );
}
