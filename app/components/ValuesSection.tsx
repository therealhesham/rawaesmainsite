"use client";

import Link from "next/link";
import { InvestSection } from "./InvestSection";
import { motion } from "framer-motion";

const values = [
  {
    icon: "/customer.png",
    title: "رضى العميل",
    desc: "نحن ملتزمون بتقديم أعلى مستويات الجودة والخدمة لعملائنا لضمان رضاهم التام.",
    rotate: "",
  },
  {
    icon: "quality.png",
    title: "الجودة",
    desc: "نحن نضمن لك أعلى مستويات الجودة في كل منتج نقدمه، لأن رضاك يأتي في المقام الأول.",
    rotate: "",
  },
  {
    icon: "creativity.png",
    title: "الابتكار",
    desc: "نحن نسعى لتطوير منتجات وخدمات جديدة تلبي التحديات الحالية والمستقبلية.",
    rotate: "",
  },
  {
    icon: "speed.png",
    title: "سرعة الإنجاز",
    desc: "سرعة التنفيذ هي علامة تميز شركتنا، حيث نسعى دائماً لإيصال حلولنا بفاعلية وسرعة لتلبية احتياجاتك.",
    rotate: "",
  },
];

export function ValuesCards() {
  return (
    <div className="container mx-auto px-4 relative z-10 mb-16">
      <div className="flex items-stretch justify-center">
        <motion.div
          className="flex-shrink-0 flex items-center px-8"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl font-bold text-primary whitespace-nowrap">قيمنا</h2>
        </motion.div>
        <motion.div
          className="flex items-stretch"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              whileHover={{ scale: 1.05 }}
              className={`flex flex-col items-center text-center px-6 ${i !== values.length - 1 ? "border-l border-gray-300 dark:border-gray-600" : ""}`}
            >
              <div
                className={`w-20 h-20 bg-secondary dark:bg-card-dark rounded-2xl flex items-center justify-center mb-4 shadow-lg transform ${v.rotate} hover:rotate-0 transition-all`}
              >
                <img src={v.icon} className="w-10 h-10" />
              </div>
              <h4 className="font-bold text-primary mb-3 text-lg">{v.title}</h4>
              <p className="text-md text-gray-600 dark:text-gray-400 leading-relaxed max-w-[180px]">
                {v.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export function ValuesSection() {
  return (
    <section className="pt-9 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/wallpaper.png')" }}
        aria-hidden
      />
      <div className="container mx-auto px-4 text-center mb-16 relative z-10">
        <h3 className="text-primary font-bold text-lg mb-2">
          روائس القمم للتقسيط
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-md mb-6">
          مؤسسة تجارية رائدة في مجال الاستثمار والتمويل الشرعي والتقسيط
        </p>
        <Link
          className="bg-primary hover:bg-[#c49b60] text-white px-8 py-2 rounded-lg text-md transition-colors shadow-md inline-block"
          href="#"
        >
          قدم طلب تقسيط
        </Link>
      </div>

      <ValuesCards />

      <InvestSection />
    </section>
  );
}
