import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * مستخدم واحد للاختبار. الدخول يطابق `password` (رقم الهوية) مع `phoneNumber`
 * معاً — راجع `app/api/auth/send-otp/route.ts` — فالقيمتان أدناه هما بيانات الدخول.
 * الجوال بصيغة 9 خانات بلا صفر بادئ، مثل باقي السجلات.
 */
const USER = {
  name: "مستخدم تجريبي",
  password: "29202252402714",
  phoneNumber: "582187287",
  isAdmin: false,
} as const;

async function main() {
  const existing = await prisma.user.findFirst({
    where: { password: USER.password, phoneNumber: USER.phoneNumber },
    select: { id: true, name: true },
  });

  if (existing) {
    console.log(`موجود مسبقاً (id=${existing.id}): ${existing.name} — لم يُنشأ سجل جديد.`);
    return;
  }

  const created = await prisma.user.create({
    data: { ...USER, nationalId: USER.password },
    select: { id: true },
  });

  console.log(`تم إنشاء المستخدم (id=${created.id}): ${USER.name}`);
  console.log(`  رقم الهوية: ${USER.password}`);
  console.log(`  الجوال:     ${USER.phoneNumber}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
