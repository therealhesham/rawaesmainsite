"use client";

const reasons = [
    {
        title: "فريق محترف",
        description: "...في روائس، يعتبر فريقنا هو الركيزة الأساسية لنجاحنا ونجاح",
    },
    {
        title: "فرص استثمار متنوعة",
        description: "...تقدم مجموعة واسعة من فرص الاستثمار لتلبية احتياجات",
    },
    {
        title: "تكنولوجيا حديثة",
        description: "...نستخدم أحدث التقنيات في عملياتنا لضمان سلاسة تجربة",
    },
];

export function WhyUsSection() {
    return (
        <section className="flex flex-col lg:flex-row h-auto min-h-[500px]">

            {/* Left Side (White) - List of Reasons */}
            <div className="w-full lg:w-1/2 bg-white dark:bg-card-dark p-12 md:p-20 flex flex-col justify-center">
                <div className="space-y-12">
                    {reasons.map((reason, index) => (
                        <div key={index} className="text-right">
                            <h3 className="text-secondary dark:text-primary font-bold text-xl mb-2">
                                {reason.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-md mb-2">
                                {reason.description}
                            </p>
                            <button className="text-[#c49b60] text-sm font-bold hover:underline">
                                اقرأ المزيد
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            {/* Right Side (Dark Blue) - Title & Description */}
            <div className="w-full lg:w-1/2 bg-[#001f2b] text-white p-12 md:p-20 flex flex-col justify-center items-start text-right">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 w-full">لماذا نحن؟</h2>
                <p className="text-gray-300 text-lg leading-loose mb-10 max-w-lg">
                    نحن مجموعة روائس للاستثمار، ونحن ملتزمون بتفير فرص استثماريه رائده لعملائنا. نحن نعمل بجد لتحقيق أهدافكم الماليه، فيما يتعلق بالاستثمار في المشاريع الجديده والمبتكره.
                </p>
                <button className="bg-[#c49b60] hover:bg-[#b08a50] text-white px-8 py-3 rounded-lg font-bold transition-colors">
                    اقرأ المزيد
                </button>
            </div>

        </section>
    );
}
