import Image from "next/image";

export function ChairmanQuote() {
    return (
        <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-l from-[#f5efe6] via-[#eee6d8] to-[#e8dece] dark:from-[#1a1510] dark:via-[#1e1a14] dark:to-[#231e16]" />
            <div className="container mx-auto px-4 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary dark:text-primary text-center mb-12">
                    كلمة رئيس مجلس الإدارة
                </h2>

                <div className="flex flex-col lg:flex-row items-center gap-10 max-w-6xl mx-auto">
                    {/* Chairman photo + name — right side in RTL */}
                    <div className="flex flex-col items-center shrink-0">
                        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/30">
                            <Image
                                src="/ceo.avif"
                                alt="رئيس مجلس الإدارة"
                                fill
                                className="object-cover object-top"
                                sizes="(max-width: 768px) 192px, 224px"
                            />
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-primary font-bold text-lg">المكرم / د. عبدالرحمن حمدان العوفي</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">رئيس مجلس الإدارة</p>
                        </div>
                    </div>

                    {/* Quote — left side in RTL */}
                    <div className="flex-1 relative">
                        {/* Opening quote mark */}
                        <span className="absolute -top-6 -right-2 text-primary/20 text-[120px] leading-none font-serif select-none pointer-events-none" aria-hidden>
                            ❝
                        </span>

                        <div className="bg-white/60 dark:bg-card-dark/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-lg border border-primary/10 dark:border-gray-700">
                            <p className="text-gray-700 dark:text-gray-300 text-md leading-[2.2] text-justify">
                                نتطلع دائمًا لتحقيق النجاح والابتكار في مجموعتنا. وهذا لا يكون إلا بفضل
                                تفانيكم وتفردكم في قيادة أقسامنا بنجاح إن جهودكم المستمرة في تطوير
                                العمليات وتحقيق الأهداف تجعلنا نفخر بكم كقادة ملهمين.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 text-md leading-[2.2] text-justify mt-4">
                                تعد كل من قطاعات التآجير السيارات، والضيافة، واستقدام العمالة أعمدة
                                حقيقية في نجاح مجموعتنا. وتقديرنا لجهودكم في تعزيز هذه القطاعات لا
                                يمكن وصفه بالكلمات. إن انخراطكم المتفاني والمبدع المشترك في تحقيق
                                التميز يجعلنا نثق تمام الثقة في قدرتكم على تحقيق الأهداف المستقبلية بنجاح.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 text-md leading-[2.2] text-justify mt-4">
                                نحن نفخر بأنكم جزء من فريقنا، ونحن واثقون من قدرتكم على تحقيق المزيد
                                من النجاحات والإنجازات. نحن متحمسون للعمل معًا في هذه الرحلة المثمرة نحو
                                تحقيق أهدافنا المشتركة.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 text-md leading-[2.2] text-justify mt-4">
                                شكرًا لكم على كل ماتقدمونه من جهود. ونتطلع إلى مستقبل مشرق معًا.
                                شكرًا لتفانيكم وجهودكم المتواصلة.
                            </p>
                        </div>

                        {/* Closing quote mark */}
                        <span className="absolute -bottom-10 -left-2 text-primary/20 text-[120px] leading-none font-serif select-none pointer-events-none" aria-hidden>
                            ❞
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
