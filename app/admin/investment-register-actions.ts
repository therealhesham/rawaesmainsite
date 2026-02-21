"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

/** يبني رابط العرض من مفتاح الملف في DigitalOcean (بدون تخزين الرابط الطويل في DB) */
function getDoPublicUrl(key: string): string {
  const endpoint = process.env.DO_SPACES_ENDPOINT || "";
  const bucket = process.env.DO_SPACES_BUCKET || "";
  const u = new URL(endpoint);
  return `${u.protocol}//${bucket}.${u.host}/${key}`;
}

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
    const block = await prisma.investmentRegisterBlock.findFirst({
      orderBy: { id: "desc" },
    });
    if (!block) return null;
    const howToImageUrlDisplay =
      block.howToImageUrl?.startsWith("http")
        ? block.howToImageUrl
        : block.howToImageUrl
          ? getDoPublicUrl(block.howToImageUrl)
          : null;
    return {
      ...block,
      howToImageUrlDisplay: howToImageUrlDisplay ?? block.howToImageUrl ?? null,
    };
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

/** رفع صورة «كيفية البدء» إلى DigitalOcean وحفظ المفتاح القصير فقط في DB */
export async function uploadInvestmentRegisterHowToImage(
  formData: FormData
): Promise<ActionResult> {
  try {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "يرجى اختيار صورة." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.-]/g, "");
    const key = `investment-register/how-to-${timestamp}-${safeName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: key,
        Body: buffer,
        ACL: "public-read",
        ContentType: file.type || "image/jpeg",
      })
    );

    const existing = await prisma.investmentRegisterBlock.findFirst({
      orderBy: { id: "desc" },
    });

    if (existing) {
      await prisma.investmentRegisterBlock.update({
        where: { id: existing.id },
        data: { howToImageUrl: key },
      });
    } else {
      await prisma.investmentRegisterBlock.create({
        data: { howToImageUrl: key },
      });
    }

    revalidatePath("/investment");
    revalidatePath("/admin/investment-register");
    return { success: true };
  } catch (error) {
    console.error("Failed to upload investment register image:", error);
    return { success: false, error: "تعذر رفع الصورة. تحقق من إعدادات DigitalOcean." };
  }
}
