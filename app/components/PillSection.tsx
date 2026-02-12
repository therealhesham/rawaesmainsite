"use client";

import { motion } from "framer-motion";

const pills = [
  "مجموعة رائدة",
  "توسع متنوع",
  "ابتكار مستمر",
  "شراكات استراتيجية",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } as any },
};

export function PillSection() {
  return (
    <section className="bg-secondary dark:bg-card-dark py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="flex flex-wrap justify-center gap-6 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {pills.map((label) => (
            <motion.div
              key={label}
              variants={itemVariants}
              whileHover={{ scale: 1.1, rotate: 2 }}
              className="bg-primary text-secondary px-8 py-4 rounded-full font-bold text-lg shadow-lg w-full md:w-auto text-center cursor-default select-none border-2 border-transparent hover:border-secondary/20"
            >
              {label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

