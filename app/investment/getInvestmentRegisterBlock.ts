import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type InvestmentRegisterBlockData = Awaited<
  ReturnType<typeof getInvestmentRegisterBlock>
>;

export async function getInvestmentRegisterBlock() {
  return prisma.investmentRegisterBlock.findFirst({
    orderBy: { id: "desc" },
  });
}
