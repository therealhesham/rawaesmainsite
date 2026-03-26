"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requirePageEdit, requirePageView } from "../lib/auth";
import { ADMIN_PAGE_KEYS } from "../lib/auth";

const prisma = new PrismaClient();

/** التأكد من وجود رتبة admin (تُنشأ مرة واحدة) */
export async function ensureAdminRole() {
  await prisma.role.upsert({
    where: { name: "admin" },
    create: { name: "admin" },
    update: {},
  });
}

export async function getRoles() {
  await requirePageView("roles");
  await ensureAdminRole();
  const roles = await prisma.role.findMany({
    orderBy: { id: "asc" },
    include: {
      _count: { select: { users: true } },
      permissions: true,
    },
  });
  return roles;
}

export async function getAdminUsers() {
  await requirePageView("roles");
  return prisma.user.findMany({
    where: { isAdmin: true },
    select: { id: true, name: true, phoneNumber: true, roleId: true, role: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createRole(prev: unknown, formDataMaybe?: FormData) {
  const formData = getFormData(prev, formDataMaybe);
  if (!formData) return { error: "طلب غير صالح" };
  await requirePageEdit("roles");
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "اسم الرتبة مطلوب" };
  if (name.toLowerCase() === "admin") return { error: "لا يمكن إنشاء رتبة باسم admin" };
  try {
    await prisma.role.create({
      data: { name },
    });
    revalidatePath("/admin/roles");
    return { success: true };
  } catch (e: unknown) {
    const msg = e && typeof e === "object" && "message" in e ? String((e as Error).message) : "فشل إنشاء الرتبة";
    return { error: msg };
  }
}

export async function updateRoleName(prev: unknown, formDataMaybe?: FormData) {
  const formData = getFormData(prev, formDataMaybe);
  if (!formData) return { error: "طلب غير صالح" };
  await requirePageEdit("roles");
  const id = parseInt(String(formData.get("roleId")), 10);
  const name = (formData.get("name") as string)?.trim();
  if (!id || !name) return { error: "بيانات غير صحيحة" };
  if (name.toLowerCase() === "admin") return { error: "لا يمكن تغيير اسم الرتبة إلى admin" };
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role || role.name === "admin") return { error: "لا يمكن تعديل رتبة admin" };
  try {
    await prisma.role.update({ where: { id }, data: { name } });
    revalidatePath("/admin/roles");
    return { success: true };
  } catch (e: unknown) {
    return { error: "فشل التحديث" };
  }
}

export async function deleteRole(prev: unknown, formDataMaybe?: FormData) {
  const formData = getFormData(prev, formDataMaybe);
  if (!formData) return { error: "طلب غير صالح" };
  await requirePageEdit("roles");
  const id = parseInt(String(formData.get("roleId")), 10);
  if (!id) return { error: "معرف الرتبة مطلوب" };
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role || role.name === "admin") return { error: "لا يمكن حذف رتبة admin" };
  try {
    await prisma.role.delete({ where: { id } });
    revalidatePath("/admin/roles");
    return { success: true };
  } catch {
    return { error: "فشل الحذف (قد يكون الرتبة مرتبطة بمستخدمين)" };
  }
}

/** استخراج FormData سواء استُدعيت الـ action بـ (formData) أو (prev, formData) */
function getFormData(first: unknown, second?: unknown): FormData | null {
  if (second instanceof FormData) return second;
  if (first instanceof FormData) return first;
  return null;
}

function getFormString(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (v == null) return null;
  return typeof v === "string" ? v : null;
}

export async function updateRolePermissions(
  prev: unknown,
  formDataMaybe?: FormData
): Promise<{ error?: string; success?: boolean }> {
  const formData = getFormData(prev, formDataMaybe);
  if (!formData) return { error: "طلب غير صالح" };
  await requirePageEdit("roles");
  const roleIdRaw = getFormString(formData, "roleId");
  const roleId = roleIdRaw ? parseInt(roleIdRaw, 10) : NaN;
  if (!roleIdRaw || isNaN(roleId)) return { error: "معرف الرتبة مطلوب" };
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role || role.name === "admin") return { error: "لا يمكن تعديل صلاحيات رتبة admin" };

  const pageKeys = ADMIN_PAGE_KEYS.map((p) => p.key).filter((k) => k !== "roles"); // صلاحيات الصفحة نفسها يتحكم فيها الأدمن فقط
  const perms: { pageKey: string; canView: boolean; canEdit: boolean }[] = [];
  for (const key of pageKeys) {
    perms.push({
      pageKey: key,
      canView: formData.get(`view_${key}`) === "on",
      canEdit: formData.get(`edit_${key}`) === "on",
    });
  }

  try {
    await prisma.$transaction(
      perms.map((p) =>
        prisma.rolePermission.upsert({
          where: { roleId_pageKey: { roleId, pageKey: p.pageKey } },
          create: { roleId, pageKey: p.pageKey, canView: p.canView, canEdit: p.canEdit },
          update: { canView: p.canView, canEdit: p.canEdit },
        })
      )
    );
    revalidatePath("/admin/roles");
    return { success: true };
  } catch {
    return { error: "فشل حفظ الصلاحيات" };
  }
}

export async function assignUserRole(prev: unknown, formDataMaybe?: FormData) {
  const formData = getFormData(prev, formDataMaybe);
  if (!formData) return { error: "طلب غير صالح" };
  await requirePageEdit("roles");
  const userIdRaw = getFormString(formData, "userId");
  const userId = userIdRaw ? parseInt(userIdRaw, 10) : NaN;
  const roleIdRaw = getFormString(formData, "roleId");
  const roleIdParsed = roleIdRaw && roleIdRaw !== "" ? parseInt(roleIdRaw, 10) : NaN;
  const roleId = roleIdRaw && roleIdRaw !== "" && !isNaN(roleIdParsed) ? roleIdParsed : null;
  if (!userIdRaw || isNaN(userId)) return { error: "المستخدم مطلوب" };
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { roleId },
    });
    revalidatePath("/admin/roles");
    return { success: true };
  } catch {
    return { error: "فشل تحديث رتبة المستخدم" };
  }
}

/** حذف مستخدم من لوحة التحكم (لا يمكن حذف نفسك) */
export async function deleteAdminUser(prev: unknown, formDataMaybe?: FormData) {
  const formData = getFormData(prev, formDataMaybe);
  if (!formData) return { error: "طلب غير صالح" };
  const admin = await requirePageEdit("roles");
  const userIdRaw = getFormString(formData, "userId");
  const userId = userIdRaw ? parseInt(userIdRaw, 10) : NaN;
  if (!userIdRaw || isNaN(userId)) return { error: "معرف المستخدم مطلوب" };
  if (userId === admin.id) return { error: "لا يمكن حذف حسابك الحالي" };
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || !target.isAdmin) return { error: "المستخدم غير موجود أو ليس من لوحة التحكم" };
  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/roles");
    return { success: true };
  } catch {
    return { error: "فشل الحذف (قد يكون المستخدم مرتبطاً بتقارير أو بيانات أخرى)" };
  }
}

/** إضافة مستخدم جديد للوحة التحكم مع تحديد رتبته */
export async function createAdminUser(prev: unknown, formDataMaybe?: FormData) {
  const formData = getFormData(prev, formDataMaybe);
  if (!formData) return { error: "طلب غير صالح" };
  await requirePageEdit("roles");
  const name = getFormString(formData, "name")?.trim();
  const phoneNumber = getFormString(formData, "phoneNumber")?.trim();
  const password = getFormString(formData, "password");
  const roleIdRaw = getFormString(formData, "roleId");
  const roleId = roleIdRaw && roleIdRaw !== "" ? parseInt(roleIdRaw, 10) : null;

  if (!name) return { error: "الاسم مطلوب" };
  if (!phoneNumber) return { error: "رقم الجوال مطلوب" };
  if (!password || password.length < 4) return { error: "كلمة المرور مطلوبة (4 أحرف على الأقل)" };

  const validRoleId = roleId != null && !isNaN(roleId) ? roleId : null;

  try {
    const existing = await prisma.user.findFirst({
      where: { phoneNumber, isAdmin: true },
    });
    if (existing) return { error: "رقم الجوال مسجّل لمستخدم آخر في لوحة التحكم" };
  } catch {
    // ignore
  }

  try {
    await prisma.user.create({
      data: {
        name,
        phoneNumber,
        password,
        isAdmin: true,
        roleId: validRoleId,
      },
    });
    revalidatePath("/admin/roles");
    return { success: true };
  } catch (e: unknown) {
    const msg = e && typeof e === "object" && "message" in e ? String((e as Error).message) : "فشل إضافة المستخدم";
    return { error: msg };
  }
}
