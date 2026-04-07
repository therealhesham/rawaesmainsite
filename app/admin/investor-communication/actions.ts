"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requirePageEdit, requirePageView } from "../lib/auth";
import { sendMail } from "@/lib/mail";
import { buildInvestorEmail } from "@/lib/email-templates";
import { applyInvestorNamePlaceholders, messageContainsNamePlaceholder } from "@/lib/investor-placeholders";

const prisma = new PrismaClient();

function cleanPhoneForSms(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("966")) return digits.slice(3);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function buildSmsUrl(phone: string, message: string): string {
  const user = process.env.SMS_USER || "966555544961";
  const pass = process.env.SMS_PASS || "Rwes1484";
  const sender = process.env.SMS_SENDER || "RawaesEs";
  const base = process.env.SMS_API_BASE || "https://www.brcitco-api.com/api/sendsms/";
  return `${base}?user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}&to=966${phone}&message=${encodeURIComponent(message)}&sender=${encodeURIComponent(sender)}`;
}

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

export async function getInvestorCommunicationBootData() {
  await requirePageView("investor-communication");

  const [investors, templates, logs, sectors] = await Promise.all([
    prisma.user.findMany({
      where: { isAdmin: false },
      select: { id: true, name: true, email: true, phoneNumber: true },
      orderBy: { name: "asc" },
    }),
    prisma.messageTemplate.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.investorCommunicationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.investmentSector.findMany({ orderBy: { id: "asc" } }),
  ]);

  return { investors, templates, logs, sectors };
}

export async function createMessageTemplate(formData: FormData) {
  await requirePageEdit("investor-communication");
  const name = String(formData.get("name") || "").trim();
  const channel = String(formData.get("channel") || "").trim().toUpperCase();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!name || !body) return { error: "اسم القالب ونصه مطلوبان." };
  if (!["SMS", "EMAIL", "NOTIFICATION"].includes(channel)) return { error: "نوع القالب غير صالح." };

  await prisma.messageTemplate.create({
    data: {
      name,
      channel: channel as any,
      subject: subject || null,
      body,
    },
  });

  revalidatePath("/admin/investor-communication");
  return { success: true };
}

export async function deleteMessageTemplate(id: number) {
  await requirePageEdit("investor-communication");
  await prisma.messageTemplate.delete({ where: { id } });
  revalidatePath("/admin/investor-communication");
  return { success: true };
}

export async function sendInvestorCommunication(formData: FormData) {
  const admin = await requirePageEdit("investor-communication");
  const channelRaw = String(formData.get("channel") || "").trim().toUpperCase();
  const channelsRaw = String(formData.get("channels") || "").trim();
  const mode = String(formData.get("mode") || "").trim().toUpperCase();
  const templateIdRaw = String(formData.get("templateId") || "").trim();
  let subject = String(formData.get("subject") || "").trim();
  let body = String(formData.get("body") || "").trim();
  const linkUrl = String(formData.get("linkUrl") || "#").trim() || "#";

  let channels: ("SMS" | "EMAIL" | "NOTIFICATION")[] = [];
  if (channelsRaw) {
    try {
      const parsed = JSON.parse(channelsRaw);
      if (Array.isArray(parsed)) {
        channels = parsed
          .map((x) => String(x || "").toUpperCase())
          .filter((x): x is "SMS" | "EMAIL" | "NOTIFICATION" => ["SMS", "EMAIL", "NOTIFICATION"].includes(x));
      }
    } catch {
      // ignore and fallback
    }
  }
  if (channels.length === 0 && ["SMS", "EMAIL", "NOTIFICATION"].includes(channelRaw)) {
    channels = [channelRaw as "SMS" | "EMAIL" | "NOTIFICATION"];
  }
  channels = [...new Set(channels)];
  if (channels.length === 0) return { error: "اختر قناة إرسال واحدة على الأقل." };
  if (!["INDIVIDUAL", "MULTIPLE", "SECTOR", "BULK"].includes(mode)) return { error: "نمط الإرسال غير صالح." };

  const tId = parseInt(templateIdRaw, 10);
  if (Number.isNaN(tId)) return { error: "يجب اختيار قالب للإرسال." };
  const selectedTemplate = await prisma.messageTemplate.findUnique({
    where: { id: tId },
    select: { id: true, name: true, subject: true, body: true },
  });
  if (!selectedTemplate) return { error: "القالب المحدد غير موجود." };
  // Template-only: نأخذ النص والموضوع حصراً من القالب
  subject = selectedTemplate.subject || "";
  body = selectedTemplate.body;

  if (!body) return { error: "نص الرسالة مطلوب." };
  if (channels.includes("EMAIL") && !subject) return { error: "موضوع الإيميل مطلوب." };

  type TargetUser = { id: number; name: string; email: string | null; phoneNumber: string | null };
  let targetUsers: TargetUser[] = [];

  if (mode === "BULK") {
    targetUsers = await prisma.user.findMany({
      where: { isAdmin: false },
      select: { id: true, name: true, email: true, phoneNumber: true },
    });
  } else if (mode === "SECTOR") {
    const sectorIdRaw = String(formData.get("sectorId") || "").trim();
    const sid = parseInt(sectorIdRaw, 10);
    if (Number.isNaN(sid)) return { error: "اختر القطاع." };
    const sectorInvestors = await prisma.userInvestmentSector.findMany({
      where: { sectorId: sid },
      select: { user: { select: { id: true, name: true, email: true, phoneNumber: true, isAdmin: true } } },
    });
    targetUsers = sectorInvestors.filter((s) => !s.user.isAdmin).map((s) => s.user);
  } else {
    const recipientIdsRaw = String(formData.get("recipientIds") || "").trim();
    let ids: number[] = [];
    try { ids = JSON.parse(recipientIdsRaw); } catch { /* ignore */ }
    if (!Array.isArray(ids) || ids.length === 0) return { error: "اختر مستثمراً واحداً على الأقل." };
    const validIds = ids.filter((n) => typeof n === "number" && !Number.isNaN(n));
    const users = await prisma.user.findMany({
      where: { id: { in: validIds }, isAdmin: false },
      select: { id: true, name: true, email: true, phoneNumber: true },
    });
    targetUsers = users;
  }

  if (targetUsers.length === 0) return { error: "لا يوجد مستثمرون مطابقون للإرسال." };

  const attachmentNames: string[] = [];
  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
  const attachments = await Promise.all(
    files.map(async (file) => {
      attachmentNames.push(file.name);
      return {
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
        contentType: file.type || undefined,
      };
    })
  );

  const channelErrors: string[] = [];
  for (const channel of channels) {
    let status = "sent";
    let errorMsg: string | null = null;
    try {
      if (channel === "EMAIL") {
        const withMail = targetUsers.filter((u) => !!u.email);
        if (!withMail.length) {
          status = "failed";
          errorMsg = "لا يوجد بريد إلكتروني صالح للمستلمين.";
        } else {
          const settings = await getContactSettings();
          const personalize = messageContainsNamePlaceholder(subject, body);
          if (personalize) {
            let failed = 0;
            for (const u of withMail) {
              const subj = applyInvestorNamePlaceholders(subject, u.name);
              const msgBody = applyInvestorNamePlaceholders(body, u.name);
              const content = buildInvestorEmail({ subject: subj, body: msgBody }, { logoUrl: settings.logoUrl });
              const ok = await sendMail({
                to: u.email!,
                subject: subj,
                text: content.text,
                html: content.html,
                smtpUser: settings.smtpUser,
                smtpPass: settings.smtpPass,
                attachments,
              });
              if (!ok) failed++;
            }
            if (failed > 0) {
              status = "failed";
              errorMsg = failed === withMail.length ? "فشل إرسال الإيميل." : `فشل إرسال ${failed} من ${withMail.length} إيميل.`;
            }
          } else {
            const content = buildInvestorEmail({ subject, body }, { logoUrl: settings.logoUrl });
            const ok = await sendMail({
              to: withMail.map((u) => u.email!).join(","),
              subject,
              text: content.text,
              html: content.html,
              smtpUser: settings.smtpUser,
              smtpPass: settings.smtpPass,
              attachments,
            });
            if (!ok) {
              status = "failed";
              errorMsg = "فشل إرسال الإيميل.";
            }
          }
        }
      } else if (channel === "NOTIFICATION") {
        await prisma.$transaction(
          targetUsers.map((u) =>
            prisma.notifications.create({
              data: {
                type: "admin",
                title: subject ? applyInvestorNamePlaceholders(subject, u.name) : null,
                message: applyInvestorNamePlaceholders(body, u.name),
                isGlobal: mode === "BULK",
                userId: u.id,
                linkUrl,
              },
            })
          )
        );
      } else {
        const withPhone = targetUsers.filter((u) => !!u.phoneNumber);
        if (!withPhone.length) {
          status = "failed";
          errorMsg = "لا يوجد جوال صالح للمستلمين.";
        } else {
          const settled = await Promise.allSettled(
            withPhone.map(async (u) => {
              const phoneForSms = cleanPhoneForSms(u.phoneNumber || "");
              const smsBody = applyInvestorNamePlaceholders(body, u.name);
              const smsRes = await fetch(buildSmsUrl(phoneForSms, smsBody));
              if (!smsRes.ok) throw new Error(`SMS_FAILED_${u.id}`);
            })
          );
          const failed = settled.filter((s) => s.status === "rejected").length;
          if (failed > 0) {
            status = "failed";
            errorMsg = `فشل إرسال ${failed} رسالة SMS.`;
          }
        }
      }
    } catch (e: any) {
      status = "failed";
      errorMsg = e?.message || "فشل الإرسال.";
    }

    await prisma.investorCommunicationLog.create({
      data: {
        channel: channel as any,
        mode: mode as any,
        templateId: selectedTemplate?.id ?? null,
        templateName: selectedTemplate?.name ?? null,
        subject: subject || null,
        body,
        recipientsJson: JSON.stringify(targetUsers.map((u) => ({ id: u.id, name: u.name }))),
        attachmentNames: attachmentNames.length ? JSON.stringify(attachmentNames) : null,
        sentByAdminId: admin.id,
        status,
        errorMsg,
      },
    });

    if (status === "failed") {
      channelErrors.push(`${channel}: ${errorMsg || "فشل الإرسال."}`);
    }
  }

  revalidatePath("/admin/investor-communication");
  revalidatePath("/admin/investor-notifications");
  revalidatePath("/admin/investor-mail");

  if (channelErrors.length > 0) {
    return { error: `تمت محاولة الإرسال مع أخطاء في بعض القنوات: ${channelErrors.join(" | ")}` };
  }
  return { success: true, count: targetUsers.length, channels };
}
