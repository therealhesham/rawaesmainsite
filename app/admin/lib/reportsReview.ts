/** أنواع وفلاتر مراجعة التقارير — خارج ملف server actions لأن "use server" لا يسمح بتصدير كائنات */

export const REPORT_REVIEW_FILTERS = ["all", "unapproved", "pending-publish", "published"] as const;
export type ReportReviewFilter = (typeof REPORT_REVIEW_FILTERS)[number];

export type ReviewPageReport = {
    id: number;
    type: string;
    fileName: string | null;
    linkUrl: string;
    isPublished: boolean;
    isApproved: boolean;
    createdAt: Date;
    user: { id: number; name: string };
};

export type ReportsReviewPageData = {
    filter: ReportReviewFilter;
    counts: {
        all: number;
        unapproved: number;
        pendingPublish: number;
        published: number;
    };
    reports: ReviewPageReport[];
};

export function normalizeReportReviewFilter(raw: string | null): ReportReviewFilter {
    if (raw === "unapproved" || raw === "pending-publish" || raw === "published" || raw === "all") {
        return raw;
    }
    return "all";
}

export function reportReviewPrismaWhere(filter: ReportReviewFilter): Record<string, unknown> | undefined {
    switch (filter) {
        case "all":
            return undefined;
        case "unapproved":
            return { isApproved: false };
        case "pending-publish":
            return { isApproved: true, isPublished: false };
        case "published":
            return { isPublished: true };
        default:
            return undefined;
    }
}
