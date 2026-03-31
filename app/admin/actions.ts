"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requirePageView, requirePageEdit, requirePageEditAny, getAdminUser, canEditPage, canViewPage } from "./lib/auth";
import {
    normalizeReportReviewFilter,
    reportReviewPrismaWhere,
    type ReportsReviewPageData,
    type ReviewPageReport,
} from "./lib/reportsReview";

const prisma = new PrismaClient();

export async function checkAdminPermission(pageKey: string, type: "view" | "edit") {
    const admin = await getAdminUser(false);
    if (!admin) return false;
    return type === "view" ? canViewPage(admin, pageKey) : canEditPage(admin, pageKey);
}

export async function getStats() {
    await requirePageView("");
    try {
        const [
            totalInvestors,
            totalReports,
            unapprovedReports,
            pendingPublishReports,
            publishedReports,
            recentReports,
        ] = await Promise.all([
            prisma.user.count({ where: { isAdmin: false } }),
            prisma.reports.count(),
            prisma.reports.count({ where: { isApproved: false } }),
            prisma.reports.count({ where: { isApproved: true, isPublished: false } }),
            prisma.reports.count({ where: { isPublished: true } }),
            prisma.reports.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { user: true },
            }),
        ]);

        return {
            totalInvestors,
            totalReports,
            unapprovedReports,
            pendingPublishReports,
            publishedReports,
            recentReports,
        };
    } catch (error) {
        console.error("Failed to fetch stats:", error);
        return {
            totalInvestors: 0,
            totalReports: 0,
            unapprovedReports: 0,
            pendingPublishReports: 0,
            publishedReports: 0,
            recentReports: [],
        };
    }
}

export async function getInvestors(search?: string) {
    await requirePageView("");
    try {
        const where = search
            ? {
                  OR: [
                      { name: { contains: search } },
                      { phoneNumber: { contains: search } },
                      { password: { contains: search } },
                      { nationalId: { contains: search } },
                  ],
              }
            : {};

        const investors = await prisma.user.findMany({
            where,
            include: {
                _count: {
                    select: { reports: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return investors;
    } catch (error) {
        console.error("Failed to fetch investors:", error);
        return [];
    }
}

/** صفحة واحدة من المستثمرين — للتمرير اللانهائي في لوحة الإدارة */
export async function getInvestorsPaged(
    search: string | undefined,
    skip: number,
    take: number
): Promise<{
    investors: Awaited<ReturnType<typeof getInvestors>>;
    total: number;
    hasMore: boolean;
}> {
    await requirePageView("");
    try {
        const where = search
            ? {
                  OR: [
                      { name: { contains: search } },
                      { phoneNumber: { contains: search } },
                      { password: { contains: search } },
                      { nationalId: { contains: search } },
                  ],
              }
            : {};

        const [investors, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: Math.max(0, skip),
                take: Math.min(100, Math.max(1, take)),
                include: {
                    _count: {
                        select: { reports: true },
                    },
                    investmentSectors: {
                        include: { sector: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.count({ where }),
        ]);

        const safeSkip = Math.max(0, skip);
        const hasMore = safeSkip + investors.length < total;
        return { investors, total, hasMore };
    } catch (error) {
        console.error("Failed to fetch investors page:", error);
        return { investors: [], total: 0, hasMore: false };
    }
}

export async function getInvestorReportsForAdmin(userId: number) {
    await requirePageView("");
    try {
        if (!userId || Number.isNaN(userId)) return [];
        const reports = await prisma.reports.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                type: true,
                fileName: true,
                releaseDate: true,
                linkUrl: true,
                isPublished: true,
                isApproved: true,
                createdAt: true,
            },
        });
        return reports;
    } catch (error) {
        console.error("getInvestorReportsForAdmin error:", error);
        return [];
    }
}

/** بحث عن مستثمر بالاسم — exact أولاً، ثم fuzzy بالكلمات.
 *  إذا وُجدت `restrictToUserIds` فتُقيَّد المطابقة والاقتراحات بهؤلاء فقط (مثلاً بعد تحديد نطاق من صفحة الاستخراج). */
export async function searchInvestorByName(
    excelName: string,
    restrictToUserIds?: number[] | null
) {
    await requirePageView("extract-reports");
    try {
        const trimmed = excelName.trim();
        if (!trimmed) return { exact: null, suggestions: [] };

        const restrict =
            restrictToUserIds &&
            Array.isArray(restrictToUserIds) &&
            restrictToUserIds.length > 0
                ? [...new Set(restrictToUserIds.filter((id) => Number.isFinite(id) && id > 0))]
                : null;

        // 1) Exact match
        const exact = await prisma.user.findFirst({
            where: restrict
                ? { name: trimmed, id: { in: restrict } }
                : { name: trimmed },
            select: { id: true, name: true },
        });
        if (exact) return { exact, suggestions: [] };

        // 2) Fuzzy: مقارنة بالكلمات — إما كل المستثمرين أو المحددين فقط
        const allUsers = await prisma.user.findMany({
            where: restrict
                ? { isAdmin: false, id: { in: restrict } }
                : { isAdmin: false },
            select: { id: true, name: true },
        });

        const words = trimmed.split(/\s+/).filter(w => w.length > 1);
        if (words.length === 0) return { exact: null, suggestions: [] };

        const scored = allUsers.map(u => {
            const nameLower = u.name;
            let matchCount = 0;
            for (const w of words) {
                if (nameLower.includes(w)) matchCount++;
            }
            // Also check reverse: words in the DB name that appear in the search
            const dbWords = u.name.split(/\s+/).filter(w => w.length > 1);
            for (const dw of dbWords) {
                if (trimmed.includes(dw) && !words.some(w => w === dw)) matchCount += 0.5;
            }
            return { id: u.id, name: u.name, score: matchCount };
        });

        const suggestions = scored
            .filter(u => u.score >= 1)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)
            .map(({ id, name }) => ({ id, name }));

        return { exact: null, suggestions };
    } catch (error) {
        console.error("searchInvestorByName error:", error);
        return { exact: null, suggestions: [] };
    }
}

export async function getInvestor(id: number) {
    await requirePageView("investor-page");
    try {
        if (!id || isNaN(id)) return null;

        const investor = await prisma.user.findUnique({
            where: { id },
            include: {
                reports: {
                    orderBy: { createdAt: 'desc' }
                },
                investmentSectors: {
                    include: { sector: true },
                },
            }
        });
        return investor;
    } catch (error) {
        console.error(`Failed to fetch investor ${id}:`, error);
        return null;
    }
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 Client for DigitalOcean Spaces
const s3Client = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT,
    region: process.env.DO_SPACES_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY || "",
        secretAccessKey: process.env.DO_SPACES_SECRET || "",
    },
    forcePathStyle: false, // Spaces supports virtual-hosted-style URLs
});

export async function uploadReport(formData: FormData) {
    await requirePageEdit("investor-upload");
    try {
        const userId = parseInt(formData.get("userId") as string);
        const type = formData.get("type") as string;
        const file = formData.get("file") as File;

        if (!userId || !type || !file) {
            return { error: "Missing required fields" };
        }

        if (file.size === 0) {
            return { error: "File is empty" };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const timestamp = Date.now();
        const fileName = `reports/${userId}/${timestamp}-${file.name.replace(/\s+/g, '-')}`;

        // Upload to Spaces
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.DO_SPACES_BUCKET,
            Key: fileName,
            Body: buffer,
            ACL: "public-read",
            ContentType: file.type,
        }));

        // Construct Public URL
        // Assuming endpoint is like https://fra1.digitaloceanspaces.com
        // And bucket is 'raweas-files'
        // Result: https://raweas-files.fra1.digitaloceanspaces.com/reports/...
        // OR https://fra1.digitaloceanspaces.com/raweas-files/reports/... (path style)
        // DigitalOcean usually supports subdomain style if configured, but let's use the standard construction

        let publicUrl = "";
        const endpoint = process.env.DO_SPACES_ENDPOINT || "";
        const bucket = process.env.DO_SPACES_BUCKET || "";

        // Remove https:// from endpoint to construct subdomain style if possible, or just append
        // Safest approach for Spaces is often: https://BUCKET.REGION.digitaloceanspaces.com/KEY
        // But depends on the endpoint provided in ENV. 
        // Let's assume endpoint is the base URL (e.g. https://fra1.digitaloceanspaces.com)

        const endpointUrl = new URL(endpoint);
        publicUrl = `${endpointUrl.protocol}//${bucket}.${endpointUrl.host}/${fileName}`;

        const fileNameInput = formData.get("fileName") as string;

        // Use provided name or fallback to original file name
        const displayFileName = fileNameInput || file.name;

        await prisma.reports.create({
            data: {
                userId,
                type,
                linkUrl: publicUrl,
                fileName: displayFileName,
                isPublished: false,
                releaseDate: new Date(new Date().getFullYear() - 1, 0, 1),
            }
        });

        revalidatePath(`/admin/investors/${userId}`);
        revalidatePath(`/admin`); // Update stats
        return { success: true };
    } catch (error) {
        console.error("Failed to upload report:", error);
        return { error: "Failed to upload report" };
    }
}

/** رفع ملف واحد لعدة مستثمرين (رفع جماعي) */
export async function bulkUploadReport(formData: FormData) {
    await requirePageEdit("extract-reports");
    try {
        const type = formData.get("type") as string;
        const file = formData.get("file") as File;
        const investorIdsRaw = formData.get("investorIds") as string;
        const yearRaw = formData.get("year") as string;
        const sectorIdRaw = formData.get("sectorId") as string;

        let investorIds = investorIdsRaw
            ? investorIdsRaw.split(",").map(Number).filter((n) => n > 0)
            : [];

        if (sectorIdRaw) {
            const sectorId = Number(sectorIdRaw);
            if (sectorId > 0) {
                const sectorInvestors = await prisma.userInvestmentSector.findMany({
                    where: { sectorId },
                    select: { userId: true },
                });
                const sectorUserIds = sectorInvestors.map((s) => s.userId);
                investorIds = investorIds.length > 0
                    ? investorIds.filter((id) => sectorUserIds.includes(id))
                    : sectorUserIds;
            }
        }

        if (!type || !file || file.size === 0 || investorIds.length === 0) {
            return { error: investorIds.length === 0 && sectorIdRaw ? "لا يوجد مستثمرون في هذا القطاع." : "بيانات غير صالحة." };
        }

        const baseYear =
            yearRaw && !isNaN(Number(yearRaw)) && Number(yearRaw) > 1900
                ? Number(yearRaw)
                : new Date().getFullYear() - 1;

        const buffer = Buffer.from(await file.arrayBuffer());
        const timestamp = Date.now();
        const uid = Math.random().toString(36).slice(2, 10);
        const safeFileName = file.name.replace(/\s+/g, "-");
        const storageKey = `reports/bulk/${timestamp}-${uid}-${safeFileName}`;

        await s3Client.send(
            new PutObjectCommand({
                Bucket: process.env.DO_SPACES_BUCKET,
                Key: storageKey,
                Body: buffer,
                ACL: "public-read",
                ContentType: file.type || "application/pdf",
            })
        );

        const endpoint = process.env.DO_SPACES_ENDPOINT || "";
        const bucket = process.env.DO_SPACES_BUCKET || "";
        const endpointUrl = new URL(endpoint);
        const publicUrl = `${endpointUrl.protocol}//${bucket}.${endpointUrl.host}/${storageKey}`;

        const displayFileName = file.name;
        const releaseDate = new Date(baseYear, 0, 1);

        const { count: created } = await prisma.reports.createMany({
            data: investorIds.map((userId) => ({
                userId,
                type,
                linkUrl: publicUrl,
                fileName: displayFileName,
                isPublished: true,
                isApproved: true,
                releaseDate,
            })),
            skipDuplicates: true,
        });

        revalidatePath("/admin");
        revalidatePath("/admin/extract-reports");
        return { success: true, created };
    } catch (error) {
        console.error("Failed to bulk upload report:", error);
        return { error: "فشل الرفع الجماعي." };
    }
}

export async function deleteReport(reportId: number, userId: number) {
    await requirePageEdit("investor-delete-file");
    try {
        await prisma.reports.delete({
            where: { id: reportId }
        });
        revalidatePath(`/admin/investors/${userId}`);
        revalidatePath(`/admin`);
        return { success: true };
    } catch (error) {
        console.error(`Failed to delete report ${reportId}:`, error);
        return { error: "Failed to delete report" };
    }
}

/** قائمة قطاعات الاستثمار — للنماذج (لوحة التحكم أو صفحة المستثمر) */
export async function getInvestmentSectors() {
    const admin = await getAdminUser(false);
    if (!admin) return [];
    if (
        !canViewPage(admin, "") &&
        !canViewPage(admin, "investor-page") &&
        !canViewPage(admin, "investors-manage")
    ) {
        return [];
    }
    try {
        return await prisma.investmentSector.findMany({
            orderBy: { id: "asc" },
        });
    } catch (error) {
        console.error("getInvestmentSectors:", error);
        return [];
    }
}

/** جلب مستثمري قطاع معيّن (id + name فقط) */
export async function getInvestorsBySector(sectorId: number) {
    const admin = await getAdminUser(false);
    if (!admin) return [];
    try {
        const rows = await prisma.userInvestmentSector.findMany({
            where: { sectorId },
            select: {
                user: { select: { id: true, name: true, isAdmin: true } },
            },
        });
        return rows
            .filter((r) => !r.user.isAdmin)
            .map((r) => ({ id: r.user.id, name: r.user.name }));
    } catch (error) {
        console.error("getInvestorsBySector:", error);
        return [];
    }
}

/** تحديث قطاعات مستثمر (يستبدل الربط بالكامل) */
export async function setInvestorInvestmentSectors(userId: number, sectorIds: number[]) {
    await requirePageEdit("investors-manage");
    try {
        if (!userId || Number.isNaN(userId)) {
            return { error: "معرف غير صالح" };
        }
        const target = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isAdmin: true },
        });
        if (!target) return { error: "المستثمر غير موجود" };
        if (target.isAdmin) return { error: "لا يمكن تعديل حساب إداري" };

        const unique = [...new Set(sectorIds)].filter((id) => Number.isInteger(id) && id > 0);
        const valid = await prisma.investmentSector.findMany({
            where: { id: { in: unique } },
            select: { id: true },
        });
        const validIds = valid.map((s) => s.id);

        await prisma.$transaction(async (tx) => {
            await tx.userInvestmentSector.deleteMany({ where: { userId } });
            if (validIds.length > 0) {
                await tx.userInvestmentSector.createMany({
                    data: validIds.map((sectorId) => ({ userId, sectorId })),
                });
            }
        });

        revalidatePath("/admin");
        revalidatePath(`/admin/investors/${userId}`);
        return { success: true };
    } catch (error) {
        console.error("setInvestorInvestmentSectors:", error);
        return { error: "فشل حفظ القطاعات" };
    }
}

/** إضافة قطاع استثمار جديد */
export async function createInvestmentSector(key: string, nameAr: string) {
    await requirePageEdit("investors-manage");
    try {
        const trimKey = key.trim();
        const trimName = nameAr.trim();
        if (!trimKey) return { error: "المفتاح مطلوب" };

        const exists = await prisma.investmentSector.findUnique({ where: { key: trimKey } });
        if (exists) return { error: "القطاع موجود بالفعل" };

        const sector = await prisma.investmentSector.create({
            data: { key: trimKey, nameAr: trimName || null },
        });
        revalidatePath("/admin");
        return { success: true, sector };
    } catch (error) {
        console.error("createInvestmentSector:", error);
        return { error: "فشل إنشاء القطاع" };
    }
}

export async function updateInvestmentSector(sectorId: number, nameAr: string) {
    await requirePageEdit("investors-manage");
    try {
        if (!sectorId || !Number.isFinite(sectorId)) return { error: "معرف غير صالح" };
        const trimName = nameAr.trim();
        if (!trimName) return { error: "الاسم مطلوب" };
        const sector = await prisma.investmentSector.update({
            where: { id: sectorId },
            data: { nameAr: trimName },
        });
        revalidatePath("/admin");
        return { success: true, sector };
    } catch (error) {
        console.error("updateInvestmentSector:", error);
        return { error: "فشل تعديل القطاع" };
    }
}

export async function createInvestor(formData: FormData) {
    await requirePageEdit("investors-manage");
    try {
        const name = String(formData.get("name") ?? "").trim();
        const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
        /** رقم الهوية — يُخزَّن فقط في عمود `user.password` (تسجيل الدخول مع الجوال) */
        const identity = String(formData.get("nationalId") ?? "").trim();

        const rawSectorIds = formData.getAll("sectorIds");
        const requestedSectorIds = rawSectorIds
            .map((s) => parseInt(String(s), 10))
            .filter((n) => !Number.isNaN(n) && n > 0);

        if (!name || !phoneNumber || !identity) {
            return { error: "الاسم والجوال ورقم الهوية مطلوبة" };
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ phoneNumber }, { password: identity }],
            },
        });

        if (existingUser) {
            return { error: "المستخدم موجود بالفعل (رقم الهاتف أو الهوية)" };
        }

        const validSectors =
            requestedSectorIds.length > 0
                ? await prisma.investmentSector.findMany({
                      where: { id: { in: [...new Set(requestedSectorIds)] } },
                      select: { id: true },
                  })
                : [];
        const validSectorIds = validSectors.map((s) => s.id);

        const user = await prisma.user.create({
            data: {
                name,
                phoneNumber,
                password: identity,
                isAdmin: false,
            },
        });

        if (validSectorIds.length > 0) {
            await prisma.userInvestmentSector.createMany({
                data: validSectorIds.map((sectorId) => ({
                    userId: user.id,
                    sectorId,
                })),
            });
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to create investor:", error);
        return { error: "Failed to create investor" };
    }
}

export async function updateInvestor(formData: FormData) {
    await requirePageEdit("investors-manage");
    try {
        const userId = parseInt(String(formData.get("userId") ?? ""), 10);
        const name = String(formData.get("name") ?? "").trim();
        const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
        /** رقم الهوية — عمود `user.password` فقط */
        const identity = String(formData.get("nationalId") ?? "").trim();

        if (!userId || Number.isNaN(userId)) {
            return { error: "معرف المستثمر غير صالح" };
        }
        if (!name || !phoneNumber) {
            return { error: "الاسم ورقم الجوال مطلوبان" };
        }
        if (!identity) {
            return { error: "رقم الهوية مطلوب" };
        }

        const target = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isAdmin: true },
        });
        if (!target || target.isAdmin) {
            return { error: "المستثمر غير موجود" };
        }

        const duplicate = await prisma.user.findFirst({
            where: {
                id: { not: userId },
                OR: [{ phoneNumber }, { password: identity }],
            },
        });
        if (duplicate) {
            return { error: "رقم الهاتف أو الهوية مستخدم مسبقاً لمستثمر آخر" };
        }

        const rawSectorIds = formData.getAll("sectorIds");
        const requestedSectorIds = rawSectorIds
            .map((s) => parseInt(String(s), 10))
            .filter((n) => !Number.isNaN(n) && n > 0);

        const validSectors =
            requestedSectorIds.length > 0
                ? await prisma.investmentSector.findMany({
                      where: { id: { in: [...new Set(requestedSectorIds)] } },
                      select: { id: true },
                  })
                : [];
        const validSectorIds = validSectors.map((s) => s.id);

        const userUpdate = {
            name,
            phoneNumber,
            password: identity,
        };

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: userUpdate,
            });
            await tx.userInvestmentSector.deleteMany({ where: { userId } });
            if (validSectorIds.length > 0) {
                await tx.userInvestmentSector.createMany({
                    data: validSectorIds.map((sectorId) => ({ userId, sectorId })),
                });
            }
        });

        revalidatePath("/admin");
        revalidatePath(`/admin/investors/${userId}`);
        revalidatePath(`/privatepage/${userId}`);
        return { success: true };
    } catch (error) {
        console.error("updateInvestor:", error);
        return { error: "فشل تحديث بيانات المستثمر" };
    }
}

/** Helper function to download a file from URL and upload to DigitalOcean Spaces */
async function uploadFileUrlToSpaces(fileUrl: string, userId: number, fileName: string): Promise<string | null> {
    console.log(`[DO_UPLOAD] Starting to process file from: ${fileUrl}`);
    try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout

        console.log(`[DO_UPLOAD] Fetching file...`);
        const response = await fetch(fileUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`[DO_UPLOAD] Failed to fetch file from ${fileUrl}: ${response.statusText}`);
            return null;
        }

        console.log(`[DO_UPLOAD] Downloaded successfully, buffering...`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const timestamp = Date.now();
        const uid = Math.random().toString(36).slice(2, 10);
        const safeFileName = fileName.replace(/\s+/g, '-');
        const storageKey = `reports/${userId}/${timestamp}-${uid}-${safeFileName}`;

        console.log(`[DO_UPLOAD] Uploading ${buffer.length} bytes to DO Spaces (${storageKey})...`);
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.DO_SPACES_BUCKET,
            Key: storageKey,
            Body: buffer,
            ACL: "public-read",
            ContentType: "application/pdf",
        }));
        console.log(`[DO_UPLOAD] Upload to DO Spaces completed for: ${storageKey}`);

        const endpoint = process.env.DO_SPACES_ENDPOINT || "";
        const bucket = process.env.DO_SPACES_BUCKET || "";
        const endpointUrl = new URL(endpoint);
        return `${endpointUrl.protocol}//${bucket}.${endpointUrl.host}/${storageKey}`;
    } catch (error) {
        console.error(`Error uploading file from URL ${fileUrl} to DO Spaces:`, error);
        return null;
    }
}

/** حفظ روابط PDF لمستثمر واحد في جدول reports (بعد اختيار المستثمر من النظام) */
export async function saveInvestorReports(
    userId: number,
    urls: string[],
    reportType: string = "lease",
    year?: number
) {
    await requirePageEdit("extract-reports");
    try {
        if (!userId || !Array.isArray(urls) || urls.length === 0) {
            return { error: "بيانات غير صالحة." };
        }

        const baseYear =
            typeof year === "number" && !Number.isNaN(year) && year > 1900
                ? year
                : new Date().getFullYear() - 1;

        const validUrls = urls.filter((u): u is string => !!u && typeof u === "string");
        if (validUrls.length === 0) return { success: true, created: 0 };

        const results = await Promise.all(
            validUrls.map(async (linkUrl) => {
                const fileName = decodeURIComponent(linkUrl.split("/").pop() || "report.pdf");
                const doSpacesUrl = await uploadFileUrlToSpaces(linkUrl, userId, fileName);
                if (!doSpacesUrl) return 0;
                await prisma.reports.create({
                    data: {
                        userId,
                        type: reportType,
                        linkUrl: doSpacesUrl,
                        fileName,
                        isPublished: false,
                        releaseDate: new Date(baseYear, 0, 1),
                    },
                });
                return 1;
            })
        );

        const created = results.reduce<number>((a, b) => a + b, 0);

        revalidatePath("/admin");
        revalidatePath("/admin/extract-reports");
        revalidatePath(`/admin/investors/${userId}`);
        return { success: true, created };
    } catch (error) {
        console.error("Failed to save investor reports:", error);
        return { error: "فشل حفظ التقارير." };
    }
}

/** حفظ روابط PDF المستخرجة من Excel في جدول reports (ربط كل مستثمر بالملفات حسب الاسم) */
export async function saveExtractedReports(
    investorsFiles: Record<string, string[]>,
    reportType: string = "lease"
) {
    await requirePageEdit("extract-reports");
    try {
        if (!investorsFiles || typeof investorsFiles !== "object") {
            return { error: "بيانات الملفات غير صالحة." };
        }

        let created = 0;
        const notFound: string[] = [];
        const errors: string[] = [];

        for (const [investorName, urls] of Object.entries(investorsFiles)) {
            if (!Array.isArray(urls) || urls.length === 0) continue;

            const nameTrim = String(investorName || "").trim();
            const user = await prisma.user.findFirst({
                where: {
                    name: { equals: nameTrim },
                    isAdmin: false,
                },
            });

            if (!user) {
                notFound.push(nameTrim);
                continue;
            }

            for (const linkUrl of urls) {
                if (!linkUrl || typeof linkUrl !== "string") continue;
                const fileName = decodeURIComponent(linkUrl.split("/").pop() || "report.pdf");
                try {
                    // Upload the extracted file to DigitalOcean Spaces first
                    const doSpacesUrl = await uploadFileUrlToSpaces(linkUrl, user.id, fileName);
                    if (!doSpacesUrl) {
                        errors.push(`Upload Failed: ${investorName} - ${linkUrl}`);
                        continue;
                    }

                    await prisma.reports.create({
                        data: {
                            userId: user.id,
                            type: reportType,
                            linkUrl: doSpacesUrl,
                            fileName,
                            isPublished: false,
                            releaseDate: new Date(),
                        },
                    });
                    created++;
                } catch (e) {
                    errors.push(`${investorName}: ${linkUrl}`);
                }
            }
        }

        revalidatePath("/admin");
        revalidatePath("/admin/extract-reports");
        return {
            success: true,
            created,
            notFound,
            errors: errors.length > 0 ? errors : undefined,
        };
    } catch (error) {
        console.error("Failed to save extracted reports:", error);
        return { error: "فشل حفظ التقارير في الجدول." };
    }
}

/** قائمة التقارير في صفحة المراجعة مع أعداد الفلاتر (يُطابق استعلام كل فلتر) */
export async function getReportsReviewPageData(filterRaw: string | null): Promise<ReportsReviewPageData> {
    await requirePageView("review");
    const filter = normalizeReportReviewFilter(filterRaw);
    try {
        const baseWhere = reportReviewPrismaWhere(filter);
        const [
            countAll,
            countUnapproved,
            countPendingPublish,
            countPublished,
            reports,
        ] = await Promise.all([
            prisma.reports.count(),
            prisma.reports.count({ where: { isApproved: false } }),
            prisma.reports.count({ where: { isApproved: true, isPublished: false } }),
            prisma.reports.count({ where: { isPublished: true } }),
            prisma.reports.findMany({
                where: baseWhere ?? {},
                include: { user: { select: { id: true, name: true } } },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        return {
            filter,
            counts: {
                all: countAll,
                unapproved: countUnapproved,
                pendingPublish: countPendingPublish,
                published: countPublished,
            },
            reports: reports as ReviewPageReport[],
        };
    } catch (error) {
        console.error("Failed to fetch reports review page data:", error);
        return {
            filter,
            counts: { all: 0, unapproved: 0, pendingPublish: 0, published: 0 },
            reports: [],
        };
    }
}

/** تغيير حالة النشر لتقرير (من صفحة المستثمر أو مراجعة التقارير) */
export async function toggleReportPublish(reportId: number, publish: boolean, userId?: number) {
    await requirePageEditAny(["investor-publish", "review"]);
    try {
        if (publish) {
            const report = await prisma.reports.findUnique({ where: { id: reportId } });
            if (!report?.isApproved) {
                return { error: "لا يمكن نشر التقرير قبل اعتماده" };
            }
        }

        await prisma.reports.update({
            where: { id: reportId },
            data: { isPublished: publish },
        });
        revalidatePath('/admin/review');
        revalidatePath('/admin');
        if (userId) revalidatePath(`/admin/investors/${userId}`);
        return { success: true };
    } catch (error) {
        console.error(`Failed to toggle publish for report ${reportId}:`, error);
        return { error: "فشل تحديث حالة النشر" };
    }
}

/** اعتماد التقرير (من صفحة المستثمر أو مراجعة التقارير) */
export async function updateReportApproval(reportId: number, isApproved: boolean, userId?: number) {
    await requirePageEditAny(["investor-approve", "review"]);
    try {
        const updateData: any = { isApproved };

        // If revoking approval, also revoke publishing
        if (!isApproved) {
            updateData.isPublished = false;
        }

        await prisma.reports.update({
            where: { id: reportId },
            data: updateData,
        });
        revalidatePath('/admin/review');
        revalidatePath('/admin');
        if (userId) revalidatePath(`/admin/investors/${userId}`);
        return { success: true };
    } catch (error) {
        console.error(`Failed to update approval for report ${reportId}:`, error);
        return { error: "فشل تحديث الاعتماد" };
    }
}
