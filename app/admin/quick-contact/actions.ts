"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requirePageView, requirePageEdit } from "../lib/auth";

const prisma = new PrismaClient();

export async function getQuickContactSettings() {
    await requirePageView("quick-contact");
    try {
        const settings = await prisma.quickContactSettings.findFirst();
        return settings;
    } catch (error) {
        console.error("Error fetching Quick Contact settings:", error);
        return null;
    }
}

export type QuickContactFormState = { success?: boolean; error?: string } | null;

export async function updateQuickContactSettings(
    _prevState: QuickContactFormState,
    formData: FormData
): Promise<QuickContactFormState> {
    await requirePageEdit("quick-contact");
    try {
        const strip = (s: string) =>
            s.replace(/[\u200E\u200F\u200B\u200C\u200D\u2066\u2067\u2068\u2069\u202A-\u202E\uFEFF]/g, "").trim();

        const legalPhone = strip(formData.get("legalPhone") as string);
        const managementPhone = strip(formData.get("managementPhone") as string);
        const suggestionsPhone = strip(formData.get("suggestionsPhone") as string);

        const existingSettings = await prisma.quickContactSettings.findFirst();

        if (existingSettings) {
            await prisma.quickContactSettings.update({
                where: { id: existingSettings.id },
                data: {
                    legalPhone,
                    managementPhone,
                    suggestionsPhone,
                },
            });
        } else {
            await prisma.quickContactSettings.create({
                data: {
                    legalPhone,
                    managementPhone,
                    suggestionsPhone,
                },
            });
        }

        revalidatePath("/admin/quick-contact");
        revalidatePath("/privatepage/[id]", "page");
        return { success: true };
    } catch (error) {
        console.error("Error updating Quick Contact settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
