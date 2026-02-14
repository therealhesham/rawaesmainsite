"use client";

import React from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ContactSection } from "../components/ContactSection";

export default function InvestmentPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light transition-colors duration-300 font-[family-name:var(--font-cairo)]">
            <Header />

            <main>
                <style jsx global>{`
          .sepia-filter {
            filter: sepia(0.6) contrast(1.1);
          }
          .skyline-footer {
            background-image: url(https://lh3.googleusercontent.com/aida-public/AB6AXuDPhqGAvQjd7MKBvalxiL4rN0VUnD7DmD0vXG0ypN9sfkN27Icutt_lwkGE_th4u6mZoM1SooWPIoT4YJXIn0ympS8P28bidLG4MKwapAQMakKNIM5EPz1a30QHdlJGbPa-zZhyUXNd9a4fGla-0mHAcaqly4gVyTn3XhrC-mtlp77ABpyjmgJDXSrBS8hD5OQYSzZr64VYaG5bEwCvzGA2dL_d_pqA72PBhGoLLqf8VJa53GuszrhIx1WpvvTyqMQA4Aekq00nOmc);
            background-size: contain;
            background-position: bottom;
            background-repeat: repeat-x;
          }
        `}</style>

                <section className="w-full h-[50vh] relative">
                    <img
                        src="/wallpaper.png"
                        alt="Rawaes Wallpaper"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                </section>

                <section className="py-20 px-6" id="hero">
                    <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col items-center justify-center bg-transparent">
                            {/* //no color background */}
                            <img
                                alt="روائس للاستثمار"
                                className="w-64 h-64 object-contain   "
                                src="/investmentlogo.png"
                            />

                        </div>
                        <div className="space-y-6">
                            <h2 className="text-4xl font-bold text-primary leading-tight">
                                روائس للاستثمار
                            </h2>
                            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                نوفر خدمات استثمارية شاملة تشمل إدارة المحافظ الاستثمارية،
                                وتقييم الفرص الاستثمارية، وتقديم الاستشارات المالية. نتميز بفريق
                                من الخبراء المتخصصين في مجالات استثمارية متعددة، يعملون بإتقان
                                على تحقيق أهداف العملاء وتعزيز أداء استثماراتهم.
                            </p>
                            <div className="flex gap-4 pt-4">

                            </div>
                        </div>
                    </div>
                </section>

                <section
                    className="py-20 bg-slate-50 dark:bg-brand-teal/20 relative overflow-hidden"
                    id="services"
                >
                    <div className="container mx-auto px-6 relative z-10">
                        <h2 className="text-4xl font-bold text-center text-primary mb-16">
                            خدماتنا
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-brand-teal-light rounded-xl overflow-hidden shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-slate-800">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        alt="Property Management"
                                        className="w-full h-full object-cover sepia-filter"
                                        src="/bernard.avif"
                                    />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-brand-teal dark:text-primary mb-4">
                                        ادارة العقارات
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                        نضمن إدارة عقارية فعالة وفعالة لضمان قيمة عالية لكل عميل.
                                        نحن نهتم بممتلكاتك ونعمل جاهدين على تلبية احتياجاتك
                                        ومتطلباتك. تواصل معنا اليوم لتجد خدمات إدارة العقارات التي
                                        تلبي توقعاتك.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-brand-teal-light rounded-xl overflow-hidden shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-slate-800">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        alt="Real Estate Development"
                                        className="w-full h-full object-cover sepia-filter"
                                        src="paulina.avif"
                                    />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-brand-teal dark:text-primary mb-4">
                                        التطوير العقاري
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                        نحن نتعهد بتقديم خدمات تطوير العقارات بروح الابتكار والاهتمام
                                        بأدق التفاصيل. فريق المستشارين العقاريين لدينا الذي يمتلك
                                        خبرة واسعة في صناعة العقارات والإدارة يعمل بجد لإيجاد فرص
                                        استثمارية ومشاريع تناسب مختلف احتياجات عملائنا.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-brand-teal-light rounded-xl overflow-hidden shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-slate-100 dark:border-slate-800">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        alt="Real Estate Investment"
                                        className="w-full h-full object-cover sepia-filter"
                                        src="/hideobara.avif"
                                    />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-brand-teal dark:text-primary mb-4">
                                        الاستثمار العقاري
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                        ندرك تماماً أن الاستثمار في القطاع العقاري لا يمثل فقط خطوة
                                        استثمارية بل يمثل جزءاً حيوياً من رحلة النجاح المالي. لهذا
                                        السبب، أسسنا فريقاً متخصصاً مكرساً لدراسة فرص الاستثمار
                                        العقاري بكل تفصيل ودقة.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="h-[500px] flex flex-col md:flex-row" id="values">
                    <div className="flex-1  bg-[#022530] text-white p-12 flex flex-col justify-between relative group overflow-hidden">
                        <div className="z-10 relative">
                            <h3 className="text-3xl font-bold text-white mb-6">تفاؤل</h3>
                            <p className="text-slate-300 text-white leading-relaxed max-w-sm">
                                نحن هنا لنتخذ خطوات جريئة. ننظر إلى المستقبل بعيون مشرقة.
                                ونجمع قوانا لبناء واقع ملهم يتحدى المألوف. بكل تفاؤل وإصرار، نضع
                                بصمتنا في بناء غد يتسم بالتفرد والتميز.
                            </p>
                        </div>
                        <div className="absolute inset-0  transition-opacity duration-500">
                            <img
                                alt="Construction detail"
                                className="w-full h-full object-cover"
                                src="/investment/investment1.png"
                            />
                        </div>
                        <div className="z-10 mt-12 self-start">
                            <div className="w-12 h-1 bg-primary"></div>
                        </div>
                    </div>
                    <div className="flex-1  bg-primary text-brand-teal p-12 flex flex-col justify-between relative group overflow-hidden">
                        <div className="z-10 relative">
                            <h3 className="text-3xl font-bold mb-6">إلهام</h3>
                            <p className="text-brand-teal/80 leading-relaxed max-w-sm">
                                نضع جميع طاقاتنا في تحقيق رؤيتنا. ونعتبر كل تحد جديد فرصة
                                للتطور والابتكار. إن اسمنا ليس مجرد علامة تجارية، بل هو رمز
                                للإبداع والاجتهاد. نحن نسعى لفرض اسمنا بفخر في سماء الإبداع، حيث
                                يتلاقى الأصالة بالحداثة وينسجم التقليد مع التطور.
                            </p>
                        </div>
                        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                            <img
                                alt="Modern Architecture"
                                className="w-full h-full object-cover"
                                src="/investment/investment2.png"
                            />
                        </div>
                        <div className="z-10 mt-12 self-start">
                            <div className="w-12 h-1 bg-brand-teal"></div>
                        </div>
                    </div>
                    <div className="flex-1  bg-[#003749] text-white p-12 flex flex-col justify-between relative group overflow-hidden">
                        <div className="z-10 relative">
                            <h3 className="text-3xl font-bold mb-6">ابتكارية</h3>
                            <p className="text-white leading-relaxed max-w-sm">
                                من خلال تفعيل تلك الرؤية، نجحت الشركة في بناء سمعة قوية
                                واستقطاب انتباه العملاء والشركاء على حد سواء. واستناداً إلى
                                أسسها القوية اتخذت الشركة من التكنولوجيا والابتكار جزءاً أساسياً
                                من استراتيجيتها، مما ساهم في تسهيل تجربة العملاء وتوفير حلول
                                فعالة لاحتياجاتهم المتنوعة في مجال العقارات.
                            </p>
                        </div>
                        <div className="absolute inset-0 transition-opacity duration-500">
                            <img
                                alt="Innovative building"
                                className="w-full h-full object-cover"
                                src="/investment/investment3.png"
                            />
                        </div>
                        <div className="z-10 mt-12 self-start">
                            <div className="w-12 h-1 bg-primary"></div>
                        </div>
                    </div>
                </section>

                <ContactSection />
            </main>

            <Footer />
        </div>
    );
}
