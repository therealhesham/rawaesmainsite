"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requirePageEdit, requirePageView } from "../lib/auth";
import { sendMail } from "@/lib/mail";
import { buildInvestorEmail } from "@/lib/email-templates";

const prisma = new PrismaClient();

/** جلب بيانات SMTP + logo من ContactUs */
async function getContactSettings() {
  const contact = await prisma.contactUs.findFirst({ orderBy: { id: "desc" } });
  return {
    smtpUser: contact?.mailSenderEmail ?? undefined,
    smtpPass: contact?.mailSenderPassword ?? undefined,
    logoUrl: contact?.emailLogoUrl
      ? `${process.env.DO_SPACES_ENDPOINT?.replace(/\/$/, "")}/${process.env.DO_SPACES_BUCKET}/${contact.emailLogoUrl}`
      : null,
  };
}

export type InvestorBasic = { id: number; name: string; email: string | null };

/** جلب قائمة المستثمرين (للقائمة المنسدلة) */
export async function getInvestorsForMail(): Promise<InvestorBasic[]> {
  await requirePageView("investor-mail");
  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return users;
}

/** جلب سجل الإيميلات المرسلة */
export async function getEmailLogs() {
  await requirePageView("investor-mail");
  return prisma.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { recipient: { select: { id: true, name: true } } },
  });
}

/** إرسال إيميل — فردي أو جماعي */
export async function sendInvestorEmail(formData: FormData) {
  const admin = await requirePageEdit("investor-mail");

  const subject = (formData.get("subject") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const mode = formData.get("mode") as string; // "individual" | "bulk"
  const recipientIdRaw = formData.get("recipientId") as string;

  if (!subject || !body) return { error: "يرجى إدخال الموضوع والرسالة." };

  const settings = await getContactSettings();

  // جلب المستلمين
  let recipients: { id: number; name: string; email: string }[] = [];

  if (mode === "bulk") {
    const users = await prisma.user.findMany({
      where: { isAdmin: false, NOT: { email: null } },
      select: { id: true, name: true, email: true },
    });
    recipients = users.filter((u) => u.email) as typeof recipients;
    if (recipients.length === 0) return { error: "لا يوجد مستثمرون لديهم بريد إلكتروني." };
  } else {
    const id = parseInt(recipientIdRaw);
    if (isNaN(id)) return { error: "يرجى اختيار مستثمر." };
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
    if (!user?.email) return { error: "المستثمر المحدد ليس لديه بريد إلكتروني." };
    recipients = [{ id: user.id, name: user.name, email: user.email }];
  }

  const { text, html } = buildInvestorEmail(
    { subject, body },
    { logoUrl: settings.logoUrl }
  );
  const sentAddresses = recipients.map((r) => r.email);
  let errorMsg: string | null = null;
  let status = "sent";

  try {
    // استخدام lib/mail.ts — نفس الـ SMTP اللي بيستخدمه الموقع كله
    const ok = await sendMail({
      to: sentAddresses.join(","),
      subject,
      text,
      html,
      smtpUser: settings.smtpUser,
      smtpPass: settings.smtpPass,
    });
    if (!ok) {
      status = "failed";
      errorMsg = "فشل الإرسال — تحقق من إعدادات SMTP في صفحة اتصل بنا";
    }
  } catch (e: any) {
    console.error("Email send error:", e);
    errorMsg = e.message;
    status = "failed";
  }

  // سجّل في EmailLog
  await prisma.emailLog.create({
    data: {
      subject,
      body,
      sentTo: JSON.stringify(sentAddresses),
      recipientId: mode === "individual" ? recipients[0].id : null,
      sentByAdminId: admin.id,
      status,
      errorMsg,
    },
  });

  revalidatePath("/admin/investor-mail");

  if (status === "failed") {
    return { error: `فشل الإرسال: ${errorMsg}` };
  }

  return { success: true, count: recipients.length };
}
