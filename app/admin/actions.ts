"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getStats() {
    try {
        const totalInvestors = await prisma.user.count({
            where: { isAdmin: false }
        });
        const totalReports = await prisma.reports.count();

        // Get recent reports
        const recentReports = await prisma.reports.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });

        return { totalInvestors, totalReports, recentReports };
    } catch (error) {
        console.error("Failed to fetch stats:", error);
        return { totalInvestors: 0, totalReports: 0, recentReports: [] };
    }
}

export async function getInvestors(search?: string) {
    try {
        const where = search ? {
            OR: [
                { name: { contains: search } },
                { phoneNumber: { contains: search } },
                { nationalId: { contains: search } },
            ],
            isAdmin: false
        } : { isAdmin: false };

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

/** بحث عن مستثمر بالاسم — exact أولاً، ثم fuzzy بالكلمات */
export async function searchInvestorByName(excelName: string) {
    try {
        const trimmed = excelName.trim();
        if (!trimmed) return { exact: null, suggestions: [] };

        // 1) Exact match
        const exact = await prisma.user.findFirst({
            where: { name: trimmed },
            select: { id: true, name: true },
        });
        if (exact) return { exact, suggestions: [] };

        // 2) Fuzzy: جيب كل المستثمرين وقارن بالكلمات
        const allUsers = await prisma.user.findMany({
            where: { isAdmin: false },
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
    try {
        if (!id || isNaN(id)) return null;

        const investor = await prisma.user.findUnique({
            where: { id },
            include: {
                reports: {
                    orderBy: { createdAt: 'desc' }
                }
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

export async function deleteReport(reportId: number, userId: number) {
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

export async function createInvestor(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const phoneNumber = formData.get("phoneNumber") as string;
        const password = formData.get("password") as string;
        const nationalId = formData.get("nationalId") as string || null;

        if (!name || !phoneNumber || !password) {
            return { error: "Missing required fields" };
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { phoneNumber },
                    { nationalId: nationalId || undefined }
                ]
            }
        });

        if (existingUser) {
            return { error: "المستخدم موجود بالفعل (رقم الهاتف أو الهوية)" };
        }

        await prisma.user.create({
            data: {
                name,
                phoneNumber,
                password, // Note: Storing plain text as per existing seed/auth logic
                nationalId,
                isAdmin: false,
            }
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to create investor:", error);
        return { error: "Failed to create investor" };
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
        const safeFileName = fileName.replace(/\s+/g, '-');
        const storageKey = `reports/${userId}/${timestamp}-${safeFileName}`;

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
    reportType: string = "lease"
) {
    try {
        if (!userId || !Array.isArray(urls) || urls.length === 0) {
            return { error: "بيانات غير صالحة." };
        }

        let created = 0;
        for (const linkUrl of urls) {
            if (!linkUrl || typeof linkUrl !== "string") continue;
            const fileName = decodeURIComponent(linkUrl.split("/").pop() || "report.pdf");

            // Upload the extracted file to DigitalOcean Spaces first
            const doSpacesUrl = await uploadFileUrlToSpaces(linkUrl, userId, fileName);
            if (!doSpacesUrl) continue; // Skip if upload fails

            await prisma.reports.create({
                data: {
                    userId,
                    type: reportType,
                    linkUrl: doSpacesUrl,
                    fileName,
                    isPublished: false,
                    releaseDate: new Date(new Date().getFullYear() - 1, 0, 1),//عايز اللي يتحفظ تاريخ السنة السابقة
                },
            });
            created++;
        }

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

/** جلب التقارير الغير منشورة (isPublished = false) */
export async function getUnpublishedReports() {
    try {
        const reports = await prisma.reports.findMany({
            where: { isPublished: false },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return reports;
    } catch (error) {
        console.error("Failed to fetch unpublished reports:", error);
        return [];
    }
}

/** جلب التقارير المنشورة (isPublished = true) */
export async function getPublishedReports() {
    try {
        const reports = await prisma.reports.findMany({
            where: { isPublished: true },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { updatedAt: 'desc' },
        });
        return reports;
    } catch (error) {
        console.error("Failed to fetch published reports:", error);
        return [];
    }
}

/** تغيير حالة النشر لتقرير */
export async function toggleReportPublish(reportId: number, publish: boolean, userId?: number) {
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

/** اعتماد التقرير (isApproved) */
export async function updateReportApproval(reportId: number, isApproved: boolean, userId?: number) {
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
