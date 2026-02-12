"use client";

import { motion } from "framer-motion";

const sectors = [
  {
    icon: "/rentcar.png",
    title: "روائس لتأجير السيارات",
    sub: "Rawaes Rent Cars",
    desc: "توفر خدمات تأجير السيارات بطريقة مبتكرة وذكية. حيث نسعى دائماً لتلبية احتياجات العملاء بمختلف الفئات والميزانيات، ونقدم خدمات موثوقة ومريحة، مع توفير خيارات التأمين الشامل ودعم الصيانة على الطريق.",
    cta: "للمزيد عن التأجير",
  },
  {
    icon: "recruitment.png",
    title: "روائس للاستقدام",
    sub: "Rawaes Recruitment",
    desc: "يعد روائس للاستقدام أحد منافذ الاستقدام المعروفة في المدينة المنورة والمملكة العربية السعودية بشكل عام. ويسعى فريق القطاع في التطوير المستمر وتحسين الاستقدام لزيادة الفعالية.",
    cta: "للمزيد عن الاستقدام",
  },
  {
    icon: "hosting.png",
    title: "روائس للضيافة",
    sub: "Rawaes Hospitality",
    desc: "تقدم مجموعة روائس خدمات ضيافة واسعة من الخدمات التي تخدم العملاء خلال تواجدهم في مناطق مختلفة، سواء كانوا في فنادق أو شقق مفروشة أو أماكن إقامة أخرى. وتهدف هذه الخدمات إلى تلبية احتياجات الضيوف.",
    cta: "للمزيد عن الضيافة",
  },
  {
    icon: "investment.png",
    title: "شركة روائس للاستثمار",
    sub: "Rawaes Investment Company",
    desc: "تقوم الشركة بتوفير خدمات شاملة تشمل إدارة العقارات والتقييم العقاري، والاستشارات العقارية وتميز شركة الاستثمار في إدارة العقارات \"المستقبل العقاري\" برؤيتها الفذة والتي تهدف إلى تحقيق أقصى قدر من القيمة لعملائها.",
    cta: "للمزيد عن الاستثمار",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function SectorsSection() {
  return (
    <section
      id="sectors"
      className="py-20 bg-gray-50 dark:bg-[#0B1120] relative"
    >
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 border-2 border-primary/20 rounded-lg"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-32 h-32 border-2 border-primary/20 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="container mx-auto px-4 relative">
        <motion.h2
          className="text-4xl font-bold text-primary text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          قطاعاتنا
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {sectors.map((s) => (
            <motion.div
              key={s.sub}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="bg-white dark:bg-card-dark rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow group border border-gray-100 dark:border-gray-700"
            >
              <div className="p-8 flex flex-col items-center border-b border-gray-100 dark:border-gray-700">
                <div className="w-32 h-32   flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors rounded-full">
                  {/* <span className="material-icons text-secondary dark:text-primary text-5xl"> */}
                  <img src={s.icon} className="max-w-full max-h-full object-contain" alt={s.title} />
                  {/* </span> */}
                </div>
                <h3 className="text-lg font-bold text-primary mb-1 text-center">{s.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider text-center">
                  {s.sub}
                </p>
                <button
                  type="button"
                  className="mt-4 bg-primary text-white text-xs py-2 px-6 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
                >
                  {s.cta}
                </button>
              </div>
              <div className="p-6 text-sm text-gray-600 dark:text-gray-300 text-justify leading-relaxed">
                {s.desc}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

