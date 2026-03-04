import { getAdminUser, canViewPage, ADMIN_PAGE_KEYS } from "./lib/auth";
import AdminLayoutClient, { type MenuItem } from "./AdminLayoutClient";
import {
  LayoutDashboard,
  List,
  Landmark,
  Contact,
  PhoneCall,
  UserPlus,
  Mail,
  MessageSquare,
  ClipboardList,
  Send,
  Bell,
  FileBarChart,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

const FULL_MENU: MenuItem[] = [
  { label: "لوحة التحكم", icon: <LayoutDashboard size={22} />, href: "/admin", pageKey: "" },
  {
    label: "إدارة المحتوى",
    icon: <List size={22} />,
    id: "content",
    children: [
      { label: "صناديق الاستثمار", icon: <Landmark size={22} />, href: "/admin/funds", pageKey: "funds" },
      { label: "اتصل بنا", icon: <Contact size={22} />, href: "/admin/contact", exact: true, pageKey: "contact" },
      { label: "التواصل السريع", icon: <PhoneCall size={22} />, href: "/admin/quick-contact", exact: true, pageKey: "quick-contact" },
      { label: "سجل اهتمامك", icon: <UserPlus size={22} />, href: "/admin/investment-register", exact: true, pageKey: "investment-register" },
    ],
  },
  {
    label: "البريد",
    icon: <Mail size={22} />,
    id: "mails",
    children: [
      { label: "رسائل التواصل", icon: <MessageSquare size={22} />, href: "/admin/contact/messages", pageKey: "contact-messages" },
      { label: "طلبات سجل اهتمامك", icon: <ClipboardList size={22} />, href: "/admin/investment-register/submissions", exact: true, pageKey: "investment-register-submissions" },
      { label: "مراسلات البريد", icon: <Send size={22} />, href: "/admin/investor-mail", exact: true, pageKey: "investor-mail" },
      { label: "إرسال التنبيهات", icon: <Bell size={22} />, href: "/admin/investor-notifications", exact: true, pageKey: "investor-notifications" },
    ],
  },
  { label: "استخراج التقارير", icon: <FileBarChart size={22} />, href: "/admin/extract-reports", pageKey: "extract-reports" },
  { label: "مراجعة التقارير", icon: <FileCheck size={22} />, href: "/admin/review", pageKey: "review" },
  { label: "الصلاحيات والأدوار", icon: <ShieldCheck size={22} />, href: "/admin/roles", pageKey: "roles" },
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
