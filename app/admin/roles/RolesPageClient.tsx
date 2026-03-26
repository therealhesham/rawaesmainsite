"use client";

import { useActionState, useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  createRole,
  updateRoleName,
  deleteRole,
  updateRolePermissions,
  assignUserRole,
  createAdminUser,
  deleteAdminUser,
} from "./actions";
import { ADMIN_PAGE_KEYS } from "../lib/permissions";
import { UserPlus, X, ShieldCheck, Users, PencilLine, Trash2, Eye, Edit3, Plus } from "lucide-react";

/** الكاتيجوري الأم لكل صفحة (كما في السايدبار) */
const PAGE_CATEGORY: Record<string, string> = {
  funds: "إدارة المحتوى",
  contact: "إدارة المحتوى",
  "quick-contact": "إدارة المحتوى",
  "investment-register": "إدارة المحتوى",
  "contact-messages": "البريد",
  "investment-register-submissions": "البريد",
  "extract-reports": "تقارير",
  review: "تقارير",
  "investor-page": "صفحة المستثمر",
  "investor-approve": "صفحة المستثمر",
  "investor-upload": "صفحة المستثمر",
  "investor-delete-file": "صفحة المستثمر",
  "investor-publish": "صفحة المستثمر",
};

function asFormAction(
  action: (prev: unknown, formData?: FormData) => Promise<unknown>
): (formData: FormData) => Promise<void> {
  return (formData: FormData) => action(undefined, formData).then(() => { });
}

/** الأقسام التي لا تحتوي على عمليات تعديل فعلية (لإخفاء زر التعديل) */
const VIEW_ONLY_KEYS: string[] = ["", "messages"];

/** الإجراءات التي لا تمتلك صفحة عرض مستقلة (لإخفاء زر العرض) */
const EDIT_ONLY_KEYS: string[] = [
  "investors-manage",
  "investor-approve",
  "investor-upload",
  "investor-delete-file",
  "investor-publish"
];

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
  const [permState, permAction, isPermPending] = useActionState(updateRolePermissions, null);
  const [assignState, assignAction, isAssignPending] = useActionState(assignUserRole, null);
  const [deleteUserState, deleteUserAction, isDeleteUserPending] = useActionState(deleteAdminUser, null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [permRole, setPermRole] = useState<RoleWithPerms | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (addUserState?.success) {
      setIsAddUserModalOpen(false);
      router.refresh();
    }
  }, [addUserState?.success, router]);

  useEffect(() => {
    if (state?.success) {
      setIsAddRoleModalOpen(false);
      router.refresh();
    }
  }, [state?.success, router]);

  useEffect(() => {
    if (permState?.success) router.refresh();
  }, [permState?.success, router]);

  useEffect(() => {
    if (assignState?.success || deleteUserState?.success) router.refresh();
  }, [assignState?.success, deleteUserState?.success, router]);

  const pageKeysForPerms = ADMIN_PAGE_KEYS.map((p) => p.key).filter((k) => k !== "roles");

  return (
    <div className="space-y-8 p-1">


      {/* ── قائمة الأدوار ── */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#003B46] via-[#0a6375] to-[#003B46]" />
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 pt-7 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003B46]/10 dark:bg-[#003B46]/20">
              <ShieldCheck size={18} className="text-[#003B46] dark:text-[#4db8cc]" />
            </span>
            <h2 className="text-base font-bold text-[#003B46] dark:text-white">الأدوار والصلاحيات</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAddRoleModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#003B46] hover:bg-[#002830] text-white font-semibold py-2.5 px-5 rounded-xl transition-colors shadow-sm text-sm"
          >
            <Plus size={15} />
            إضافة رتبة
          </button>
        </div>

        <div className="px-6 pb-6 overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="py-3 px-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">الرتبة</th>
                <th className="py-3 px-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">المستخدمون</th>
                <th className="py-3 px-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {initialRoles.map((role) => (
                <Fragment key={role.id}>
                  <tr className="group hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3.5 px-3">
                      {role.name === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 font-bold text-[#003B46] dark:text-[#4db8cc]">
                          <ShieldCheck size={14} className="opacity-70" />
                          {role.name}
                        </span>
                      ) : editingRoleId === role.id ? (
                        <form
                          action={asFormAction(updateRoleName)}
                          className="inline-flex gap-2 items-center"
                          onSubmit={() => setEditingRoleId(null)}
                        >
                          <input type="hidden" name="roleId" value={role.id} />
                          <input
                            type="text"
                            name="name"
                            defaultValue={role.name}
                            className="w-36 px-2.5 py-1.5 rounded-lg border border-[#003B46]/30 bg-white dark:bg-gray-800 text-sm text-[#003B46] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003B46]/30"
                          />
                          <button type="submit" className="text-xs font-semibold text-green-600 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">حفظ</button>
                          <button type="button" onClick={() => setEditingRoleId(null)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">إلغاء</button>
                        </form>
                      ) : (
                        <span className="font-medium text-gray-800 dark:text-gray-200">{role.name}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Users size={13} />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{role._count.users}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {role.name !== "admin" ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {/* تعديل الاسم */}
                          <button
                            type="button"
                            onClick={() => setEditingRoleId(editingRoleId === role.id ? null : role.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-[#003B46] dark:text-[#4db8cc] hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium transition-colors"
                          >
                            <PencilLine size={13} />
                            تعديل الاسم
                          </button>

                          {/* الصلاحيات */}
                          <button
                            type="button"
                            onClick={() => setPermRole(role)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#003B46]/20 dark:border-[#4db8cc]/20 bg-[#003B46]/5 dark:bg-[#4db8cc]/5 text-[#003B46] dark:text-[#4db8cc] hover:bg-[#003B46]/10 dark:hover:bg-[#4db8cc]/10 text-xs font-semibold transition-colors"
                          >
                            <ShieldCheck size={13} />
                            الصلاحيات
                          </button>

                          {/* حذف */}
                          <form action={asFormAction(deleteRole)} className="inline-block">
                            <input type="hidden" name="roleId" value={role.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium transition-colors"
                            >
                              <Trash2 size={13} />
                              حذف
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#003B46]/60 dark:text-[#4db8cc]/60 bg-[#003B46]/5 dark:bg-[#4db8cc]/5 px-2.5 py-1 rounded-lg">
                          <ShieldCheck size={12} />
                          صلاحيات كاملة
                        </span>
                      )}
                    </td>
                  </tr>


                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── مستخدمو لوحة التحكم ── */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#003B46] via-[#0a6375] to-[#003B46]" />
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 pt-7 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003B46]/10 dark:bg-[#003B46]/20">
              <Users size={18} className="text-[#003B46] dark:text-[#4db8cc]" />
            </span>
            <h2 className="text-base font-bold text-[#003B46] dark:text-white">مستخدمو لوحة التحكم ورتبهم</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAddUserModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#003B46] hover:bg-[#002830] text-white font-semibold py-2.5 px-5 rounded-xl transition-colors shadow-sm text-sm"
          >
            <UserPlus size={16} />
            إضافة مستخدم
          </button>
        </div>

        <div className="px-6 pb-6 overflow-x-auto">
          {(assignState?.error || deleteUserState?.error) && (
            <p className="mb-3 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
              {assignState?.error ?? deleteUserState?.error}
            </p>
          )}
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="py-3 px-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">الاسم</th>
                <th className="py-3 px-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">الجوال</th>
                <th className="py-3 px-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">الرتبة</th>
                <th className="py-3 px-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {initialAdminUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3.5 px-3 font-medium text-gray-800 dark:text-gray-200">{user.name}</td>
                  <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 dir-ltr font-mono text-xs">{user.phoneNumber ?? "—"}</td>
                  <td className="py-3.5 px-3">
                    {user.role?.name ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#003B46]/8 dark:bg-[#4db8cc]/10 text-[#003B46] dark:text-[#4db8cc] text-xs font-semibold border border-[#003B46]/10 dark:border-[#4db8cc]/20">
                        {user.role.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600 text-xs">بدون رتبة</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="inline-flex flex-wrap items-center gap-2">
                      <form action={assignAction} className="inline-flex items-center gap-2">
                        <input type="hidden" name="userId" value={user.id} />
                        <select
                          key={`role-select-${user.id}-${user.roleId ?? "none"}`}
                          name="roleId"
                          defaultValue={user.roleId != null ? String(user.roleId) : ""}
                          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[#003B46] dark:text-white py-1.5 px-2.5 text-xs focus:ring-2 focus:ring-[#003B46]/30 outline-none transition-all"
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
                          disabled={isAssignPending}
                          className="inline-flex items-center gap-1 bg-[#003B46] hover:bg-[#002830] text-white text-xs font-semibold py-1.5 px-3 rounded-lg disabled:opacity-50 transition-colors"
                        >
                          {isAssignPending ? "جاري..." : "تعيين"}
                        </button>
                      </form>

                      <form
                        action={deleteUserAction}
                        className="inline"
                        onSubmit={(e) => {
                          if (!window.confirm("حذف هذا المستخدم من لوحة التحكم نهائياً؟")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          disabled={isDeleteUserPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium disabled:opacity-50 transition-colors"
                        >
                          <Trash2 size={12} />
                          {isDeleteUserPending ? "جاري الحذف..." : "حذف"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── مودال إضافة مستخدم ── */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="add-user-modal-title">
          <button
            type="button"
            onClick={() => setIsAddUserModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="إغلاق"
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* top gradient */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#003B46] via-[#0a6375] to-[#003B46]" />

            {/* header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003B46]/10 dark:bg-[#003B46]/20">
                  <UserPlus size={15} className="text-[#003B46] dark:text-[#4db8cc]" />
                </span>
                <h3 id="add-user-modal-title" className="text-base font-bold text-[#003B46] dark:text-white">
                  إضافة مستخدم للوحة التحكم
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {/* body */}
            <form action={addUserAction} className="px-6 py-5 space-y-4">
              {(["name", "phoneNumber", "password"] as const).map((field) => {
                const meta: Record<string, { label: string; type: string; placeholder: string; extra?: object }> = {
                  name: { label: "الاسم", type: "text", placeholder: "الاسم الكامل" },
                  phoneNumber: { label: "رقم الجوال", type: "text", placeholder: "5xxxxxxxx", extra: { className: "dir-ltr text-right" } },
                  password: { label: "كلمة المرور", type: "password", placeholder: "4 أحرف على الأقل", extra: { minLength: 4 } },
                };
                const { label, type, placeholder, extra } = meta[field];
                return (
                  <label key={field} className="block">
                    <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{label}</span>
                    <input
                      type={type}
                      name={field}
                      required
                      placeholder={placeholder}
                      {...extra}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[#003B46] dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] dark:focus:border-[#4db8cc] outline-none transition-all text-sm"
                    />
                  </label>
                );
              })}

              <label className="block">
                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">الرتبة</span>
                <select
                  name="roleId"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[#003B46] dark:text-white focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] dark:focus:border-[#4db8cc] outline-none transition-all text-sm"
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
                <p className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg border border-red-200 dark:border-red-500/20">{addUserState.error}</p>
              )}
              {addUserState?.success && (
                <p className="text-green-700 dark:text-green-400 text-xs bg-green-50 dark:bg-green-500/10 px-3 py-2 rounded-lg border border-green-200 dark:border-green-500/20">✓ تمت إضافة المستخدم بنجاح.</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isAddUserPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#003B46] hover:bg-[#002830] text-white font-semibold py-2.5 px-4 rounded-xl disabled:opacity-50 transition-colors text-sm shadow-sm"
                >
                  <UserPlus size={15} />
                  {isAddUserPending ? "جاري الإضافة..." : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── مودال إضافة رتبة ── */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="add-role-modal-title">
          <button
            type="button"
            onClick={() => setIsAddRoleModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="إغلاق"
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#003B46] via-[#0a6375] to-[#003B46]" />

            {/* header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003B46]/10 dark:bg-[#003B46]/20">
                  <ShieldCheck size={15} className="text-[#003B46] dark:text-[#4db8cc]" />
                </span>
                <h3 id="add-role-modal-title" className="text-base font-bold text-[#003B46] dark:text-white">
                  إضافة رتبة جديدة
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRoleModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {/* body */}
            <form action={createAction} className="px-6 py-5 space-y-4">
              <label className="block">
                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">اسم الرتبة</span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="مثال: محرر محتوى"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[#003B46] dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-[#003B46]/30 focus:border-[#003B46] dark:focus:border-[#4db8cc] outline-none transition-all text-sm"
                />
              </label>

              {state?.error && (
                <p className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg border border-red-200 dark:border-red-500/20">{state.error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isCreatePending}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#003B46] hover:bg-[#002830] text-white font-semibold py-2.5 px-4 rounded-xl disabled:opacity-50 transition-colors text-sm shadow-sm"
                >
                  <Plus size={15} />
                  {isCreatePending ? "جاري الإضافة..." : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── مودال الصلاحيات ── */}
      {permRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="perm-modal-title">
          <button
            type="button"
            onClick={() => setPermRole(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="إغلاق"
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#003B46] via-[#0a6375] to-[#003B46]" />

            {/* header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003B46]/10 dark:bg-[#003B46]/20">
                  <ShieldCheck size={15} className="text-[#003B46] dark:text-[#4db8cc]" />
                </span>
                <div>
                  <h3 id="perm-modal-title" className="text-base font-bold text-[#003B46] dark:text-white leading-tight">
                    صلاحيات الرتبة
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{permRole.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPermRole(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {/* feedback */}
            {permState?.success && (
              <p className="mx-6 mt-4 py-2 px-3 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 text-xs font-medium border border-green-200 dark:border-green-500/20 shrink-0">
                ✓ تم حفظ الصلاحيات بنجاح.
              </p>
            )}
            {permState?.error && (
              <p className="mx-6 mt-4 py-2 px-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-500/20 shrink-0">
                {permState.error}
              </p>
            )}

            {/* scrollable form */}
            <form action={permAction} className="flex flex-col flex-1 min-h-0">
              <input type="hidden" name="roleId" value={permRole.id} />
              <div className="overflow-y-auto flex-1 px-6 py-4">
                <table className="w-full text-sm table-fixed">
                  <thead className="sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
                    <tr className="border-b border-gray-200 dark:border-gray-700/60">
                      <th className="py-2.5 pb-3 text-right font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[68%]">الصفحة</th>
                      <th className="py-2.5 text-center w-[16%]">
                        <span className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <Eye size={12} /> عرض
                        </span>
                      </th>
                      <th className="py-2.5 text-center w-[16%]">
                        <span className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <Edit3 size={12} /> تعديل
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                    {pageKeysForPerms.map((key) => {
                      const label = ADMIN_PAGE_KEYS.find((p) => p.key === key)?.labelAr ?? key;
                      const category = PAGE_CATEGORY[key];
                      const perm = permRole.permissions.find((p) => p.pageKey === key);
                      return (
                        <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="py-2.5 text-right">
                            <div className="flex items-center gap-2 flex-wrap">
                              {category && (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-[#003B46]/8 dark:bg-[#4db8cc]/10 text-[#003B46] dark:text-[#4db8cc] text-[10px] font-semibold whitespace-nowrap border border-[#003B46]/10 dark:border-[#4db8cc]/20">
                                  {category}
                                </span>
                              )}
                              <span className="text-gray-700 dark:text-gray-300 text-xs">{label || "لوحة التحكم"}</span>
                            </div>
                          </td>
                          <td className="py-2 text-center">
                            {!EDIT_ONLY_KEYS.includes(key) ? (
                              <input
                                type="checkbox"
                                name={`view_${key}`}
                                defaultChecked={perm?.canView ?? false}
                                className="w-4 h-4 cursor-pointer accent-[#003B46] rounded"
                              />
                            ) : (
                              <span className="text-gray-300 dark:text-gray-700">—</span>
                            )}
                          </td>
                          <td className="py-2 text-center">
                            {!VIEW_ONLY_KEYS.includes(key) ? (
                              <input
                                type="checkbox"
                                name={`edit_${key}`}
                                defaultChecked={perm?.canEdit ?? false}
                                className="w-4 h-4 cursor-pointer accent-[#003B46] rounded"
                              />
                            ) : (
                              <span className="text-gray-300 dark:text-gray-700">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <button
                  type="submit"
                  disabled={isPermPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#003B46] hover:bg-[#002830] text-white font-semibold py-2.5 px-4 rounded-xl disabled:opacity-60 transition-colors text-sm shadow-sm"
                >
                  <ShieldCheck size={14} />
                  {isPermPending ? "جاري الحفظ..." : "حفظ الصلاحيات"}
                </button>
                <button
                  type="button"
                  onClick={() => setPermRole(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
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
