"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { switchToAdminFromInvestor } from "@/app/login/actions";
import { AlertModal } from "@/app/components/AlertModal";

export function Footer() {
    const [adminError, setAdminError] = useState<string | null>(null);
    const [adminLoading, setAdminLoading] = useState(false);

    const handleAdminGateway = async () => {
        setAdminError(null);
        setAdminLoading(true);
        try {
            await switchToAdminFromInvestor();
        } catch {
            setAdminError("حدث خطأ. حاول لاحقاً.");
        } finally {
            setAdminLoading(false);
        }
    };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const linkVariants = {
    hover: {
      scale: 1.05,
      x: -5,
      transition: { duration: 0.2 }
    }
  };

  return (
    <footer className="bg-secondary text-white border-t-8 border-primary dark:border-primary/80 overflow-hidden relative">
      <AlertModal
        open={!!adminError}
        onClose={() => setAdminError(null)}
        title="بوابة الأدمن"
        message={adminError ?? ""}
        variant="error"
      />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start">
          {/* Logo Section */}
          <motion.div
            className="w-full md:w-auto flex flex-col items-start text-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 flex items-center justify-center">
                <motion.img
                  src="/transperantlogo.svg"
                  alt="Rawaes Group Logo"
                  className="w-full h-full object-contain drop-shadow-sm"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-2xl">مجموعة روائس</h3>
                <p className="text-primary text-lg font-bold dir-ltr">
                  920010356
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              شركة استثمارية متخصصة في توفير حلول الاستثمار المبتكرة والمستدامة
              لمستثمرينا الكرام. يقع مقرنا في المملكة العربية السعودية، منطقة
              المدينة المنورة ونتميز بفريق من الخبراء ذوي الخبرة في مجالات تجارية
              مختلفة.
            </p>
          </motion.div>

          {/* Links Section */}
          <motion.div
            className="w-full md:w-auto"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <ul className="space-y-2 text-right">
              {[
                { href: "/", text: "انتقل الى الصفحات الرئيسية" },
                { href: "https://rent.rawaes.com", text: "قطاع روائس لتأجير السيارات", target: "_blank" },
                { href: "https://rec.rawaes.com", text: "قطاع روائس للاستقدام", target: "_blank" },
                { href: "/rawaeshotels", text: "قطاع روائس للضيافة" },
                { href: "#", text: "شركة روائس للاستثمار" },
                { href: "#", text: "التوظيف" },
              ].map((link, index) => (
                <motion.li key={index} variants={linkVariants} whileHover="hover">
                  <Link
                    className="text-primary hover:text-white transition-colors text-sm font-bold underline decoration-primary underline-offset-4"
                    href={link.href}
                    target={link.target}
                  >
                    {link.text}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>

      {/* Footer Bottom */}
      <motion.div
        className="bg-primary py-3 text-center relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-secondary text-xs font-bold">
          جميع الحقوق محفوظة لدى مجموعة روائس
        </p>
        {/* بوابة مخفية: زر دخول الأدمن للمستثمرين الذين isAdmin: true */}
        <button
          type="button"
          onClick={handleAdminGateway}
          disabled={adminLoading}
          title="بوابة الأدمن"
          className="absolute left-2 bottom-1/2 translate-y-1/2 w-1 h-4 opacity-20 hover:opacity-40 transition-opacity cursor-pointer bg-secondary rounded disabled:opacity-50 disabled:cursor-not-allowed"
          aria-hidden
        />
      </motion.div>
    </footer>
  );
}
