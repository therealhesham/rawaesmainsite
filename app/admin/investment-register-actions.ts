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

const FIELDS = [
  "howToTitle",
  "howToSubtitle",
  "howToImageUrl",
  "step1Title",
  "step1Description",
  "step2Title",
  "step2Description",
  "step3Title",
  "step3Description",
  "step4Title",
  "step4Description",
  "registerHeading",
  "registerSubheading",
  "registerFormTitle",
  "formRecipientEmail",
  "mailSenderEmail",
  "fund1Title",
  "fund1Href",
  "fund2Title",
  "fund2Href",
  "fund3Title",
  "fund3Href",
] as const;

export async function getInvestmentRegisterBlockForAdmin() {
  try {
    return await prisma.investmentRegisterBlock.findFirst({
      orderBy: { id: "desc" },
    });
  } catch (error) {
    console.error("Failed to load investment register block:", error);
    return null;
  }
}

/** قائمة طلبات «سجل اهتمامك» من صفحة الاستثمار */
export async function getInvestmentInterestSubmissions() {
  try {
    return await prisma.investmentInterestSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to load investment interest submissions:", error);
    return [];
  }
}

export async function updateInvestmentRegisterBlock(
  formData: FormData
): Promise<ActionResult> {
  try {
    const data: Record<string, string | null> = {};
    for (const key of FIELDS) {
      data[key] = getString(formData, key);
    }

    const existing = await prisma.investmentRegisterBlock.findFirst({
      orderBy: { id: "desc" },
    });

    const passwordRaw = getString(formData, "mailSenderPassword");
    if (passwordRaw != null && passwordRaw !== "") {
      data.mailSenderPassword = passwordRaw;
    } else if (existing?.mailSenderPassword != null) {
      data.mailSenderPassword = existing.mailSenderPassword;
    } else {
      data.mailSenderPassword = null;
    }

    if (existing) {
      await prisma.investmentRegisterBlock.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.investmentRegisterBlock.create({ data });
    }

    revalidatePath("/investment");
    revalidatePath("/admin/investment-register");
    return { success: true };
  } catch (error) {
    console.error("Failed to update investment register block:", error);
    return { success: false, error: "تعذر حفظ المحتوى." };
  }
}
