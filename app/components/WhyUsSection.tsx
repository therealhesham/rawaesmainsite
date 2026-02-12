"use client";

import { motion } from "framer-motion";

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
        <section className="flex flex-col lg:flex-row h-auto min-h-[500px] overflow-hidden">

            {/* Left Side (White) - List of Reasons */}
            <motion.div
                className="w-full lg:w-1/2 bg-white dark:bg-card-dark p-12 md:p-20 flex flex-col justify-center"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <div className="space-y-12">
                    {reasons.map((reason, index) => (
                        <motion.div
                            key={index}
                            className="text-right"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + (index * 0.2), duration: 0.6 }}
                            whileHover={{ x: -10 }}
                        >
                            <h3 className="text-secondary dark:text-primary font-bold text-xl mb-2">
                                {reason.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-md mb-2">
                                {reason.description}
                            </p>
                            <button className="text-[#c49b60] text-sm font-bold hover:underline">
                                اقرأ المزيد
                            </button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
            {/* Right Side (Dark Blue) - Title & Description */}
            <motion.div
                className="w-full lg:w-1/2 bg-[#001f2b] text-white p-12 md:p-20 flex flex-col justify-center items-start text-right"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <motion.h2
                    className="text-4xl md:text-5xl font-bold mb-6 w-full"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    لماذا نحن؟
                </motion.h2>
                <motion.p
                    className="text-gray-300 text-lg leading-loose mb-10 max-w-lg"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    نحن مجموعة روائس للاستثمار، ونحن ملتزمون بتفير فرص استثماريه رائده لعملائنا. نحن نعمل بجد لتحقيق أهدافكم الماليه، فيما يتعلق بالاستثمار في المشاريع الجديده والمبتكره.
                </motion.p>
                <motion.button
                    className="bg-[#c49b60] hover:bg-[#b08a50] text-white px-8 py-3 rounded-lg font-bold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    اقرأ المزيد
                </motion.button>
            </motion.div>

        </section>
    );
}

