import { getAdminUser, canViewPage, ADMIN_PAGE_KEYS } from "./lib/auth";
import AdminLayoutClient, { type MenuItem } from "./AdminLayoutClient";

const FULL_MENU: MenuItem[] = [
  { label: "لوحة التحكم", icon: "dashboard", href: "/admin", pageKey: "" },
  {
    label: "إدارة المحتوى",
    icon: "view_list",
    id: "content",
    children: [
      { label: "صناديق الاستثمار", icon: "account_balance", href: "/admin/funds", pageKey: "funds" },
      { label: "اتصل بنا", icon: "contact_page", href: "/admin/contact", exact: true, pageKey: "contact" },
      { label: "التواصل السريع", icon: "phone", href: "/admin/quick-contact", exact: true, pageKey: "quick-contact" },
      { label: "سجل اهتمامك", icon: "how_to_reg", href: "/admin/investment-register", exact: true, pageKey: "investment-register" },
    ],
  },
  {
    label: "البريد",
    icon: "view_list",
    id: "mails",
    children: [
      { label: "رسائل التواصل", icon: "mail", href: "/admin/contact/messages", pageKey: "contact" },
      { label: "طلبات سجل اهتمامك", icon: "assignment", href: "/admin/investment-register/submissions", exact: true, pageKey: "investment-register" },
    ],
  },
  { label: "استخراج التقارير", icon: "table_chart", href: "/admin/extract-reports", pageKey: "extract-reports" },
  { label: "مراجعة التقارير", icon: "rate_review", href: "/admin/review", pageKey: "review" },
  { label: "الصلاحيات والأدوار", icon: "admin_panel_settings", href: "/admin/roles", pageKey: "roles" },
];

function filterMenu(items: MenuItem[], canView: (pageKey: string) => boolean): MenuItem[] {
  const out: MenuItem[] = [];
  for (const item of items) {
    if ("children" in item && item.children) {
      const allowedChildren = item.children.filter((c) => canView(c.pageKey));
      if (allowedChildren.length === 0) continue;
      out.push({ ...item, children: allowedChildren });
    } else {
      const key = ("pageKey" in item ? item.pageKey : "") ?? "";
      if (canView(key)) out.push(item);
    }
  }
  return out;
}

function getAllowedPageKeys(admin: Awaited<ReturnType<typeof getAdminUser>>): string[] {
  if (!admin) return [];
  if (admin.role?.name === "admin" || admin.roleId == null) {
    return ADMIN_PAGE_KEYS.map((p) => p.key);
  }
  return admin.permissions.filter((p) => p.canView).map((p) => p.pageKey);
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser(false);
  const menuItems = admin ? filterMenu(FULL_MENU, (key) => canViewPage(admin, key)) : FULL_MENU;
  const allowedPageKeys = getAllowedPageKeys(admin);

  return (
    <AdminLayoutClient menuItems={menuItems} allowedPageKeys={allowedPageKeys}>
      {children}
    </AdminLayoutClient>
  );
}
