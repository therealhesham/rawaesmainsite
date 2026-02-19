import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type FundKind = "cars" | "recruitment" | "hospitality";

export type FundsData = {
  cars: Awaited<ReturnType<typeof getCarsFund>>;
  recruitment: Awaited<ReturnType<typeof getRecruitmentFund>>;
  hospitality: Awaited<ReturnType<typeof getHospitalityFund>>;
};

export async function getCarsFund() {
  return prisma.rentalcarfund.findFirst({
    orderBy: { id: "desc" },
  });
}

export async function getRecruitmentFund() {
  return prisma.recruitmentFund.findFirst({
    orderBy: { id: "desc" },
  });
}

export async function getHospitalityFund() {
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

/** تفاصيل التقارير الاستثمارية لصندوق تأجير السيارات (للوحة الأدمن) */
export async function getRentalCarFundReportsDetails() {
  return prisma.rentalcarfundReportsDetails.findMany({
    orderBy: { id: "desc" },
    include: { investor: { select: { id: true, name: true } } },
  });
}

/** قائمة المستخدمين (لاختيار المستثمر في تفاصيل التقارير) */
export async function getUsersMinimal() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
