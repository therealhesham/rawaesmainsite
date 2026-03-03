"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requirePageEdit, requirePageView } from "../lib/auth";

const prisma = new PrismaClient();

export type NotificationRow = {
    id: number;
    title: string | null;
    message: string | null;
    type: string;
    isGlobal: boolean;
    linkUrl: string;
    createdAt: Date;
    user: { id: number; name: string } | null;
};

/** جلب كل التنبيهات */
export async function getNotifications(): Promise<NotificationRow[]> {
    await requirePageView("investor-notifications");
    const rows = await prisma.notifications.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
    });
    // Prisma يعيد user دائماً (relation) — مستثمر الإشعارات العامة userId = 0 لن يوجد
    return rows as unknown as NotificationRow[];
}

/** إنشاء تنبيه جديد */
export async function createNotification(formData: FormData) {
    await requirePageEdit("investor-notifications");

    const title = (formData.get("title") as string)?.trim() || null;
    const message = (formData.get("message") as string)?.trim() || null;
    const mode = formData.get("mode") as string; // "individual" | "bulk"
    const recipientIdRaw = formData.get("recipientId") as string;
    const linkUrl = (formData.get("linkUrl") as string)?.trim() || "#";

    if (!message && !title) return { error: "يرجى إدخال عنوان أو نص التنبيه." };

    if (mode === "bulk") {
        // إنشاء تنبيه عام واحد (isGlobal = true) — يظهر لجميع المستثمرين
        // نحتاج userId — سنستخدم أول مستثمر كمرجع وهمي أو سنخزّنه بشكل مختلف
        // الحل النظيف: userId = 0 ليس صحيحاً في FK — بدلاً من ذلك سننشئ سجلاً لكل مستثمر
        const investors = await prisma.user.findMany({
            where: { isAdmin: false },
            select: { id: true },
        });

        if (investors.length === 0) return { error: "لا يوجد مستثمرون في النظام." };

        await prisma.$transaction(
            investors.map((inv) =>
                prisma.notifications.create({
                    data: {
                        type: "admin",
                        title,
                        message,
                        isGlobal: true,
                        userId: inv.id,
                        linkUrl,
                    },
                })
            )
        );
    } else {
        const recipientId = parseInt(recipientIdRaw);
        if (isNaN(recipientId)) return { error: "يرجى اختيار مستثمر." };

        await prisma.notifications.create({
            data: {
                type: "admin",
                title,
                message,
                isGlobal: false,
                userId: recipientId,
                linkUrl,
            },
        });
    }

    revalidatePath("/admin/investor-notifications");
    return { success: true };
}

/** حذف تنبيه */
export async function deleteNotification(id: number) {
    await requirePageEdit("investor-notifications");
    await prisma.notifications.delete({ where: { id } });
    revalidatePath("/admin/investor-notifications");
    return { success: true };
}

/** جلب قائمة المستثمرين للقائمة المنسدلة */
export async function getInvestorsForNotifications() {
    await requirePageView("investor-notifications");
    return prisma.user.findMany({
        where: { isAdmin: false },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
}
