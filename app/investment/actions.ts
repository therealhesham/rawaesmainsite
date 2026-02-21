"use server";

import { PrismaClient } from "@prisma/client";
import { sendMail } from "@/lib/mail";

const prisma = new PrismaClient();

const FUND_LABELS: Record<string, string> = {
  hospitality: "صندوق الضيافة",
  cars: "صندوق السيارات",
  recruitment: "صندوق الاستقدام",
};
const AMOUNT_LABELS: Record<string, string> = {
  "50-100": "50,000 - 100,000",
  "100-500": "100,000 - 500,000",
  "500+": "أكثر من 500,000",
};

export type InvestmentInterestFormState =
  | { success: true }
  | { success: false; error: string }
  | null;

export async function submitInvestmentInterest(
  _prevState: InvestmentInterestFormState,
  formData: FormData
): Promise<InvestmentInterestFormState> {
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const fund = (formData.get("fund") as string)?.trim() || null;
  const amount = (formData.get("amount") as string)?.trim() || null;

  if (!firstName) return { success: false, error: "الرجاء إدخال الاسم الأول" };
  if (!lastName) return { success: false, error: "الرجاء إدخال الاسم الأخير" };
  if (!email) return { success: false, error: "الرجاء إدخال البريد الإلكتروني" };
  if (!phone) return { success: false, error: "الرجاء إدخال رقم الجوال" };

  try {
    await prisma.investmentInterestSubmission.create({
      data: { firstName, lastName, email, phone, fund, amount },
    });

    const block = await prisma.investmentRegisterBlock.findFirst({
      orderBy: { id: "desc" },
      select: {
        formRecipientEmail: true,
        mailSenderEmail: true,
        mailSenderPassword: true,
      },
    });
    const toEmail = block?.formRecipientEmail?.trim();
    if (!toEmail) {
      console.warn("[Investment] لا يوجد بريد مستلم — اضبط «البريد المستلم» من لوحة التحكم / سجل اهتمامك");
    }
    if (toEmail) {
      const fundLabel = fund ? FUND_LABELS[fund] ?? fund : "—";
      const amountLabel = amount ? AMOUNT_LABELS[amount] ?? amount : "—";
      const text = [
        `طلب جديد من نموذج «سجل اهتمامك»`,
        ``,
        `الاسم: ${firstName} ${lastName}`,
        `البريد: ${email}`,
        `الجوال: ${phone}`,
        `الصندوق: ${fundLabel}`,
        `نطاق الاستثمار: ${amountLabel}`,
      ].join("\n");
      await sendMail({
        to: toEmail,
        subject: `طلب سجل اهتمام — ${firstName} ${lastName}`,
        text,
        replyTo: email,
        smtpUser: block?.mailSenderEmail ?? undefined,
        smtpPass: block?.mailSenderPassword ?? undefined,
      });
    }

    return { success: true };
  } catch (e) {
    console.error("Investment interest submission error:", e);
    return { success: false, error: "حدث خطأ أثناء الإرسال. حاول مرة أخرى." };
  }
}
