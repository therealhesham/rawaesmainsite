import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type FundKind = "cars" | "recruitment" | "hospitality";

export type FundsData = {
  cars: Awaited<ReturnType<typeof getCarsFund>>;
  recruitment: Awaited<ReturnType<typeof getRecruitmentFund>>;
  hospitality: Awaited<ReturnType<typeof getHospitalityFund>>;
};

async function getCarsFund() {
  return prisma.rentalcarfund.findFirst({
    orderBy: { id: "desc" },
  });
}

async function getRecruitmentFund() {
  return prisma.recruitmentFund.findFirst({
    orderBy: { id: "desc" },
  });
}

async function getHospitalityFund() {
  return prisma.hospitalityFund.findFirst({
    orderBy: { id: "desc" },
  });
}

/** آخر 3 موديلات من الـ schema: rentalcarfund, recruitmentFund, hospitalityFund */
export async function getInvestmentFunds(): Promise<FundsData> {
  const [cars, recruitment, hospitality] = await Promise.all([
    getCarsFund(),
    getRecruitmentFund(),
    getHospitalityFund(),
  ]);
  return { cars, recruitment, hospitality };
}

/** تبويبات صناديق الاستثمار بالترتيب: تأجير سيارات، استقدام، ضيافة */
export const FUND_TAB_IDS: FundKind[] = ["cars", "recruitment", "hospitality"];

export const FUND_LABELS: Record<FundKind, string> = {
  cars: "صندوق روائس لتأجير السيارات",
  recruitment: "صندوق روائس للاستقدام",
  hospitality: "صندوق روائس للضيافة",
};

export function getFundTabs(): { id: string; label: string }[] {
  return FUND_TAB_IDS.map((id) => ({ id, label: FUND_LABELS[id] }));
}
