"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getInvestmentFunds } from "../investment/getFunds";

const prisma = new PrismaClient();

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
    return { success: true };
  } catch (error) {
    console.error("Failed to update cars fund:", error);
    return { success: false, error: "تعذر حفظ بيانات صندوق تأجير السيارات." };
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

