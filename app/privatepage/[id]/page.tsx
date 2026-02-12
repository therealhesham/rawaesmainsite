import Link from "next/link";

// Mock investor data - replace with API/database fetch using params.id
function getInvestorData(id: string) {
  return {
    investorId: "252402714",
    nationalId: "01010315691",
    name: "هشام بدر",
    phone: "565010026", // Added phone for the new design
    membershipNo: "2213516269", // Added membership no
    contracts: [
      { id: "1", name: "عقد ر ه ب", number: "5176" },
      { id: "2", name: "عقد د ه ر", number: "7597" }, // Fixed name to match new design expectation if needed, or kept generic
      { id: "3", name: "عقد ر ر م", number: "3474" }, // Fixed name
    ],
  };
}

export default async function PrivateInvestorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const investor = getInvestorData(id);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-[#F5F7FA] dark:bg-[#121212] text-[#333333] dark:text-[#E0E0E0] font-sans">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-white dark:bg-[#1E1E1E] rounded-full shadow-md flex items-center justify-center p-1 overflow-hidden">
            {/* Using a placeholder or the provided URL if accessible, utilizing next/image would be better but standard img for now to match provided HTML speed */}
            <img
              alt="Rawaes Group Logo"
              className="w-full h-full object-contain rounded-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuqvyQSiArfVUTr0arwAXRIao5Moc7KLLDbLpQ5LAhnZ3bwfPS0kBpcA5RU8a8JbR206VWN0fGzEqQk0HdwlmrgsdCWBWyT64Kj5yZyxUwsv-j5bw22OvYnYep7UaJkox4jcQAsjERCoFnFo16pndIgjk9WBk3vljEEh-mgaK4iYcYvU_ZioQLoSr-FBS0YRQmX4SPDPb_9VS9dMoFxHANHFmKE2_MpEnyYInH6URqeebfSI75C_MS8_vC6omoWTvFXIOxGcOMED8"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#003B46] dark:text-[#D4AF37]">
              مجموعة روائس
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Rawaes Group
            </span>
          </div>
        </div>
        <div className="bg-[#D4AF37]/20 dark:bg-[#D4AF37]/10 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-[#D4AF37]/30">
          <ul className="flex items-center gap-6 text-sm font-medium">
            <li>
              <Link
                className="text-[#003B46] dark:text-white hover:text-[#D4AF37] dark:hover:text-[#D4AF37] transition-colors"
                href="#"
              >
                الرئيسية
              </Link>
            </li>
            <li>
              <Link
                className="text-[#003B46] dark:text-white hover:text-[#D4AF37] dark:hover:text-[#D4AF37] transition-colors"
                href="#"
              >
                نبذه عنا
              </Link>
            </li>
            <li className="relative group">
              <button className="flex items-center gap-1 text-[#003B46] dark:text-white hover:text-[#D4AF37] dark:hover:text-[#D4AF37] transition-colors">
                قطاعاتنا
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </li>
            <li className="relative group">
              <button className="flex items-center gap-1 text-[#003B46] dark:text-white hover:text-[#D4AF37] dark:hover:text-[#D4AF37] transition-colors">
                استثمر معنا
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </li>
            <li>
              <Link
                className="bg-[#003B46] hover:bg-[#002830] text-white px-5 py-2 rounded-full transition-colors shadow-lg shadow-[#003B46]/30"
                href="#"
              >
                تواصل معنا
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="container mx-auto px-4 mt-6">
        <div className="bg-[#003B46] rounded-2xl shadow-lg p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <h1 className="text-2xl md:text-3xl font-bold text-white relative z-10 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#D4AF37">
              <path d="M120-120v-80h720v80H120Zm70-200 128-364 126 150 148-242 168 456H190Zm140-80h304l-72-194-110 180-122-146-124 354h124Zm0-160Z" />
            </svg>
            استثمر مع روائس القمم
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">
            {/* Notifications */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                <h2 className="text-xl font-bold text-[#003B46] dark:text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#D4AF37">
                    <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
                  </svg>
                  اشعارات مجموعة روائس
                </h2>
                <button className="bg-[#003B46] hover:bg-[#002830] text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="white">
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
                  </svg>
                  تسجيل الخروج
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 border-r-4 border-[#D4AF37] text-sm text-gray-600 dark:text-gray-300">
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
              <h3 className="text-lg font-bold text-center text-[#003B46] dark:text-white mb-6">
                التواصل السريع للاستفسارات والاقتراحات
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "الإدارة القانونية" },
                  { title: "الإدارة العليا" },
                  { title: "للاقتراحات والمساعدة" },
                ].map((item, i) => (
                  <Link
                    key={i}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1"
                    href="#"
                  >
                    <span className="font-medium">{item.title}</span>
                    <img
                      alt="Whatsapp"
                      className="w-5 h-5 filter brightness-0 invert"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNrbfENjNw-_ARSeJXd39xiwokAMlxQWpiTNufXMCd_nbdTffrMEwPeY-uvpS4hZxEru0eoYDR5IKnHTvthTStvkRS9GXrywnSKLo7FQB9SU9slLxGJ4wT8wHKdyEayvCQiwyyitX-RL0cxsS6Tlv3XLHcIeGo4noTOoSDP8Re-xKx_oPvndcmwIoC5T71yVoVJpZoJskI5MBWPZX-b-vRWKQ9Lv4Dv86gflAswKoJ06SzMIJXAUkB4TlvxA9DO9k2R9Gh0fmiuQM"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
            {/* User Profile */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-8 text-center relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#003B46] to-[#D4AF37]"></div>
              <div className="w-24 h-24 mx-auto mb-4 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center p-2">
                {/* Placeholder Avatar */}
                <img
                  alt="User Avatar"
                  className="w-full h-full object-contain rounded-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFppnV0tBi5SNiwF5df8lFXxBJY4cegwDHLM6v6LB3dHhW9EkHJm-t3RCzaPoJZ6Cpx-wbE-WR99p7kvGWCk_DdEAsrov7fDdAOiA2UWMOCJYQzAKFagGpBxyDxz3rUsr1JQOH6x7obwQpSfrqKLJacLR89poBM-82ANdu6BsXvPI-RMJlzWl1r18z0C4XZyyZQa2C25KVudVnI5t1Lnq8cC7et3lzo1qyR5mPbChK7adIn69Me6H0hYVlvqMyDVaS3xVYnmq6U-U"
                />
              </div>
              <h2 className="text-xl font-bold text-[#003B46] dark:text-[#D4AF37] mb-1">
                مجموعة روائس
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-mono">
                Rawaes Group
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                    رقم العضوية
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200 font-mono">
                    {investor.membershipNo}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                    الاسم
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {investor.name}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                    رقم الجوال
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200 font-mono">
                    {investor.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Contracts */}
            <div className="bg-[#003B46] rounded-2xl shadow-lg p-6 text-white overflow-hidden relative">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
              <h3 className="text-xl font-bold text-center mb-6 relative z-10 border-b border-white/20 pb-4">
                عقودي
              </h3>
              <div className="space-y-4 relative z-10">
                {investor.contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center border border-white/10 hover:bg-white/20 transition-colors group"
                  >
                    <div>
                      <p className="text-sm text-gray-300 mb-1">
                        {contract.name}
                      </p>
                      <p className="font-bold font-mono text-[#D4AF37]">
                        {contract.number}
                      </p>
                    </div>
                    <button className="bg-[#D4AF37] hover:bg-white hover:text-[#003B46] text-[#003B46] font-bold text-sm py-1.5 px-4 rounded-lg transition-all shadow-lg shadow-black/20">
                      معاينة
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
