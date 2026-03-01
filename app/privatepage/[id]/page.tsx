import { Header } from "../../components/Header";
import { PrismaClient } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { logoutInvestor } from "../../login/actions";

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
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return user;
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
            <span className="text-center break-words leading-relaxed animate-hero-breathe" style={{ animationDelay: "0.15s" }}>استثمر مع روائس القمم</span>
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
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 border-r-4 border-gold text-sm text-gray-600 dark:text-gray-300">
                تم تفعيل استعراض ملفات الاستثمارات من خلال الموقع الرسمي لدى
                مجموعة روائس ( النسخة التجريبية )
              </div>
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48" fill="currentColor" className="mb-2 opacity-50">
                  <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Zm374 98L512-364v-196q0-26 12-50t34-42l-58-58q-10 11-18 20.5T467-670l-60-60q21-21 46-38.5t53-29.5l-62-62q-47 2-83.5 29T316-758q-58 35-97 88.5T160-560v280h80v-280q0-66 47-113t113-47q8 0 15 .5t16 1.5l-57-57 58-58 422 422-58 58-102-101ZM752-280l-62-62q3-9 4.5-18.5T697-376l-57-57q10 21 13 44.5t-2 47.5l29 29q7-14 11-28.5t4-29.5h57q0 21-4.5 41t-15.5 39Z" /> {/* Approximate notifications off */}
                  <path d="M792-56q-33 0-56.5-23.5T712-136q0-33 23.5-56.5T792-216q33 0 56.5 23.5T872-136q0 33-23.5 56.5T792-56Z" />
                </svg>
                <p>لا يوجد اشعارات حالياً</p>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="text-lg font-bold text-center text-[#003B46] dark:text-white mb-6 leading-relaxed break-words px-2">
                التواصل السريع للاستفسارات والاقتراحات
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "الإدارة القانونية" },
                  { title: "الإدارة العليا" },
                  { title: "للاقتراحات والمساعدة" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                  >
                    <span className="font-medium">{item.title}</span>
                    <img
                      alt="Whatsapp"
                      className="w-5 h-5 filter brightness-0 invert"
                      src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    />
                  </div>
                ))}
              </div>
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
                            <a
                              href={report.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gold hover:text-[#003B46] text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              عرض
                            </a>
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
                    رقم العضوية
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200 font-mono break-all">
                    {investor.id}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                    الهوية الوطنية
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200 break-all">
                    {investor.nationalId || "غير متوفر"}
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
                      <a
                        href={report.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gold hover:bg-gold/90 hover:text-[#003B46] text-[#003B46] font-bold text-sm py-1.5 px-4 rounded-lg transition-all shadow-lg shadow-black/20"
                      >
                        معاينة
                      </a>
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
    </div>
  );
}
