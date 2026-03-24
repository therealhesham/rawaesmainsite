/** مفاتيح النوع كما تُخزَّن في حقل `reports.type` */

export const REPORT_TYPE_OPTIONS: { id: string; label: string }[] = [
    { id: "lease", label: "تأجير سيارات" },
    { id: "contract", label: "العقود العامة" },
    { id: "hotel", label: "عقد استثمار فنادق" },
    { id: "real_estate", label: "عقد استثمار عقاري" },
    { id: "installment", label: "عقد استثمار تقسيط" },
];

export const REPORT_TYPE_LABELS_AR: Record<string, string> = Object.fromEntries(
    REPORT_TYPE_OPTIONS.map((o) => [o.id, o.label])
);

export function reportTypeLabelAr(type: string | null | undefined): string {
    if (type == null || type === "") return "—";
    const t = type.trim();
    return REPORT_TYPE_LABELS_AR[t] ?? REPORT_TYPE_LABELS_AR[t.toLowerCase()] ?? type;
}
