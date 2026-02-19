import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type ContactUsData = Awaited<ReturnType<typeof getContactUs>>;

export async function getContactUs() {
  return prisma.contactUs.findFirst({
    orderBy: { id: "desc" },
  });
}
