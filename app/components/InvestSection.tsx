"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function PlantInView() {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) setInView(true);
            },
            { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="relative w-full max-w-[260px] lg:max-w-[300px] aspect-[3/4]">
            <div
                className={`absolute inset-0 transition-none ${inView ? "plant-grow-run" : "plant-grow-wait"}`}
            >
                <Image
                    src="/plant.avif"
                    alt="نبتة"
                    fill
                    className="object-contain object-bottom"
                    sizes="(max-width: 1024px) 280px, 320px"
                />
            </div>
        </div>
    );
}

export function InvestSection() {
    return (
        <section className="pt-20 pb-0 relative overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: "url('/wallpaper.png')" }}
                aria-hidden
            />
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes plant-grow-kf {
          0% { opacity: 0; transform: translateY(70%) scale(0.5); }
          65% { opacity: 1; transform: translateY(-3%) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .plant-grow-run {
          animation: plant-grow-kf 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .plant-grow-wait {
          opacity: 0;
          transform: translateY(70%) scale(0.5);
        }
      `}} />
            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                <div className="self-center">
                    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-card-dark dark:to-background-dark p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-3xl font-bold text-secondary dark:text-white mb-4">
                            استثمر مع مجموعة روائس
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-md leading-loose mb-6">
                            نحن نشجع العملاء على الاستثمار بطريقة مستدامة وذكية. ونوفر لهم
                            الأدوات والمعرفة لاتخاذ القرارات الصائبة. سواء كان العميل يبحث عن
                            استثمار مبلغ صغير أو كبير، فإننا نقوم بتخصيص الوقت والجهود لتطوير
                            أفضل استراتيجية استثمارية وتحقيق أعلى عوائد.
                        </p>
                        <Link
                            className="bg-primary hover:bg-[#c49b60] text-white px-8 py-2.5 rounded-lg font-bold text-md shadow-md transition-all transform hover:scale-105 inline-block"
                            href="#"
                        >
                            ابدأ الآن
                        </Link>
                    </div>
                </div>
                <div className="flex justify-center self-end">
                    <PlantInView />
                </div>
            </div>
        </section>
    );
}
