/** ثوابت ودوال الصلاحيات — آمنة للاستيراد من مكوّنات العميل (لا تحتوي next/headers أو prisma) */

/** مفتاح كل قسم في لوحة الأدمن */
export const ADMIN_PAGE_KEYS = [
  { key: "", labelAr: "لوحة التحكم" },
  { key: "investors-manage", labelAr: "الحسابات — إضافة مستثمر" },
  { key: "funds", labelAr: "صناديق الاستثمار" },
  { key: "contact", labelAr: "اتصل بنا" },
  { key: "quick-contact", labelAr: "التواصل السريع" },
  { key: "investment-register", labelAr: "سجل اهتمامك" },
  { key: "contact-messages", labelAr: "رسائل التواصل" },
  { key: "investment-register-submissions", labelAr: "طلبات سجل اهتمامك" },
  { key: "extract-reports", labelAr: "استخراج التقارير" },
  { key: "review", labelAr: "مراجعة التقارير" },
  { key: "roles", labelAr: "الصلاحيات والأدوار" },
  { key: "investor-mail", labelAr: "مراسلات البريد" },
  { key: "investor-notifications", labelAr: "إرسال التنبيهات" },
  // صفحة المستثمر — صلاحيات فرعية
  { key: "investor-page", labelAr: "عرض الصفحة" },
  { key: "investor-approve", labelAr: "اعتماد" },
  { key: "investor-upload", labelAr: "رفع الملف" },
  { key: "investor-delete-file", labelAr: "حذف الملف" },
  { key: "investor-publish", labelAr: "حالة النشر" },
] as const;

export type AdminPageKey = (typeof ADMIN_PAGE_KEYS)[number]["key"];

export type AdminUser = {
  id: number;
  name: string;
  roleId: number | null;
  role: { name: string } | null;
  permissions: { pageKey: string; canView: boolean; canEdit: boolean }[];
};

/** مسارات فرعية لها pageKey مستقل */
const MULTI_SEGMENT_KEYS: Record<string, string> = {
  "contact/messages": "contact-messages",
  "investment-register/submissions": "investment-register-submissions",
  investors: "investor-page",
  "bulk-attachments": "extract-reports",
  "add-contract": "investor-upload",
};

/** تحويل مسار الصفحة إلى pageKey */
export function pathToPageKey(pathname: string): string {
  if (!pathname.startsWith("/admin")) return "";
  const rest = pathname.slice("/admin".length).replace(/^\//, "");
  for (const [path, key] of Object.entries(MULTI_SEGMENT_KEYS)) {
    if (rest === path || rest.startsWith(path + "/")) return key;
  }
  const first = rest.split("/")[0];
  return first || "";
}

export function canViewPage(admin: AdminUser | null, pageKey: string): boolean {
  if (!admin) return false;
  if (admin.role?.name === "admin") return true;
  const perm = admin.permissions.find((p) => p.pageKey === pageKey);
  return perm?.canView ?? false;
}

export function canEditPage(admin: AdminUser | null, pageKey: string): boolean {
  if (!admin) return false;
  if (admin.role?.name === "admin") return true;
  const perm = admin.permissions.find((p) => p.pageKey === pageKey);
  return perm?.canEdit ?? false;
}
