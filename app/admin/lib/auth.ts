import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_PAGE_KEYS,
  canViewPage,
  canEditPage,
  type AdminUser,
} from "./permissions";

const prisma = new PrismaClient();

export { ADMIN_PAGE_KEYS, canViewPage, canEditPage, type AdminUser, type AdminPageKey } from "./permissions";

/**
 * جلب المستخدم الحالي من الجلسة مع دوره وصلاحياته.
 * إن لم يكن مسجلاً أو غير isAdmin يعيد null أو يعيد التوجيه لصفحة الدخول.
 */
export async function getAdminUser(requireAuth = true): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) {
    if (requireAuth) redirect("/admin/login");
    return null;
  }

  const userId = parseInt(session, 10);
  if (isNaN(userId)) {
    if (requireAuth) redirect("/admin/login");
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      isAdmin: true,
      roleId: true,
      role: { select: { name: true } },
    },
  });

  if (!user || !user.isAdmin) {
    if (requireAuth) redirect("/admin/login");
    return null;
  }

  // صلاحيات الرتبة. رتبة admin أو عدم وجود رتبة (للتوافق مع من كان أدمن سابقاً) = صلاحيات كاملة
  let permissions: { pageKey: string; canView: boolean; canEdit: boolean }[] = [];
  if (user.role?.name === "admin" || user.roleId == null) {
    permissions = ADMIN_PAGE_KEYS.map(({ key }) => ({
      pageKey: key,
      canView: true,
      canEdit: true,
    }));
  } else if (user.roleId) {
    const perms = await prisma.rolePermission.findMany({
      where: { roleId: user.roleId },
      select: { pageKey: true, canView: true, canEdit: true },
    });
    permissions = perms;
  }

  return {
    id: user.id,
    name: user.name,
    roleId: user.roleId ?? null,
    role: user.role,
    permissions,
  };
}

/** التأكد من صلاحية العرض وإلا إعادة توجيه */
export async function requirePageView(pageKey: string): Promise<AdminUser> {
  const admin = await getAdminUser(true);
  if (!canViewPage(admin, pageKey)) redirect("/admin");
  return admin;
}

/** التأكد من صلاحية التعديل (للاستخدام في الـ actions) */
export async function requirePageEdit(pageKey: string): Promise<AdminUser> {
  const admin = await getAdminUser(true);
  if (!canEditPage(admin, pageKey)) {
    throw new Error("ليس لديك صلاحية التعديل على هذه الصفحة");
  }
  return admin;
}
