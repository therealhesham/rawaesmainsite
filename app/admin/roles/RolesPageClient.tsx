"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createRole,
  updateRoleName,
  deleteRole,
  updateRolePermissions,
  assignUserRole,
  createAdminUser,
} from "./actions";
import { ADMIN_PAGE_KEYS } from "../lib/permissions";

/** يغلف server action ليتوافق مع نوع form action: (formData) => void | Promise<void> */
function asFormAction(
  action: (prev: unknown, formData?: FormData) => Promise<unknown>
): (formData: FormData) => Promise<void> {
  return (formData: FormData) => action(undefined, formData).then(() => {});
}

type RoleWithPerms = {
  id: number;
  name: string;
  _count: { users: number };
  permissions: { pageKey: string; canView: boolean; canEdit: boolean }[];
};

type AdminUser = {
  id: number;
  name: string;
  phoneNumber: string | null;
  roleId: number | null;
  role: { name: string } | null;
};

export function RolesPageClient({
  initialRoles,
  initialAdminUsers,
}: {
  initialRoles: RoleWithPerms[];
  initialAdminUsers: AdminUser[];
}) {
  const [state, createAction, isCreatePending] = useActionState(createRole, null);
  const [addUserState, addUserAction, isAddUserPending] = useActionState(createAdminUser, null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [permRoleId, setPermRoleId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (addUserState?.success) {
      setIsAddUserModalOpen(false);
      router.refresh();
    }
  }, [addUserState?.success, router]);

  const pageKeysForPerms = ADMIN_PAGE_KEYS.map((p) => p.key).filter((k) => k !== "roles");

  return (
    <div className="space-y-10">
      {/* إنشاء رتبة جديدة */}
      <section className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-[#003B46] dark:text-white mb-4">إضافة رتبة جديدة</h2>
        <form action={createAction} className="flex flex-wrap items-end gap-4">
          <label className="flex-1 min-w-[200px]">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الرتبة</span>
            <input
              type="text"
              name="name"
              required
              placeholder="مثال: محرر محتوى"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[#003B46] dark:text-white"
            />
          </label>
          <button
            type="submit"
            disabled={isCreatePending}
            className="bg-[#003B46] hover:bg-[#002830] text-white font-bold py-2 px-6 rounded-xl disabled:opacity-50"
          >
            {isCreatePending ? "جاري..." : "إضافة"}
          </button>
        </form>
        {state?.error && (
          <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{state.error}</p>
        )}
        {state?.success && (
          <p className="mt-2 text-green-600 dark:text-green-400 text-sm">تمت إضافة الرتبة.</p>
        )}
      </section>

      {/* قائمة الأدوار */}
      <section className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <h2 className="text-lg font-bold text-[#003B46] dark:text-white p-6 pb-0">الأدوار والصلاحيات</h2>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">الرتبة</th>
                <th className="py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">عدد المستخدمين</th>
                <th className="py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {initialRoles.map((role) => (
                <tr key={role.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-2">
                    {role.name === "admin" ? (
                      <span className="font-bold text-[#003B46] dark:text-gold">{role.name}</span>
                    ) : editingRoleId === role.id ? (
                      <form
                        action={asFormAction(updateRoleName)}
                        className="inline-flex gap-2"
                        onSubmit={() => setEditingRoleId(null)}
                      >
                        <input type="hidden" name="roleId" value={role.id} />
                        <input
                          type="text"
                          name="name"
                          defaultValue={role.name}
                          className="w-40 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        />
                        <button type="submit" className="text-green-600 text-sm">حفظ</button>
                        <button type="button" onClick={() => setEditingRoleId(null)} className="text-gray-500 text-sm">إلغاء</button>
                      </form>
                    ) : (
                      <span>{role.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-2">{role._count.users}</td>
                  <td className="py-3 px-2">
                    {role.name !== "admin" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingRoleId(editingRoleId === role.id ? null : role.id)}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-[#003B46] dark:text-gold hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
                        >
                          تعديل الاسم
                        </button>
                        <button
                          type="button"
                          onClick={() => setPermRoleId(permRoleId === role.id ? null : role.id)}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-[#003B46] dark:text-gold hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
                        >
                          {permRoleId === role.id ? "إخفاء الصلاحيات" : "الصلاحيات"}
                        </button>
                        <form action={asFormAction(deleteRole)} className="inline-block">
                          <input type="hidden" name="roleId" value={role.id} />
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
                          >
                            حذف
                          </button>
                        </form>
                      </div>
                    )}
                    {role.name === "admin" && (
                      <span className="text-gray-500 text-sm">صلاحيات كاملة</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {initialRoles.map(
            (role) =>
              role.name !== "admin" &&
              permRoleId === role.id && (
                <div
                  key={role.id}
                  className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="font-bold text-[#003B46] dark:text-white mb-3">صلاحيات: {role.name}</h3>
                  <form action={asFormAction(updateRolePermissions)}>
                    <input type="hidden" name="roleId" value={role.id} />
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="py-2 text-right">الصفحة</th>
                          <th className="py-2">عرض</th>
                          <th className="py-2">تعديل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageKeysForPerms.map((key) => {
                          const label = ADMIN_PAGE_KEYS.find((p) => p.key === key)?.labelAr ?? key;
                          const perm = role.permissions.find((p) => p.pageKey === key);
                          return (
                            <tr key={key} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="py-2">{label || "لوحة التحكم"}</td>
                              <td className="py-2">
                                <input
                                  type="checkbox"
                                  name={`view_${key}`}
                                  defaultChecked={perm?.canView ?? false}
                                />
                              </td>
                              <td className="py-2">
                                <input
                                  type="checkbox"
                                  name={`edit_${key}`}
                                  defaultChecked={perm?.canEdit ?? false}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <button
                      type="submit"
                      className="mt-3 bg-[#003B46] text-white font-bold py-2 px-4 rounded-xl"
                    >
                      حفظ الصلاحيات
                    </button>
                  </form>
                </div>
              )
          )}
        </div>
      </section>

      {/* مستخدمو لوحة التحكم — زر إضافة + الجدول */}
      <section className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#003B46] dark:text-white">مستخدمو لوحة التحكم ورتبهم</h2>
          <button
            type="button"
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 bg-[#003B46] hover:bg-[#002830] text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm"
          >
            <span className="material-icons text-[20px]">person_add</span>
            إضافة مستخدم
          </button>
        </div>
        <div className="p-6 pt-0 overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">الاسم</th>
                <th className="py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">الجوال</th>
                <th className="py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">الرتبة</th>
                <th className="py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {initialAdminUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-2">{user.name}</td>
                  <td className="py-3 px-2">{user.phoneNumber ?? "—"}</td>
                  <td className="py-3 px-2">{user.role?.name ?? "—"}</td>
                  <td className="py-3 px-2">
                    <form action={asFormAction(assignUserRole)} className="inline-flex items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="roleId"
                        defaultValue={user.roleId ?? ""}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[#003B46] dark:text-white py-1 px-2"
                      >
                        <option value="">بدون رتبة</option>
                        {initialRoles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="bg-[#003B46] text-white text-sm py-1 px-3 rounded-lg"
                      >
                        تعيين
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* مودال إضافة مستخدم */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="add-user-modal-title">
          <button
            type="button"
            onClick={() => setIsAddUserModalOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-label="إغلاق"
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 id="add-user-modal-title" className="text-lg font-bold text-[#003B46] dark:text-white">
                إضافة مستخدم للوحة التحكم
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                aria-label="إغلاق"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <form action={addUserAction} className="p-5 space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم</span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="الاسم الكامل"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-[#003B46] dark:text-white focus:ring-2 focus:ring-[#003B46] focus:border-transparent outline-none transition-all"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الجوال</span>
                <input
                  type="text"
                  name="phoneNumber"
                  required
                  placeholder="5xxxxxxxx"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-[#003B46] dark:text-white focus:ring-2 focus:ring-[#003B46] focus:border-transparent outline-none transition-all dir-ltr text-right"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</span>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={4}
                  placeholder="4 أحرف على الأقل"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-[#003B46] dark:text-white focus:ring-2 focus:ring-[#003B46] focus:border-transparent outline-none transition-all"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرتبة</span>
                <select
                  name="roleId"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-[#003B46] dark:text-white focus:ring-2 focus:ring-[#003B46] focus:border-transparent outline-none transition-all"
                >
                  <option value="">بدون رتبة</option>
                  {initialRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              {addUserState?.error && (
                <p className="text-red-600 dark:text-red-400 text-sm">{addUserState.error}</p>
              )}
              {addUserState?.success && (
                <p className="text-green-600 dark:text-green-400 text-sm">تمت إضافة المستخدم بنجاح.</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isAddUserPending}
                  className="flex-1 bg-[#003B46] hover:bg-[#002830] text-white font-bold py-2.5 px-4 rounded-xl disabled:opacity-50 transition-colors"
                >
                  {isAddUserPending ? "جاري الإضافة..." : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
