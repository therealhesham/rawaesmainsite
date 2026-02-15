"use client";

import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BannerHeroSection } from "../components/BannerHeroSection";

export default function InstallmentsPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 transition-colors duration-300 font-[family-name:var(--font-tajawal)]">
      <Header />

      <BannerHeroSection
        bannerSrc="/wallpaper.png"
        bannerAlt="روائس القمم للتقسيط"
        logoSrc="/logo.png"
        logoAlt="روائس القمم للتقسيط"
        title="روائس القمم للتقسيط"
        description="مؤسسة تجارية رائدة في مجال الاستثمار والتمويل الشرعي وتقسيط جميع أنواع الجوالات والأجهزة الإلكترونية وبطاقات سوا."
      >
        <Link
          className="gold-gradient text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform inline-block"
          href="#apply"
        >
          تقديم طلب
        </Link>
      </BannerHeroSection>

      {/* Services */}
      <section
        className="py-20 bg-card-light dark:bg-slate-900/50"
        id="services"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">خدماتنا</h2>
            <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400">
              تقدم المؤسسة مجموعة من الخدمات المتميزة في العقارات وإدارة الأملاك
              وأعمال التكييف والأنظمة الأمنية.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-secondary p-8 rounded-xl text-center flex flex-col items-center shadow-2xl hover:-translate-y-2 transition-transform">
              <div className="mb-6 p-4 rounded-full bg-primary/10">
                <span className="material-icons text-primary text-5xl">home</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">العقار</h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                نقدم مجموعة من الخدمات الخاصة بالعقار بمختلف انواعه (شقق فلل سكن
                شعبي اراضي) من بيع وشراء وايجار وادارة املاك.
              </p>
            </div>
            <div className="bg-secondary p-8 rounded-xl text-center flex flex-col items-center shadow-2xl hover:-translate-y-2 transition-transform">
              <div className="mb-6 p-4 rounded-full bg-primary/10">
                <span className="material-icons text-primary text-5xl">
                  devices
                </span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">
                تقسيط الأجهزة
              </h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                تقسيط الأجهزة الالكترونية والجوالات بمختلف أنواعها والأجهزة
                الالكترونية بضمان للأجهزة من الوكلاء المعتمدين.
              </p>
            </div>
            <div className="bg-secondary p-8 rounded-xl text-center flex flex-col items-center shadow-2xl hover:-translate-y-2 transition-transform">
              <div className="mb-6 p-4 rounded-full bg-primary/10">
                <span className="material-icons text-primary text-5xl">
                  credit_card
                </span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">
                التمويل الشرعي
              </h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                تقدم المؤسسة التورق الشرعي من خلال بطاقات السوا وبأقساط ميسره
                مريحة وبحسب اختيار العميل.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conditions & Requirements */}
      <section className="py-20 bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-2">
              الشروط والطلبات
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 p-8 rounded-xl shadow-lg">
              <div className="flex justify-center mb-6">
                <span className="material-icons text-secondary dark:text-primary text-4xl">
                  rule
                </span>
              </div>
              <h4 className="text-xl font-bold text-primary text-center mb-6">
                شروط التمويل
              </h4>
              <ul className="space-y-4 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="material-icons text-primary text-sm mt-1">
                    check_circle
                  </span>
                  <span>
                    مشتري موظف حكومي حالة المبلغ لا يتجاوز 5000.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons text-primary text-sm mt-1">
                    check_circle
                  </span>
                  <span>
                    مشتري و كفيل موظفان حكوميان حالة المبلغ اعلى من 25000.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons text-primary text-sm mt-1">
                    check_circle
                  </span>
                  <span>كفيل موظف حكومي حالة المبلغ اقل من 25000.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 p-8 rounded-xl shadow-lg">
              <div className="flex justify-center mb-6">
                <span className="material-icons text-secondary dark:text-primary text-4xl">
                  smartphone
                </span>
              </div>
              <h4 className="text-xl font-bold text-primary text-center mb-6">
                شروط التقسيط
              </h4>
              <ul className="space-y-4 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="material-icons text-primary text-sm mt-1">
                    check_circle
                  </span>
                  <span>
                    مشتري موظف حكومي - أو يلزم وجود كفيل موظف حكومي.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons text-primary text-sm mt-1">
                    check_circle
                  </span>
                  <span>
                    لا تتجاوز قيمة الجهاز 5000 أو يلزم كفيل موظف حكومي.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons text-primary text-sm mt-1">
                    check_circle
                  </span>
                  <span>حضور المشتري والكفيل وقت التوقيع على العقد.</span>
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-800 p-8 rounded-xl shadow-lg">
              <div className="flex justify-center mb-6">
                <span className="material-icons text-secondary dark:text-primary text-4xl">
                  description
                </span>
              </div>
              <h4 className="text-xl font-bold text-primary text-center mb-6">
                المستندات المطلوبة
              </h4>
              <ul className="space-y-4 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="material-icons text-primary text-sm mt-1">
                    check_circle
                  </span>
                  <span>أصل هوية المشتري.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons text-primary text-sm mt-1">
                    check_circle
                  </span>
                  <span>أصل هوية الكفيل.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons text-primary text-sm mt-1">
                    check_circle
                  </span>
                  <span>تعريف بالراتب للمشتري والكفيل.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Apply CTA */}
      <section className="py-20 relative overflow-hidden" id="apply">
        <div className="absolute inset-0 gold-gradient opacity-10 dark:opacity-5" />
        <div className="container mx-auto px-6 relative">
          <div className="bg-secondary rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-right">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                لتقديم طلب تقسيط
              </h2>
              <p className="text-slate-300 text-lg mb-8">
                تفضل بتعبئة البيانات من هنا وسوف نتواصل معك في أقرب وقت ممكن
              </p>
              <Link
                href="/#contact"
                className="gold-gradient text-white px-12 py-4 rounded-xl font-bold text-xl flex items-center gap-3 mx-auto md:mx-0 w-fit shadow-lg hover:shadow-primary/40 transition-all active:scale-95"
              >
                <span>تقديم طلب تقسيط</span>
                <span className="material-icons">touch_app</span>
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <span className="material-icons text-[160px] text-primary relative">
                  contact_page
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
