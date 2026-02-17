"use client";

import Link from "next/link";
import { LogoSvg } from "./logosvg";
import { motion } from "framer-motion";
import { MotionSection } from "./MotionSection";

export function AboutSection() {
  return (
    <section
      id="about"
      className="py-20 bg-background-light dark:bg-background-dark relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 hidden md:block" />
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 justify-center ">
        <motion.div
          className="w-1/3"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <LogoSvg />
        </motion.div>
        <MotionSection className="w-full md:w-2/3 text-center md:text-right" delay={0.2}>
          <h2 className="text-4xl font-bold text-primary mb-6 relative inline-block">
            من نحن
            <motion.span
              className="absolute bottom-0 left-0 w-full h-1 bg-primary/30 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </h2>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-loose mb-8 max-w-3xl">
            نحن شركة استثمارية متخصصة في توفير حلول الاستثمار المبتكرة والمستدامة
            لمستثمرينا الكرام. يقع مقرنا في المملكة العربية السعودية، منطقة
            المدينة المنورة، ونتميز بفريق من الخبراء ذوي الخبرة في مجالات تجارية
            مختلفة.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
            <motion.a
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center transition-colors"
              href="https://x.com/rawaes"
              aria-label="X"
            >
              <span className="font-bold">X</span>
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1, rotate: -10 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center transition-colors"
              href="https://instagram.com/rawaes_group"
              aria-label="Instagram"
            >
              <span className="material-icons">camera_alt</span>
            </motion.a>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              className="inline-block bg-gradient-to-r from-primary to-[#c49b60] text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all"
              href="#"
            >
              تعرف علينا أكثر
            </Link>
          </motion.div>
        </MotionSection>
      </div>
    </section>
  );
}

