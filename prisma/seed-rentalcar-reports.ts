import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** بيانات الجدول من الصورة — للحقل في السكيما: withdrawen, afterwithdrawen */
const rentalcarfundReportsDetailsSeed = [
  { netprofit: 87883.91, previousyear: 12791.0, afterwithdrawen: 75092.91, withdrawen: 0.0, profit: 75092.91, expenses: 28723.26, revenues: 135998.84, CARSCount: 6, investorId: 106 },
  { netprofit: 0.0, previousyear: 0.0, afterwithdrawen: 0.0, withdrawen: 35343.0, profit: 35343.0, expenses: 0.0, revenues: 35343.0, CARSCount: 1, investorId: 127 },
  { netprofit: 40863.14, previousyear: 0.0, afterwithdrawen: 40863.14, withdrawen: 0.0, profit: 40863.14, expenses: 12005.22, revenues: 70381.13, CARSCount: 4, investorId: 144 },
  { netprofit: 45288.41, previousyear: 27322.38, afterwithdrawen: 17966.02, withdrawen: 0.0, profit: 17966.02, expenses: 3232.32, revenues: 28898.07, CARSCount: 1, investorId: 112 },
  { netprofit: 61637.41, previousyear: 39567.0, afterwithdrawen: 22070.41, withdrawen: 0.0, profit: 22070.41, expenses: 7454.91, revenues: 38984.06, CARSCount: 2, investorId: 137 },
  { netprofit: 179562.84, previousyear: 40707.0, afterwithdrawen: 138855.84, withdrawen: 0.0, profit: 138855.84, expenses: 30895.22, revenues: 230308.11, CARSCount: 12, investorId: 114 },
  { netprofit: 44432.3, previousyear: 31431.0, afterwithdrawen: 13001.3, withdrawen: 0.0, profit: 13001.3, expenses: 1711.06, revenues: 20284.35, CARSCount: 1, investorId: 151 },
  { netprofit: 161388.66, previousyear: 67209.0, afterwithdrawen: 94179.66, withdrawen: 0.0, profit: 94179.66, expenses: 13547.04, revenues: 149006.73, CARSCount: 7, investorId: 108 },
  { netprofit: 28930.38, previousyear: 11231.0, afterwithdrawen: 17699.38, withdrawen: 0.0, profit: 17699.38, expenses: 2491.27, revenues: 27776.1, CARSCount: 1, investorId: 101 },
  { netprofit: 13919.57, previousyear: 0.0, afterwithdrawen: 13919.57, withdrawen: 0.0, profit: 13919.57, expenses: 1604.9, revenues: 21490.0, CARSCount: 1, investorId: 159 },
  { netprofit: 9002.59, previousyear: 5160.0, afterwithdrawen: 3842.59, withdrawen: 0.0, profit: 3842.59, expenses: 5541.51, revenues: 11030.92, CARSCount: 1, investorId: 15 },
  { netprofit: 19937.11, previousyear: 0.0, afterwithdrawen: 19937.11, withdrawen: 0.0, profit: 19937.11, expenses: 2547.98, revenues: 31029.57, CARSCount: 4, investorId: 139 },
  { netprofit: 25476.98, previousyear: 0.0, afterwithdrawen: 25476.98, withdrawen: 0.0, profit: 25476.98, expenses: 4390.55, revenues: 40786.23, CARSCount: 2, investorId: 163 },
  { netprofit: 93186.56, previousyear: 46034.0, afterwithdrawen: 47152.56, withdrawen: 0.0, profit: 47152.56, expenses: 10719.97, revenues: 78080.77, CARSCount: 3, investorId: 97 },
  { netprofit: 10111.84, previousyear: 0.0, afterwithdrawen: 10111.84, withdrawen: 0.0, profit: 10111.84, expenses: 3530.17, revenues: 17975.65, CARSCount: 1, investorId: 158 },
  { netprofit: 17388.54, previousyear: 0.0, afterwithdrawen: 17388.54, withdrawen: 0.0, profit: 17388.54, expenses: 3186.91, revenues: 28027.69, CARSCount: 1, investorId: 140 },
  { netprofit: 25862.21, previousyear: 11151.0, afterwithdrawen: 14711.21, withdrawen: 0.0, profit: 14711.21, expenses: 1701.38, revenues: 22717.39, CARSCount: 1, investorId: 170 },
  { netprofit: 27809.77, previousyear: 13693.0, afterwithdrawen: 14116.77, withdrawen: 0.0, profit: 14116.77, expenses: 2092.75, revenues: 22259.57, CARSCount: 1, investorId: 166 },
  { netprofit: 28553.23, previousyear: 0.0, afterwithdrawen: 28553.23, withdrawen: 0.0, profit: 28553.23, expenses: 9895.07, revenues: 50685.4, CARSCount: 2, investorId: 130 },
  { netprofit: 11181.62, previousyear: 0.0, afterwithdrawen: 11181.62, withdrawen: 0.0, profit: 11181.62, expenses: 3087.31, revenues: 19061.04, CARSCount: 1, investorId: 168 },
  { netprofit: 25450.25, previousyear: -3146.83, afterwithdrawen: 28597.08, withdrawen: 0.0, profit: 28597.08, expenses: 6897.47, revenues: 47750.43, CARSCount: 1, investorId: 135 },
  { netprofit: 11434.21, previousyear: 0.0, afterwithdrawen: 11434.21, withdrawen: 0.0, profit: 11434.21, expenses: 1725.84, revenues: 18060.43, CARSCount: 1, investorId: 154 },
];

function toInt(n: number): number {
  return Math.round(n);
}

async function main() {
  const existingUserIds = new Set(
    (await prisma.user.findMany({ select: { id: true } })).map((u) => u.id)
  );
  const toSeed = rentalcarfundReportsDetailsSeed.filter((row) =>
    existingUserIds.has(row.investorId)
  );
  const missing = rentalcarfundReportsDetailsSeed.filter(
    (row) => !existingUserIds.has(row.investorId)
  );
  if (missing.length > 0) {
    console.warn(
      `تحذير: تم تخطي ${missing.length} صفاً لأن المستثمر غير موجود في جدول user:`,
      missing.map((r) => r.investorId).join(", ")
    );
  }
  for (const row of toSeed) {
    await prisma.rentalcarfundReportsDetails.create({
      data: {
        investorId: row.investorId,
        revenues: toInt(row.revenues),
        expenses: toInt(row.expenses),
        profit: toInt(row.profit),
        withdrawen: toInt(row.withdrawen),
        afterwithdrawen: toInt(row.afterwithdrawen),
        previousyear: toInt(row.previousyear),
        netprofit: toInt(row.netprofit),
        CARSCount: row.CARSCount,
      },
    });
  }
  console.log(`تم إدخال ${toSeed.length} صفاً في rentalcarfundReportsDetails.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
