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

/** Safari على iPhone/iPad لا يدعم تنزيل blob عبر <a download> كما على الديسكتوب، ويفقد النقر «user gesture» بعد await فيُحظر فتح نافذة جديدة */
function isAppleMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iP(ad|hone|od)/.test(navigator.userAgent);
}

export default function ReportFileActions({
  linkUrl,
  suggestedName,
  viewLabel = "عرض",
  downloadLabel = "تحميل",
  viewClassName,
  downloadClassName,
}: Props) {
  const [loading, setLoading] = useState(false);

  function handleDownload() {
    if (!linkUrl || loading) return;
    const baseName = suggestedName?.trim() || "ملف";
    const downloadName = /\.[a-z0-9]+$/i.test(baseName) ? baseName : `${baseName}.pdf`;
    const appleMobile = isAppleMobile();

    /** يجب أن يكون في نفس لحظة النقر حتى لا يحظر Safari النافذة بعد await */
    const popup = appleMobile ? window.open("about:blank", "_blank", "noopener,noreferrer") : null;

    setLoading(true);

    void (async () => {
      try {
        const response = await fetch(linkUrl);
        if (!response.ok) throw new Error("fetch failed");
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        if (appleMobile) {
          if (popup && !popup.closed) {
            popup.location.href = blobUrl;
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 120_000);
          } else {
            const a = document.createElement("a");
            a.href = blobUrl;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 120_000);
          }
        } else {
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = downloadName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }
      } catch {
        if (popup && !popup.closed) {
          try {
            popup.location.href = linkUrl;
          } catch {
            popup.close();
            window.open(linkUrl, "_blank", "noopener,noreferrer");
          }
        } else {
          window.open(linkUrl, "_blank", "noopener,noreferrer");
        }
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className={viewClassName}>
        {viewLabel}
      </a>
      <button
        type="button"
        onClick={handleDownload}
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
