"use server";

import { PrismaClient } from "@prisma/client";
import { sendMail } from "@/lib/mail";
import { buildContactEmail } from "@/lib/email-templates";
import { resolveLogoUrl } from "@/lib/do-spaces";

const prisma = new PrismaClient();

export type ContactFormState =
  | { success: true }
  | { success: false; error: string }
  | null;

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const message = (formData.get("message") as string)?.trim() || null;

  if (!firstName) return { success: false, error: "الرجاء إدخال الاسم الأول" };
  if (!lastName) return { success: false, error: "الرجاء إدخال الاسم الأخير" };
  if (!email) return { success: false, error: "الرجاء إدخال البريد الإلكتروني" };

  try {
    await prisma.contactFormSubmission.create({
      data: { firstName, lastName, email, phone, message },
    });

    const contactConfig = await prisma.contactUs.findFirst({
      orderBy: { id: "desc" },
      select: {
        formRecipientEmail: true,
        mailSenderEmail: true,
        mailSenderPassword: true,
        emailLogoUrl: true,
      },
    });
    const toEmail = contactConfig?.formRecipientEmail?.trim();
    if (!toEmail) {
      console.warn("[Contact] لا يوجد بريد مستلم — اضبط «البريد المستلم» من لوحة التحكم / اتصل بنا");
    }
    if (toEmail) {
      const logoUrl = resolveLogoUrl(contactConfig?.emailLogoUrl);
      const { text, html } = buildContactEmail(
        { firstName, lastName, email, phone, message },
        { logoUrl }
      );
      await sendMail({
        to: toEmail,
        subject: `رسالة تواصل — ${firstName} ${lastName}`,
        text,
        html,
        replyTo: email,
        smtpUser: contactConfig?.mailSenderEmail ?? undefined,
        smtpPass: contactConfig?.mailSenderPassword ?? undefined,
      });
    }

    return { success: true };
  } catch (e) {
    console.error("Contact form submission error:", e);
    return { success: false, error: "حدث خطأ أثناء الإرسال. حاول مرة أخرى." };
  }
}
