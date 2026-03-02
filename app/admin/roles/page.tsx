import { requirePageView } from "../lib/auth";
import { getRoles, getAdminUsers } from "./actions";
import { RolesPageClient } from "./RolesPageClient";

export default async function AdminRolesPage() {
  await requirePageView("roles");
  const [roles, adminUsers] = await Promise.all([getRoles(), getAdminUsers()]);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#003B46] dark:text-white">الصلاحيات والأدوار</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
          إدارة الأدوار وصلاحيات كل رتبة على صفحات لوحة التحكم. رتبة <strong>admin</strong> تملك كل الصلاحيات.
        </p>
      </div>

      <RolesPageClient initialRoles={roles} initialAdminUsers={adminUsers} />
    </div>
  );
}
