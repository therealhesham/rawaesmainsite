import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-secondary text-white border-t-8 border-primary dark:border-primary/80">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="w-full md:w-1/3">
            <ul className="space-y-2 text-right">
              <li>
                <Link
                  className="text-primary hover:text-white transition-colors text-sm font-bold underline decoration-primary underline-offset-4"
                  href="/"
                >
                  انتقل الى الصفحات الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-300 hover:text-white transition-colors text-xs"
                  href="#"
                >
                  قطاع روائس لتأجير السيارات
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-300 hover:text-white transition-colors text-xs"
                  href="#"
                >
                  قطاع روائس للاستقدام
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-300 hover:text-white transition-colors text-xs"
                  href="#"
                >
                  قطاع روائس للضيافة
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-300 hover:text-white transition-colors text-xs"
                  href="#"
                >
                  شركة روائس للاستثمار
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-300 hover:text-white transition-colors text-xs"
                  href="#"
                >
                  التوظيف
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-300 hover:text-white transition-colors text-xs"
                  href="#"
                >
                  المدونة
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/3 flex flex-col items-end text-right">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-right">
                <h3 className="font-bold text-lg">مجموعة روائس</h3>
                <p className="text-primary text-sm font-bold dir-ltr">
                  9200 10 356
                </p>
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="material-icons text-secondary text-2xl">
                  grid_view
                </span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed max-w-xs">
              شركة استثمارية متخصصة في توفير حلول الاستثمار المبتكرة والمستدامة
              لمستثمرينا الكرام. يقع مقرنا في المملكة العربية السعودية، منطقة
              المدينة المنورة ونتميز بفريق من الخبراء ذوي الخبرة في مجالات تجارية
              مختلفة.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-primary py-3 text-center">
        <p className="text-secondary text-xs font-bold">
          جميع الحقوق محفوظة لدى مجموعة روائس
        </p>
      </div>
    </footer>
  );
}
