"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

type ActionResult =
  | { success: true }
  | { success: false; error: string };

function getString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (value == null) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
}

export async function getContactUsForAdmin() {
  try {
    return await prisma.contactUs.findFirst({
      orderBy: { id: "desc" },
    });
  } catch (error) {
    console.error("Failed to load contact us:", error);
    return null;
  }
}

export async function updateContactUs(formData: FormData): Promise<ActionResult> {
  try {
    const sectionTitle = getString(formData, "sectionTitle");
    const addressLine1 = getString(formData, "addressLine1");
    const addressLine2 = getString(formData, "addressLine2");
    const workingDays = getString(formData, "workingDays");
    const workingHours = getString(formData, "workingHours");
    const phone = getString(formData, "phone");
    const email = getString(formData, "email");

    const existing = await prisma.contactUs.findFirst({
      orderBy: { id: "desc" },
    });

    const data = {
      sectionTitle,
      addressLine1,
      addressLine2,
      workingDays,
      workingHours,
      phone,
      email,
    };

    if (existing) {
      await prisma.contactUs.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.contactUs.create({
        data,
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/contact");
    return { success: true };
  } catch (error) {
    console.error("Failed to update contact us:", error);
    return { success: false, error: "تعذر حفظ بيانات اتصل بنا." };
  }
}
