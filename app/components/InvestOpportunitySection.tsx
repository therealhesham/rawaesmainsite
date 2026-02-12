"use client";

import Link from "next/link";

export function InvestOpportunitySection() {
    return (
        <section className="py-20 bg-secondary dark:bg-[#001f2b]">
            <div className="container mx-auto px-4 flex justify-center">
                <div className="bg-[#dae4e8] dark:bg-card-dark max-w-4xl w-full rounded-3xl p-10 md:p-16 text-center shadow-xl">
                    <p className="text-[#002a3a] dark:text-gray-200 text-lg md:text-xl leading-loose font-medium mb-10">
                        في عالم يتسارع التطور والتحول، يأتي وقت الاستفادة من الفرص
                        الاستثمارية المبتكرة. نحن في &quot;روائس&quot; نعمل على توفير بيئة
                        استثمارية فريدة تمزج بين الأمان والابتكار، تتيح لك تحقيق أهدافك
                        المالية بثقة وسهولة.
                    </p>
                    <Link
                        href="#"
                        className="inline-block bg-gradient-to-r from-[#d4af79] to-[#c49b60] hover:from-[#c49b60] hover:to-[#b08a50] text-white font-bold text-lg py-3 px-12 rounded-lg shadow-md transition-all transform hover:scale-105"
                    >
                        ابدأ الآن
                    </Link>
                </div>
            </div>
        </section>
    );
}
