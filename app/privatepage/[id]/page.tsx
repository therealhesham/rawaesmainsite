import type React from "react";
import { Header } from "../../components/Header";
import { PrismaClient } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { logoutInvestor } from "../../login/actions";
import QuickContact from "./QuickContact";
import FloatingWhatsAppButton from "./FloatingWhatsAppButton";
import ReportFileActions from "./ReportFileActions";
import ProfileSwitcher from "./ProfileSwitcher";
const prisma = new PrismaClient();

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
};

async function getInvestorData(id: string) {
  const userId = parseInt(id);
  if (isNaN(userId)) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      reports: {
        where: { isPublished: true },
        orderBy: { releaseDate: "desc" },
      },
      notfications: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      investorFinancialOperations: {
        orderBy: [{ operationDate: "desc" }, { id: "desc" }],
        take: 100,
      },
    },
  });

  return user;
}

async function getSiblingProfiles(userId: number) {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true, phoneNumber: true },
  });
  if (!currentUser?.password || !currentUser?.phoneNumber) return [];

  const siblings = await prisma.user.findMany({
    where: { password: currentUser.password, phoneNumber: currentUser.phoneNumber },
    select: {
      id: true,
      name: true,
      profilepicture: true,
      investmentSectors: {
        select: { sector: { select: { nameAr: true, key: true } } },
      },
    },
  });
  if (siblings.length <= 1) return [];

  return siblings.map((u) => ({
    id: u.id,
    name: u.name,
    profilepicture: u.profilepicture,
    sectors: u.investmentSectors.map((s) => s.sector.nameAr || s.sector.key),
  }));
}

async function getQuickContactSettings() {
  try {
    return await prisma.quickContactSettings.findFirst();
  } catch (error) {
    console.error("Error fetching Quick Contact settings:", error);
    return null;
  }
}

export default async function PrivateInvestorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // -- Auth Start --
  const cookieStore = await cookies();
  const token = cookieStore.get("investor_session")?.value;

  if (!token) {
    redirect("/login");
  }

  let decodedUserId: number | undefined;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    decodedUserId = payload.userId as number;
  } catch (error) {
    // Token is invalid/tampered/expired
    redirect("/login");
  }

  if (decodedUserId && decodedUserId.toString() !== id) {
    redirect(`/privatepage/${decodedUserId}`);
  }
  // -- Auth End --

  const investor = await getInvestorData(id);

  if (!investor) {
    notFound();
  }

  const [quickContactSettings, siblingProfiles] = await Promise.all([
    getQuickContactSettings(),
    getSiblingProfiles(investor.id),
  ]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-[#F5F7FA] dark:bg-[#121212] text-[#333333] dark:text-[#E0E0E0] font-body">
      <Header />

      {/* Spacing for fixed header */}
      <div className="h-24"></div>

      <div className="container mx-auto px-4 mt-6">
        <div className="bg-[#003B46] rounded-2xl shadow-lg p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10 flex items-center justify-center gap-3 flex-wrap opacity-0 animate-hero-enter">
            <span className="shrink-0 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gold animate-hero-breathe">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className="w-full h-full">
                <path d="M120-120v-80h720v80H120Zm70-200 128-364 126 150 148-242 168 456H190Zm140-80h304l-72-194-110 180-122-146-124 354h124Zm0-160Z" />
              </svg>
            </span>
            <span className="text-center break-words leading-relaxed animate-hero-breathe" style={{ animationDelay: "0.15s" }}>استثمر مع مجموعة روائس</span>
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8 order-2 lg:order-2">
            {/* Notifications */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 relative overflow-hidden">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                <h2 className="text-xl font-bold text-[#003B46] dark:text-white leading-relaxed flex items-center gap-2 min-w-0">
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center text-gold">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                      <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
                    </svg>
                  </span>
                  <span className="break-words">اشعارات مجموعة روائس</span>
                </h2>
                <form action={logoutInvestor}>
                  <button type="submit" className="bg-[#003B46] hover:bg-[#002830] text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="white">
                      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
                    </svg>
                    تسجيل الخروج
                  </button>
                </form>
              </div>
              {/* <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 border-r-4 border-gold text-sm text-gray-600 dark:text-gray-300">
                تم تفعيل استعراض ملفات الاستثمارات من خلال الموقع الرسمي لدى
                مجموعة روائس ( النسخة التجريبية )
              </div> */}
              {/* Notifications list */}
              {investor.notfications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48" fill="currentColor" className="mb-2 opacity-50">
                    <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
                  </svg>
                  <p>لا يوجد اشعارات حالياً</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {investor.notfications.map((notif) => (
                    <div
                      key={notif.id}
                      className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border-r-4 border-gold flex items-start gap-3"
                    >
                      <span className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-gold/15 flex items-center justify-center text-[#003B46] dark:text-gold">
                        <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
                          <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
                        </svg>
                      </span>
                      <div className="flex-1 min-w-0">
                        {notif.title && (
                          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-0.5">{notif.title}</p>
                        )}
                        {notif.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{notif.message}</p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                          {new Date(notif.createdAt).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Contact - مُخفى؛ يظهر زر العائم (تواصل معنا) في الجوال والديسكتوب */}
            <div className="hidden">
              <QuickContact settings={quickContactSettings} />
            </div>

            {/* Categorized Reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'lease', label: 'تقرير الاستثمار في قطاع السيارات', icon: 'car_rental' },
                { id: 'hotel', label: 'تقرير الاستثمار في قطاع فنادق', icon: 'hotel' },
                { id: 'real_estate', label: 'تقرير الاستثمار في قطاع عقاري', icon: 'apartment' },
                { id: 'installment', label: 'تقرير الاستثمار في قطاع تقسيط', icon: 'credit_card' },
              ].map((type) => {
                const reports = investor.reports.filter((r) => r.type === type.id);
                if (reports.length === 0) return null;
                return (
                  <div key={type.id} className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-gold/15 flex items-center justify-center text-[#003B46] dark:text-gold">
                        <span className="material-icons text-[22px]">{type.icon}</span>
                      </div>
                      <h3 className="font-bold text-[#003B46] dark:text-white text-base leading-snug min-w-0 break-words">
                        {type.label}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {reports.length > 0 ? (
                        reports.map((report) => (
                          <div key={report.id} className="flex justify-between items-center group">
                            <div className="flex flex-col gap-0.5 mt-2">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="material-icons text-gold text-sm">description</span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200  max-w-[150px]">
                                  {report.fileName || "تقرير استثماري"}
                                </span>
                              </div>
                              <div className="mt-1.5 ms-6">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[14px] font-bold bg-gold/10 text-[#b8860b] dark:text-gold border border-gold/20">
                                  {new Date(report.releaseDate || report.createdAt).getFullYear()}
                                </span>
                              </div>
                            </div>
                            <ReportFileActions
                              linkUrl={report.linkUrl}
                              suggestedName={report.fileName || "تقرير استثماري"}
                              viewClassName="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gold hover:text-[#003B46] text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                              downloadClassName="text-xs bg-white/90 dark:bg-gray-700 hover:bg-gold/90 dark:hover:bg-gold/25 text-[#003B46] dark:text-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-60"
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-4">
                          لا يوجد عقود حالياً
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attachments */}
            {investor.reports.filter((r: any) => r.type === "attachment").length > 0 && (
              <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gold/15 flex items-center justify-center text-[#003B46] dark:text-gold">
                    <span className="material-icons text-[22px]">attach_file</span>
                  </div>
                  <h3 className="font-bold text-[#003B46] dark:text-white text-base leading-snug min-w-0 break-words">
                    المرفقات ({investor.reports.filter((r: any) => r.type === "attachment").length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {investor.reports.filter((r: any) => r.type === "attachment").map((report: any) => (
                    <div key={report.id} className="flex justify-between items-center group">
                      <div className="flex flex-col gap-0.5 mt-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="material-icons text-gold text-sm">description</span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 max-w-[200px] truncate">
                            {report.fileName || "مرفق"}
                          </span>
                        </div>
                        <div className="mt-1.5 ms-6">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[14px] font-bold bg-gold/10 text-[#b8860b] dark:text-gold border border-gold/20">
                            {new Date(report.releaseDate || report.createdAt).getFullYear()}
                          </span>
                        </div>
                      </div>
                      <ReportFileActions
                        linkUrl={report.linkUrl}
                        suggestedName={report.fileName || "مرفق"}
                        viewClassName="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gold hover:text-[#003B46] text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                        downloadClassName="text-xs bg-white/90 dark:bg-gray-700 hover:bg-gold/90 dark:hover:bg-gold/25 text-[#003B46] dark:text-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-60"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* العمليات المالية */}
            {(() => {
              const ops = investor.investorFinancialOperations;
              const fmtMoney = (v: number) =>
                new Intl.NumberFormat("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

              const meta: Record<string, { label: string; color: string; bgLight: string; bgDark: string; icon: React.ReactNode }> = {
                INVESTMENT_INJECTION: {
                  label: "ضخ استثمار",
                  color: "text-emerald-600 dark:text-emerald-400",
                  bgLight: "bg-emerald-50",
                  bgDark: "dark:bg-emerald-950/30",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor">
                      <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-360H320v80h120v120h80v-120h120v-80H520v-120h-80v120Z" />
                    </svg>
                  ),
                },
                DISTRIBUTION_ACCRUAL: {
                  label: "توزيعات مستحقة",
                  color: "text-amber-600 dark:text-amber-400",
                  bgLight: "bg-amber-50",
                  bgDark: "dark:bg-amber-950/30",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor">
                      <path d="M560-440q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280Zm80-80h400q0-33 23.5-56.5T840-480v-160q-33 0-56.5-23.5T760-720H360q0 33-23.5 56.5T280-640v160q33 0 56.5 23.5T360-400ZM120-160q-33 0-56.5-23.5T40-240v-440h80v440h680v80H120Z" />
                    </svg>
                  ),
                },
                BALANCE_WITHDRAWAL: {
                  label: "سحب من الرصيد",
                  color: "text-red-500 dark:text-red-400",
                  bgLight: "bg-red-50",
                  bgDark: "dark:bg-red-950/30",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor">
                      <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-360v120h80v-120h120v-80H520v-120h-80v120H320v80h120Z" />
                    </svg>
                  ),
                },
              };

              const totals = {
                injected: ops.filter((o) => o.type === "INVESTMENT_INJECTION").reduce((s, o) => s + Number(o.amount), 0),
                distributed: ops.filter((o) => o.type === "DISTRIBUTION_ACCRUAL").reduce((s, o) => s + Number(o.amount), 0),
                withdrawn: ops.filter((o) => o.type === "BALANCE_WITHDRAWAL").reduce((s, o) => s + Number(o.amount), 0),
              };

              return (
                <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                  {/* Header with gradient accent */}
                  <div className="relative px-6 pt-6 pb-5">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#003B46] via-gold to-[#003B46]"></div>
                    <h2 className="text-xl font-bold text-[#003B46] dark:text-white leading-relaxed flex items-center gap-2.5">
                      <span className="shrink-0 w-8 h-8 rounded-lg bg-[#003B46]/10 dark:bg-gold/15 flex items-center justify-center text-gold">
                        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                          <path d="M560-440q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280ZM120-160q-33 0-56.5-23.5T40-240v-440h80v440h680v80H120Z" />
                        </svg>
                      </span>
                      العمليات المالية
                    </h2>
                  </div>

                  {ops.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 px-6 text-gray-400 dark:text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48" fill="currentColor" className="mb-3 opacity-30">
                        <path d="M560-440q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280ZM120-160q-33 0-56.5-23.5T40-240v-440h80v440h680v80H120Z" />
                      </svg>
                      <p className="text-sm">لا توجد عمليات مسجّلة حالياً</p>
                    </div>
                  ) : (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-3 gap-3 px-6 pb-5">
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
                          <p className="text-[11px] font-medium text-emerald-600/70 dark:text-emerald-400/70 mb-1">إجمالي الضخ</p>
                          <p className="text-sm md:text-base font-bold text-emerald-700 dark:text-emerald-300 tabular-nums font-mono">{fmtMoney(totals.injected)}</p>
                        </div>
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
                          <p className="text-[11px] font-medium text-amber-600/70 dark:text-amber-400/70 mb-1">التوزيعات</p>
                          <p className="text-sm md:text-base font-bold text-amber-700 dark:text-amber-300 tabular-nums font-mono">{fmtMoney(totals.distributed)}</p>
                        </div>
                        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-3 text-center">
                          <p className="text-[11px] font-medium text-red-500/70 dark:text-red-400/70 mb-1">المسحوب</p>
                          <p className="text-sm md:text-base font-bold text-red-600 dark:text-red-300 tabular-nums font-mono">{fmtMoney(totals.withdrawn)}</p>
                        </div>
                      </div>

                      {/* Operations List */}
                      <div className="border-t border-gray-100 dark:border-gray-800">
                        <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                          {ops.map((op) => {
                            const m = meta[op.type] ?? meta.INVESTMENT_INJECTION;
                            const n = Number(op.amount);
                            const isWithdrawal = op.type === "BALANCE_WITHDRAWAL";
                            return (
                              <div key={op.id} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                                {/* Icon */}
                                <div className={`shrink-0 w-10 h-10 rounded-xl ${m.bgLight} ${m.bgDark} flex items-center justify-center ${m.color}`}>
                                  {m.icon}
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
                                    {m.label}
                                  </p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    {new Date(op.operationDate).toLocaleDateString("ar-SA", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                                {/* Amount */}
                                <div className="text-left shrink-0">
                                  <span
                                    className={`text-sm md:text-base font-bold tabular-nums font-mono ${
                                      isWithdrawal
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-emerald-700 dark:text-emerald-400"
                                    }`}
                                  >
                                    {isWithdrawal ? "−" : "+"}
                                    {fmtMoney(n)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="lg:col-span-4 space-y-6 order-1 lg:order-1">
            {/* User Profile */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-8 text-center relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#003B46] to-gold"></div>
              <div className="w-24 h-24 mx-auto mb-4 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center p-2">
                {/* User Avatar */}
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-[#003B46]">
                  {investor.name.charAt(0)}
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#003B46] dark:text-gold mb-1">
                {investor.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-mono">
                {investor.email || "Rawaes Group Investor"}
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                    رقم الهوية
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200 break-all">
                    {investor.password || "غير متوفر"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                    رقم الجوال
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200 font-mono break-all">
                    {investor.phoneNumber}
                  </p>
                </div>
              </div>
              {siblingProfiles.length > 1 && (
                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                  <ProfileSwitcher
                    currentProfileId={investor.id}
                    profiles={siblingProfiles}
                  />
                </div>
              )}
            </div>

            {/* Contracts */}
            <div className="bg-[#003B46] rounded-2xl shadow-lg p-6 text-white overflow-hidden relative">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
              <h3 className="text-xl font-bold text-center mb-6 relative z-10 border-b border-white/20 pb-4 leading-relaxed">
                عقودي
              </h3>
              <div className="space-y-4 relative z-10">
                {investor.reports.filter(r => r.type === 'contract').length > 0 ? (
                  investor.reports.filter(r => r.type === 'contract').map((report) => (
                    <div
                      key={report.id}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center border border-white/10 hover:bg-white/20 transition-colors group"
                    >
                      <div>
                        <p className="text-sm text-gray-300 mb-1">
                          {report.fileName || "تقرير استثماري"}
                        </p>
                        <div className="mt-2 text-start">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gold/20 text-gold border border-gold/30">
                            {new Date(report.releaseDate || report.createdAt).getFullYear()}
                          </span>
                        </div>
                      </div>
                      <ReportFileActions
                        linkUrl={report.linkUrl}
                        suggestedName={report.fileName || "تقرير استثماري"}
                        viewLabel="معاينة"
                        viewClassName="bg-gold hover:bg-gold/90 hover:text-[#003B46] text-[#003B46] font-bold text-sm py-1.5 px-4 rounded-lg transition-all shadow-lg shadow-black/20"
                        downloadClassName="border-2 border-gold/80 text-gold hover:bg-gold hover:text-[#003B46] font-bold text-sm py-1.5 px-4 rounded-lg transition-all disabled:opacity-60"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-300">لا يوجد عقود حالياً</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingWhatsAppButton settings={quickContactSettings} />
    </div>
  );
}
