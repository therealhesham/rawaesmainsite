"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#0A191E] text-[#00303D] dark:text-gray-200 transition-colors duration-300 font-body">
            <Header />

            <header className="relative overflow-hidden bg-white dark:bg-[#0A191E] pt-32 pb-32">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-12 relative z-10">
                    <div className="order-2 md:order-1 flex justify-center">
                        <div className="relative w-72 h-72 md:w-96 md:h-96">
                            <img
                                alt="Rawaes Group Large Logo"
                                src="/logo.png"
                                // src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi3a8qheTWPEalz-oyn_JwLjy3GgAQVWQ263SqMAuJx8z06vEmgxbkutTI-ipNTQQqeJh3t4TlJIsgPeBjLMv9rO6Jm4IhX1MXklVnqPTp_uKBAKXS9wJOEZbHYzfp5dC7bJQ5QVj0oWPFPggFyM7B1FJsxdJk_ZzYQ3tdS16W4dgVC98oyPVXjcy4Pp4dk_-T-bkKyaYhimL8XzeQ6_oB5jLdnWYjFZDokXGJBFUGrEjHdiBFI9xmXaUjI23sulqQTXevQZT-jRE"
                                // fill
                                className="object-contain"
                            />
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                            </div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 text-right space-y-6">
                        <h1 className="text-5xl md:text-7xl font-bold text-[#00303D] dark:text-white leading-tight">كيان استثماري</h1>
                        <p className="text-2xl md:text-3xl text-[#D4AF37] font-medium leading-relaxed">
                            كيان استثماري مكون من عدة شركات في مجالات وقطاعات مختلفة.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-[#FDFCF7] dark:bg-gray-900/50" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0, 0 60%)" }}></div>
            </header>

            <section className="py-20 bg-[#FDFCF7] dark:bg-[#0A191E]">
                <div className="max-w-6xl mx-auto px-6 space-y-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[#D4AF37] mb-4">عن مجموعة روائس</h2>
                        <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-r-8 border-[#D4AF37] transform hover:-translate-y-1 transition-transform">
                            <p className="text-xl leading-loose text-[#00303D] dark:text-gray-300">
                                نحن مجموعة مبتكرة لتقديم الحلول المتطورة في العصر الرقمي، تقع أنشطتنا التجارية في مختلف مدن المملكة وهي في توسع متسارع حسب استراتيجيتنا حيث لدينا فروع متعددة في المدينة المنورة وينبع وتتمركز الإدارة الرئيسية في المدينة المنورة، ونسعى للتوسع في جميع مدن المملكة.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-r-8 border-[#D4AF37] transform hover:-translate-y-1 transition-transform">
                            <p className="text-xl leading-loose text-[#00303D] dark:text-gray-300">
                                مع التركيز على رضاكم فإننا نقدم خدمات تلبي احتياجاتكم، تتنوع مجالات نشاطاتنا التجارية بين قطاعات الضيافة وتشغيل الفنادق وتأجير السيارات وخدمات الاستقدام والاستثمارات العقارية والأنشطة التجارية الأخرى.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-r-8 border-[#D4AF37] transform hover:-translate-y-1 transition-transform">
                            <p className="text-xl leading-loose text-[#00303D] dark:text-gray-300">
                                يجمع فريقنا من المهنيين المهرة بين الخبرة والإبداع لتحقيق نتائج ملموسة تتجاوز توقعاتكم، ومن خلال التزامنا بالتحسين المستمر والتقدم التكنولوجي، فإننا نسعى جاهدين لتمكين الشركات والأفراد بالأدوات التي يحتاجونها للنجاح في عالم متسارع التطور.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 relative overflow-hidden bg-white dark:bg-gray-900">
                <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none">
                    <img
                        alt="Cityscape background"
                        src="/wallpaper.png"
                        className="object-cover"
                    />
                </div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center">
                            <h3 className="text-3xl font-bold text-[#D4AF37] mb-6">رؤيتنا</h3>
                            <p className="text-lg leading-relaxed text-[#00303D] dark:text-gray-300">
                                أن نكون قوة رائدة في مختلف القطاعات، ونقود التغيير الإيجابي، ونخلق تأثيراً دائماً في كل مجتمع نخدمه.
                            </p>
                        </div>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center">
                            <h3 className="text-3xl font-bold text-[#D4AF37] mb-6">رسالتنا</h3>
                            <p className="text-lg leading-relaxed text-[#00303D] dark:text-gray-300">
                                التميز في تقديم الخدمات من خلال العمل الاحترافي المبني على أحدث الأساليب العلمية والتوسع والنمو في الأسواق المحلية والعالمية وتحقيق الاستدامة والكفاءة العالية.
                            </p>
                        </div>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center">
                            <h3 className="text-3xl font-bold text-[#D4AF37] mb-6">مبادئنا</h3>
                            <p className="text-lg leading-relaxed text-[#00303D] dark:text-gray-300">
                                التمسك بالصدق والأمانة والسلوك الأخلاقي في جميع التعاملات والسعي لتحقيق الجودة الاستثنائية والتحسين المستمر وتقديم أفضل النتائج الممكنة.
                            </p>
                        </div>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center">
                            <h3 className="text-3xl font-bold text-[#D4AF37] mb-6">قيمنا</h3>
                            <p className="text-lg leading-relaxed text-[#00303D] dark:text-gray-300">
                                وضع العملاء والمستثمرين في قلب كل ما نقوم به وقيادة التحسين المستمر واحتضان الأفكار الجديدة والسعي لتحقيق أعلى معايير الجودة والأداء ونسترشد بالنزاهة والعدالة واتخاذ القرارات المسؤولة.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-[#FDFCF7] dark:bg-[#0A191E] overflow-hidden">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-[#D4AF37] mb-4">رحلتنا</h2>
                        <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
                    </div>
                    <div className="relative">
                        <div className="space-y-24">
                            <div className="flex flex-col md:flex-row items-center gap-12 group">
                                <div className="w-full md:w-3/4 order-2 md:order-1 text-right">
                                    <p className="text-xl leading-loose text-[#00303D] dark:text-gray-300 group-hover:text-[#D4AF37] transition-colors">
                                        ذات يوم، في الفترة الممتدة من عام 1999 إلى عام 2004م، انطلقت قصة مثيرة من المشاريع الريادية. لقد كان وقت الحركة المستمرة، حيث تم الشروع في العديد من الأنشطة التجارية، مع فتح الأبواب وإغلاقها في تتابع سريع، وكل منها يمثل فرصاً وتحديات جديدة.
                                    </p>
                                </div>
                                <div className="w-32 h-32 flex-shrink-0 bg-white dark:bg-gray-800 border-4 border-[#D4AF37] rounded-full flex flex-col items-center justify-center text-[#00303D] dark:text-white shadow-xl order-1 md:order-2 z-10 transition-transform group-hover:scale-110">
                                    <span className="text-lg font-bold">1999</span>
                                    <div className="w-8 h-px bg-[#D4AF37] my-1"></div>
                                    <span className="text-lg font-bold">2004</span>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-12 group">
                                <div className="w-full md:w-3/4 order-2 md:order-1 text-right">
                                    <p className="text-xl leading-loose text-[#00303D] dark:text-gray-300 group-hover:text-[#D4AF37] transition-colors">
                                        ثم في الفترة من 2005 إلى 2010م، ظهرت شراكة مميزة مع مؤسسة قمم العطاء الموقرة. لقد أضفنا معاً طرقاً للتعاون، مستفيدين من نقاط قوتنا الجماعية لإحداث تأثير دائم وإحداث تغيير إيجابي.
                                    </p>
                                </div>
                                <div className="w-32 h-32 flex-shrink-0 bg-[#00303D] dark:bg-[#D4AF37] border-4 border-[#D4AF37] rounded-full flex flex-col items-center justify-center text-white shadow-xl order-1 md:order-2 z-10 transition-transform group-hover:scale-110">
                                    <span className="text-lg font-bold">2005</span>
                                    <div className="w-8 h-px bg-white/30 my-1"></div>
                                    <span className="text-lg font-bold">2010</span>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-12 group">
                                <div className="w-full md:w-3/4 order-2 md:order-1 text-right">
                                    <p className="text-xl leading-loose text-[#00303D] dark:text-gray-300 group-hover:text-[#D4AF37] transition-colors">
                                        ومع تقدم القصة في الأعوام من 2011 إلى 2014م، انطلق فصل جديد، وكشف عن تحالف كبير مع شركة إعمار الاستثمارية المرموقة. وقد دفعتنا هذه الشراكة إلى آفاق جديدة، حيث غامرنا في عالم العقارات والاستثمار، تاركين بصمة لا تمحى على هذه الصناعة.
                                    </p>
                                </div>
                                <div className="w-32 h-32 flex-shrink-0 bg-white dark:bg-gray-800 border-4 border-[#D4AF37] rounded-full flex flex-col items-center justify-center text-[#00303D] dark:text-white shadow-xl order-1 md:order-2 z-10 transition-transform group-hover:scale-110">
                                    <span className="text-lg font-bold">2011</span>
                                    <div className="w-8 h-px bg-[#D4AF37] my-1"></div>
                                    <span className="text-lg font-bold">2014</span>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-12 group">
                                <div className="w-full md:w-3/4 order-2 md:order-1 text-right">
                                    <p className="text-xl leading-loose text-[#00303D] dark:text-gray-300 group-hover:text-[#D4AF37] transition-colors">
                                        لكن القصة لم تنته عند هذا الحد. ومنذ عام 2015 وحتى يومنا هذا، سيطرت روح الاستقلال والابتكار حيث رسمنا طريقنا الخاص تحت راية مجموعة روائس وباسم ينسجم مع رؤيتنا، غامرنا في مجالات خدمية متنوعة، ولم نترك أي جهد في سعينا لإحداث تغيير ملموس في العالم.
                                    </p>
                                </div>
                                <div className="w-32 h-32 flex-shrink-0 bg-[#00303D] dark:bg-[#D4AF37] border-4 border-[#D4AF37] rounded-full flex flex-col items-center justify-center text-white shadow-xl order-1 md:order-2 z-10 transition-transform group-hover:scale-110">
                                    <span className="text-lg font-bold">2015</span>
                                    <div className="w-8 h-px bg-white/30 my-1"></div>
                                    <span className="text-lg font-bold">2023</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 bottom-0 right-[4.1rem] hidden md:block pointer-events-none">
                            <svg className="h-full" height="100%" width="100">
                                <path d="M50 0 C 120 200, -20 400, 50 600 C 120 800, -20 1000, 50 1200" fill="transparent" opacity="0.4" stroke="#D4AF37" strokeDasharray="10 10" strokeWidth="4"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[#D4AF37] mb-4">حفل افتتاح مقرنا الرئيسي</h2>
                        <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
                    </div>
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl mb-12 border-4 border-white dark:border-gray-800">
                        <video
                            controls
                            className="w-full h-full object-cover"
                            poster="/aboutus/aboutus1.jpg"
                        >
                            <source src="https://recruitmentrawaes.sgp1.cdn.digitaloceanspaces.com/%D8%B1%D9%88%D8%A7%D8%A6%D8%B3%20%D8%A7%D9%84%D9%82%D9%85%D9%85.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-4">
                            <div className="relative h-48 w-full group">
                                <img
                                    alt="Event photo 1"
                                    src="/aboutus/aboutus2.jpg"
                                    className="w-full h-full object-cover rounded-xl shadow hover:scale-[1.02] transition-transform"
                                />
                            </div>
                            <div className="relative h-72 w-full group">
                                <img
                                    alt="Event photo 2"
                                    src="/aboutus/aboutus3.jpg"
                                    className="w-full h-full object-cover rounded-xl shadow hover:scale-[1.02] transition-transform"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="relative h-72 w-full group">
                                <img
                                    alt="Event photo 3"
                                    src="/aboutus/aboutus4.jpg"
                                    className="w-full h-full object-cover rounded-xl shadow hover:scale-[1.02] transition-transform"
                                />
                            </div>
                            <div className="relative h-48 w-full group">
                                <img
                                    alt="Event photo 4"
                                    src="/aboutus/aboutus5.jpg"
                                    className="w-full h-full object-cover rounded-xl shadow hover:scale-[1.02] transition-transform"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="relative h-48 w-full group">
                                <img
                                    alt="Event photo 5"
                                    src="/aboutus/aboutus6.jpg"
                                    className="w-full h-full object-cover rounded-xl shadow hover:scale-[1.02] transition-transform"
                                />
                            </div>
                            <div className="relative h-72 w-full group">
                                <img
                                    alt="Event photo 6"
                                    src="/aboutus/aboutus7.jpg"
                                    className="w-full h-full object-cover rounded-xl shadow hover:scale-[1.02] transition-transform"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="relative h-72 w-full group">
                                <img
                                    alt="Event photo 7"
                                    src="/aboutus/aboutus9.jpg"
                                    className="w-full h-full object-cover rounded-xl shadow hover:scale-[1.02] transition-transform"
                                />
                            </div>
                            <div className="relative h-48 w-full group">
                                <img
                                    alt="Event photo 8"
                                    src="/aboutus/aboutus10.jpg"
                                    className="w-full h-full object-cover rounded-xl shadow hover:scale-[1.02] transition-transform"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden min-h-screen flex items-center justify-center py-24 bg-[#FDFDFC] dark:bg-[#0A141A]">
                {/* Diagonal Background Top */}
                <div
                    className="absolute top-0 left-0 w-full h-full bg-[#D1D9DB] dark:bg-[#1a2a33] z-0"
                    style={{ clipPath: "polygon(0 0, 100% 0, 100% 30%, 0 15%)" }}
                ></div>

                {/* Diagonal Background Bottom */}
                <div
                    className="absolute bottom-0 left-0 w-full h-full bg-[#F5EFE1] dark:bg-[#1a160d] z-0"
                    style={{ clipPath: "polygon(0 85%, 100% 70%, 100% 100%, 0 100%)" }}
                ></div>

                <div className="container mx-auto px-6 md:px-12 lg:px-24 z-10 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5 flex justify-center lg:justify-end order-2 lg:order-1">
                            <div className="relative w-72 h-72 md:w-96 md:h-96 target-icon drop-shadow-[0_10px_15px_rgba(0,48,63,0.1)]">
                                <div className="absolute inset-0 border-[35px] border-[#00303F] dark:border-teal-900 rounded-full flex items-center justify-center">
                                    <div className="w-full h-full border-[35px] border-[#D4AF37] rounded-full flex items-center justify-center">
                                        <div className="w-full h-full border-[35px] border-[#00303F] dark:border-teal-900 rounded-full flex items-center justify-center">
                                            <div className="w-24 h-24 bg-[#D4AF37] rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-7 space-y-8 order-1 lg:order-2 text-right">
                            <div>
                                <h2 className="text-5xl lg:text-7xl font-extrabold text-[#D4AF37] mb-6 tracking-tight">هدفنا</h2>
                                <div className="space-y-6 max-w-2xl ml-auto">
                                    <p className="text-lg lg:text-xl leading-relaxed font-medium text-[#00303F]/90 dark:text-gray-300">
                                        تقديم خدمات استثنائية وتعزيز الابتكار وتحسين عروضنا باستمرار للبقاء في المقدمة، والتكيف مع الاتجاهات والتقنيات لتحقيق النمو المستدام والربحية مع الحفاظ على الممارسات التجارية الأخلاقية.
                                    </p>
                                    <p className="text-lg lg:text-xl leading-relaxed font-medium text-[#00303F]/90 dark:text-gray-300">
                                        مع تهيئة بيئة عمل إيجابية وشاملة تعزز التعاون والنمو الشخصي وإحداث تأثير إيجابي على المجتمع والمساهمة مع المجتمعات التي نعمل فيها.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end pt-8">
                                <div className="flex items-end space-x-2 space-x-reverse mb-3 h-20">
                                    <div className="w-4 bg-[#00303F] dark:bg-teal-700 h-2/5 rounded-t-sm"></div>
                                    <div className="w-4 bg-[#00303F] dark:bg-teal-700 h-3/5 rounded-t-sm"></div>
                                    <div className="w-4 bg-[#00303F] dark:bg-teal-700 h-full rounded-t-sm"></div>
                                </div>
                                <div className="w-48 h-1 bg-[#D4AF37] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
