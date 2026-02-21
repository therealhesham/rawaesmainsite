import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getDoPublicUrl(key: string): string {
  const endpoint = process.env.DO_SPACES_ENDPOINT || "";
  const bucket = process.env.DO_SPACES_BUCKET || "";
  const u = new URL(endpoint);
  return `${u.protocol}//${bucket}.${u.host}/${key}`;
}

export type InvestmentRegisterBlockData = Awaited<
  ReturnType<typeof getInvestmentRegisterBlock>
>;

export async function getInvestmentRegisterBlock() {
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
}
