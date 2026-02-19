"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getInvestmentFunds } from "../investment/getFunds";

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

export async function getFundsForAdmin() {
  try {
    return await getInvestmentFunds();
  } catch (error) {
    console.error("Failed to load funds for admin:", error);
    return {
      cars: null,
      recruitment: null,
      hospitality: null,
    };
  }
}

function getString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (value == null) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
}

function getInt(formData: FormData, key: string): number | null {
  const value = formData.get(key);
  if (value == null) return null;
  const str = String(value).trim();
  if (!str) return null;
  const n = Number.parseInt(str, 10);
  return Number.isNaN(n) ? null : n;
}

export async function updateCarsFund(formData: FormData): Promise<ActionResult> {
  try {
    const daysRental = getString(formData, "daysRental");
    const availableServices = getString(formData, "availableServices");
    const avaiableCars = getString(formData, "avaiableCars");
    const branches = getInt(formData, "branches");

    if (branches == null) {
      return { success: false, error: "عدد الفروع مطلوب ويجب أن يكون رقمًا." };
    }

    const existing = await prisma.rentalcarfund.findFirst({
      orderBy: { id: "desc" },
    });

    if (existing) {
      await prisma.rentalcarfund.update({
        where: { id: existing.id },
        data: { daysRental, availableServices, avaiableCars, branches },
      });
    } else {
      await prisma.rentalcarfund.create({
        data: { daysRental, availableServices, avaiableCars, branches },
      });
    }

    revalidatePath("/investment");
    revalidatePath("/admin/funds");
    revalidatePath("/admin/funds/cars");
    return { success: true };
  } catch (error) {
    console.error("Failed to update cars fund:", error);
    return { success: false, error: "تعذر حفظ بيانات صندوق تأجير السيارات." };
  }
}

/** إضافة سطر تفاصيل استثمارية لصندوق تأجير السيارات */
export async function createRentalCarReportDetail(formData: FormData): Promise<ActionResult> {
  try {
    const investorId = getInt(formData, "investorId");
    const revenues = getInt(formData, "revenues");
    const expenses = getInt(formData, "expenses");
    const profit = getInt(formData, "profit");
    if (investorId == null) {
      return { success: false, error: "المستثمر مطلوب." };
    }
    await prisma.rentalcarfundReportsDetails.create({
      data: {
        investorId,
        revenues: revenues ?? undefined,
        expenses: expenses ?? undefined,
        profit: profit ?? undefined,
      },
    });
    revalidatePath("/admin/funds/cars");
    return { success: true };
  } catch (error) {
    console.error("Failed to create rental car report detail:", error);
    return { success: false, error: "تعذر إضافة التفاصيل الاستثمارية." };
  }
}

/** تحديث سطر تفاصيل استثمارية */
export async function updateRentalCarReportDetail(id: number, formData: FormData): Promise<ActionResult> {
  try {
    const investorId = getInt(formData, "investorId");
    const revenues = getInt(formData, "revenues");
    const expenses = getInt(formData, "expenses");
    const profit = getInt(formData, "profit");
    if (investorId == null) {
      return { success: false, error: "المستثمر مطلوب." };
    }
    await prisma.rentalcarfundReportsDetails.update({
      where: { id },
      data: {
        investorId,
        revenues: revenues ?? undefined,
        expenses: expenses ?? undefined,
        profit: profit ?? undefined,
      },
    });
    revalidatePath("/admin/funds/cars");
    return { success: true };
  } catch (error) {
    console.error("Failed to update rental car report detail:", error);
    return { success: false, error: "تعذر تحديث التفاصيل الاستثمارية." };
  }
}

/** حذف سطر تفاصيل استثمارية */
export async function deleteRentalCarReportDetail(id: number): Promise<ActionResult> {
  try {
    await prisma.rentalcarfundReportsDetails.delete({ where: { id } });
    revalidatePath("/admin/funds/cars");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete rental car report detail:", error);
    return { success: false, error: "تعذر حذف التفاصيل الاستثمارية." };
  }
}

export async function updateRecruitmentFund(formData: FormData): Promise<ActionResult> {
  try {
    const branches = getInt(formData, "branches");
    const contractsCount = getString(formData, "contractsCount");
    const homemaidsCound = getString(formData, "homemaidsCound");
    const musanadRating = getString(formData, "musanadRating");

    if (branches == null) {
      return { success: false, error: "عدد الفروع مطلوب ويجب أن يكون رقمًا." };
    }

    if (!musanadRating) {
      return { success: false, error: "تقييم مساند مطلوب." };
    }

    const existing = await prisma.recruitmentFund.findFirst({
      orderBy: { id: "desc" },
    });

    if (existing) {
      await prisma.recruitmentFund.update({
        where: { id: existing.id },
        data: { branches, contractsCount, homemaidsCound, musanadRating },
      });
    } else {
      await prisma.recruitmentFund.create({
        data: { branches, contractsCount, homemaidsCound, musanadRating },
      });
    }

    revalidatePath("/investment");
    revalidatePath("/admin/funds");
    return { success: true };
  } catch (error) {
    console.error("Failed to update recruitment fund:", error);
    return { success: false, error: "تعذر حفظ بيانات صندوق الاستقدام." };
  }
}

export async function updateHospitalityFund(formData: FormData): Promise<ActionResult> {
  try {
    const branches = getInt(formData, "branches");
    const contractsCount = getString(formData, "contractsCount");
    const homemaidsCound = getString(formData, "homemaidsCound");
    const musanadRating = getString(formData, "musanadRating");
    const facilities = getString(formData, "facilities");

    if (branches == null) {
      return { success: false, error: "عدد الفنادق (الفروع) مطلوب ويجب أن يكون رقمًا." };
    }

    if (!musanadRating) {
      return { success: false, error: "تقييم مساند مطلوب." };
    }

    const existing = await prisma.hospitalityFund.findFirst({
      orderBy: { id: "desc" },
    });

    if (existing) {
      await prisma.hospitalityFund.update({
        where: { id: existing.id },
        data: { branches, contractsCount, homemaidsCound, musanadRating, facilities },
      });
    } else {
      await prisma.hospitalityFund.create({
        data: { branches, contractsCount, homemaidsCound, musanadRating, facilities },
      });
    }

    revalidatePath("/investment");
    revalidatePath("/admin/funds");
    return { success: true };
  } catch (error) {
    console.error("Failed to update hospitality fund:", error);
    return { success: false, error: "تعذر حفظ بيانات صندوق الضيافة." };
  }
}

export type FundKind = "cars" | "recruitment" | "hospitality";

export async function uploadFundImage(
  fundKind: FundKind,
  formData: FormData
): Promise<ActionResult> {
  try {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "يرجى اختيار صورة." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, "-");
    const key = `funds/${fundKind}/${timestamp}-${safeName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: key,
        Body: buffer,
        ACL: "public-read",
        ContentType: file.type || "image/jpeg",
      })
    );

    const endpoint = process.env.DO_SPACES_ENDPOINT || "";
    const bucket = process.env.DO_SPACES_BUCKET || "";
    const endpointUrl = new URL(endpoint);
    const publicUrl = `${endpointUrl.protocol}//${bucket}.${endpointUrl.host}/${key}`;

    if (fundKind === "cars") {
      const existing = await prisma.rentalcarfund.findFirst({
        orderBy: { id: "desc" },
      });
      if (existing) {
        await prisma.rentalcarfund.update({
          where: { id: existing.id },
          data: { imageUrl: publicUrl },
        });
      } else {
        await prisma.rentalcarfund.create({
          data: { branches: 0, imageUrl: publicUrl },
        });
      }
    } else if (fundKind === "recruitment") {
      const existing = await prisma.recruitmentFund.findFirst({
        orderBy: { id: "desc" },
      });
      if (existing) {
        await prisma.recruitmentFund.update({
          where: { id: existing.id },
          data: { imageUrl: publicUrl },
        });
      } else {
        await prisma.recruitmentFund.create({
          data: { branches: 0, musanadRating: "—", imageUrl: publicUrl },
        });
      }
    } else {
      const existing = await prisma.hospitalityFund.findFirst({
        orderBy: { id: "desc" },
      });
      if (existing) {
        await prisma.hospitalityFund.update({
          where: { id: existing.id },
          data: { imageUrl: publicUrl },
        });
      } else {
        await prisma.hospitalityFund.create({
          data: { branches: 0, musanadRating: "—", imageUrl: publicUrl },
        });
      }
    }

    revalidatePath("/investment");
    revalidatePath("/admin/funds");
    revalidatePath("/admin/funds/cars");
    revalidatePath("/admin/funds/recruitment");
    revalidatePath("/admin/funds/hospitality");
    return { success: true };
  } catch (error) {
    console.error("Failed to upload fund image:", error);
    return { success: false, error: "تعذر رفع الصورة. تحقق من إعدادات DigitalOcean." };
  }
}

