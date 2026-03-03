"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requirePageEdit, requirePageView } from "../lib/auth";
import { sendMail } from "@/lib/mail";

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

/** بناء قالب HTML للإيميل */
function buildEmailHtml(subject: string, body: string, logoUrl: string | null): string {
  const logo = logoUrl
    ? `<div style="text-align:center;margin-bottom:24px">
        <img src="${logoUrl}" alt="روائس القمم" style="height:70px;object-fit:contain;" />
      </div>`
    : `<div style="text-align:center;margin-bottom:24px;font-size:22px;font-weight:bold;color:#003B46;">مجموعة روائس القمم للاستثمار</div>`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F7FA;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FA;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,59,70,0.10);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#003B46 0%,#005F6B 100%);padding:36px 40px 28px;text-align:center;">
            ${logo}
            <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:700;line-height:1.4;">${subject}</h1>
          </td>
        </tr>
        <!-- Gold Divider -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#C9A84C,#F0C040,#C9A84C);"></td></tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <div style="font-size:15px;color:#333333;line-height:1.9;white-space:pre-wrap;">${body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F8F9FA;padding:24px 40px;border-top:1px solid #E8EAED;text-align:center;">
            <p style="margin:0;font-size:12px;color:#888888;">© ${new Date().getFullYear()} مجموعة روائس القمم للاستثمار — جميع الحقوق محفوظة</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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

  const html = buildEmailHtml(subject, body, settings.logoUrl);
  const sentAddresses = recipients.map((r) => r.email);
  let errorMsg: string | null = null;
  let status = "sent";

  try {
    // استخدام lib/mail.ts — نفس الـ SMTP اللي بيستخدمه الموقع كله
    const ok = await sendMail({
      to: sentAddresses.join(","),
      subject,
      text: body,
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
