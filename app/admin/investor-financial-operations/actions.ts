"use server";

import { PrismaClient, type InvestorFinancialOperationType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requirePageEdit, requirePageView } from "../lib/auth";

const prisma = new PrismaClient();

export type FinancialOpRow = {
  id: number;
  type: InvestorFinancialOperationType;
  amount: unknown;
  operationDate: Date;
  createdAt: Date;
  user: { id: number; name: string };
  createdByAdmin: { id: number; name: string } | null;
};

const VALID_TYPES: InvestorFinancialOperationType[] = [
  "INVESTMENT_INJECTION",
  "DISTRIBUTION_ACCRUAL",
  "BALANCE_WITHDRAWAL",
];

export async function getInvestorsForFinancialOps() {
  await requirePageView("investor-financial");
  return prisma.user.findMany({
    where: { isAdmin: false },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function listFinancialOperations(): Promise<FinancialOpRow[]> {
  await requirePageView("investor-financial");
  const rows = await prisma.investorFinancialOperation.findMany({
    orderBy: [{ operationDate: "desc" }, { id: "desc" }],
    take: 200,
    include: {
      user: { select: { id: true, name: true } },
      createdByAdmin: { select: { id: true, name: true } },
    },
  });
  return rows as FinancialOpRow[];
}

export async function createFinancialOperation(formData: FormData) {
  const admin = await requirePageEdit("investor-financial");

  const userId = parseInt(String(formData.get("userId")), 10);
  const typeRaw = String(formData.get("type") || "").trim();
  const amountRaw = String(formData.get("amount") || "").trim();
  const operationDateRaw = String(formData.get("operationDate") || "").trim();

  if (isNaN(userId) || userId < 1) {
    return { error: "يرجى اختيار مستثمر." };
  }
  if (!VALID_TYPES.includes(typeRaw as InvestorFinancialOperationType)) {
    return { error: "نوع العملية غير صالح." };
  }
  const amount = parseFloat(amountRaw.replace(/,/g, ""));
  if (isNaN(amount) || amount <= 0) {
    return { error: "يرجى إدخال مبلغاً أكبر من صفر." };
  }
  if (!operationDateRaw) {
    return { error: "يرجى تحديد تاريخ العملية." };
  }
  const operationDate = new Date(operationDateRaw + "T12:00:00.000Z");
  if (isNaN(operationDate.getTime())) {
    return { error: "تاريخ غير صالح." };
  }

  const inv = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!inv) {
    return { error: "المستثمر غير موجود." };
  }

  await prisma.investorFinancialOperation.create({
    data: {
      userId,
      type: typeRaw as InvestorFinancialOperationType,
      amount,
      operationDate,
      createdByAdminId: admin.id,
    },
  });

  revalidatePath("/admin/investor-financial-operations");
  revalidatePath(`/privatepage/${userId}`);
  return { success: true };
}
