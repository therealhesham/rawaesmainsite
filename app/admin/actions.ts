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
                isPublished: true,
                releaseDate: new Date(),
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
            await prisma.reports.create({
                data: {
                    userId,
                    type: reportType,
                    linkUrl,
                    fileName,
                    isPublished: true,
                    releaseDate: new Date(),
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
                    await prisma.reports.create({
                        data: {
                            userId: user.id,
                            type: reportType,
                            linkUrl,
                            fileName,
                            isPublished: true,
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
