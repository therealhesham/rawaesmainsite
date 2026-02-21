"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { resolveLogoUrl } from "@/lib/do-spaces";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || "",
    secretAccessKey: process.env.DO_SPACES_SECRET || "",
  },
  forcePathStyle: false,
});

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
    const contact = await prisma.contactUs.findFirst({
      orderBy: { id: "desc" },
    });
    if (!contact) return null;
    return {
      ...contact,
      emailLogoUrlDisplay: resolveLogoUrl(contact.emailLogoUrl),
    };
  } catch (error) {
    console.error("Failed to load contact us:", error);
    return null;
  }
}

/** قائمة رسائل نموذج «تواصل معنا» للوحة التحكم */
export async function getContactFormSubmissions() {
  try {
    return await prisma.contactFormSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to load contact form submissions:", error);
    return [];
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
    const formRecipientEmail = getString(formData, "formRecipientEmail");
    const mailSenderEmail = getString(formData, "mailSenderEmail");
    const mailSenderPasswordRaw = formData.get("mailSenderPassword");
    const mailSenderPassword =
      mailSenderPasswordRaw != null && String(mailSenderPasswordRaw).trim() !== ""
        ? String(mailSenderPasswordRaw).trim()
        : null;

    const existing = await prisma.contactUs.findFirst({
      orderBy: { id: "desc" },
    });

    const data: Record<string, string | null> = {
      sectionTitle,
      addressLine1,
      addressLine2,
      workingDays,
      workingHours,
      phone,
      email,
      formRecipientEmail,
      mailSenderEmail,
    };
    if (mailSenderPassword !== null) data.mailSenderPassword = mailSenderPassword;
    else if (existing?.mailSenderPassword != null) data.mailSenderPassword = existing.mailSenderPassword;

    if (existing) {
      await prisma.contactUs.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.contactUs.create({ data });
    }

    revalidatePath("/");
    revalidatePath("/admin/contact");
    return { success: true };
  } catch (error) {
    console.error("Failed to update contact us:", error);
    return { success: false, error: "تعذر حفظ بيانات اتصل بنا." };
  }
}

/** رفع شعار البريد الإلكتروني (تواصل معنا) إلى DigitalOcean */
export async function uploadContactEmailLogo(
  formData: FormData
): Promise<ActionResult> {
  try {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "يرجى اختيار صورة." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.-]/g, "") || "logo.png";
    const key = `email-logos/contact-${timestamp}-${safeName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: key,
        Body: buffer,
        ACL: "public-read",
        ContentType: file.type || "image/png",
      })
    );

    const existing = await prisma.contactUs.findFirst({
      orderBy: { id: "desc" },
    });

    if (existing) {
      await prisma.contactUs.update({
        where: { id: existing.id },
        data: { emailLogoUrl: key },
      });
    } else {
      await prisma.contactUs.create({
        data: { emailLogoUrl: key },
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/contact");
    return { success: true };
  } catch (error) {
    console.error("Failed to upload contact email logo:", error);
    return { success: false, error: "تعذر رفع الشعار. تحقق من إعدادات DigitalOcean." };
  }
}
