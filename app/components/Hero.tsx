"use client";

import { motion } from "framer-motion";

const HERO_IMAGE = "/hero.jpg";

export function Hero() {
  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
      />
      <div className="absolute inset-0 bg-black/30 dark:from-black/90 dark:via-black/70" />

      <motion.div
        className="relative z-10 text-center px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
          مجموعة روائس
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
          استثمار مستدام .. ورؤية طموحة
        </p>
      </motion.div>
    </section>
  );
}

