"use client";

import Image from "next/image";
import Link from "next/link";

export function InvestorLoginSection() {
    return (
        <section className="py-20 bg-white dark:bg-card-dark">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 bg-gray-50 dark:bg-[#1a2233] rounded-3xl p-8 lg:p-12 shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">

                    {/* Text Content - Right (RTL) */}
                    <div className="w-full lg:w-1/2 text-right">
                        <h2 className="text-3xl md:text-4xl font-bold text-secondary dark:text-white mb-6">
                            سجل دخول على صفحتك الاستثمارية
                        </h2>
                        <p className="text-secondary/80 dark:text-gray-300 text-lg mb-2 font-medium">
                            صفحة خاصة لاستعراض استثمارات المستثمرين الحاليين
                        </p>
                        <p className="text-secondary/70 dark:text-gray-400 text-md mb-8">
                            استعرض الملفات الخاصة فيك وقيم بتحميلها او تصفحها
                        </p>
                        <Link
                            href="#"
                            className="inline-block bg-[#c49b60] hover:bg-[#b08a50] text-white font-bold py-3 px-10 rounded-lg shadow-md transition-colors"
                        >
                            تسجيل دخول المستثمرين
                        </Link>
                    </div>

                    {/* Image/Dashboard - Left (RTL) */}
                    <div className="w-full lg:w-1/2 relative min-h-[300px] lg:min-h-[400px]">
                        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl transform lg:rotate-y-12 lg:-skew-y-3 transition-transform hover:transform-none duration-500">
                            <Image
                                src="/screen.jpg"
                                alt="لوحة تحكم المستثمر"
                                width={600}
                                height={400}
                                className="object-cover w-full h-full"
                            />
                            {/* Overlay gradient for better blending if needed */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
