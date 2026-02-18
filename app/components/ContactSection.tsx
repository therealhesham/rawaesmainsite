"use client";

import { motion } from "framer-motion";
import { MailCheck, MailIcon, PhoneCall, PhoneIcon } from "lucide-react";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="py-16 bg-orange-50/50 dark:bg-[#131c2e] overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold text-primary text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          تواصل معنا
        </motion.h2>
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          <motion.div
            className="w-full lg:w-1/3 order-2 lg:order-1 text-right"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-8">
              <h4 className="font-bold text-secondary dark:text-primary mb-2">
                العنوان
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                المملكة العربية السعودية
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                المدينة المنورة - الدائري الثاني - طريق الملك عبدالله
              </p>
            </div>
            <div className="mb-8">
              <h4 className="font-bold text-secondary dark:text-primary mb-2">
                أوقات العمل
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                من السبت إلى الخميس
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                من 9 صباحاً إلى 11 مساءً
              </p>
            </div>
            <div className="mb-8">
              <h4 className="font-bold text-secondary dark:text-primary mb-2">
                التواصل
              </h4>
              <a
                href="tel:920010356"
                className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-end gap-2 hover:text-primary transition-colors"
              >
                920010356 <span className=" text-xs"><PhoneIcon /></span>
              </a>
              <a
                href="mailto:info@rawaes.com"
                className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-end gap-2 hover:text-primary transition-colors"
              >
                info@rawaes.com <span className="material-icons text-xs"><MailIcon /></span>
              </a>
            </div>
          </motion.div>
          <motion.div
            className="w-full lg:w-2/3 order-1 lg:order-2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex flex-col">
                <label className="text-xs text-secondary dark:text-gray-300 font-bold mb-1">
                  الاسم الأول
                </label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-card-dark focus:ring-primary focus:border-primary text-right"
                  type="text"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-secondary dark:text-gray-300 font-bold mb-1">
                  الاسم الأخير
                </label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-card-dark focus:ring-primary focus:border-primary text-right"
                  type="text"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-secondary dark:text-gray-300 font-bold mb-1">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-card-dark focus:ring-primary focus:border-primary text-right"
                  type="email"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-secondary dark:text-gray-300 font-bold mb-1">
                  رقم الجوال
                </label>
                <input
                  className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-card-dark focus:ring-primary focus:border-primary text-right"
                  dir="rtl"
                  placeholder="05xxxxxxxx"
                  type="tel"
                />
              </div>
              <div className="md:col-span-2 flex flex-col">
                <label className="text-xs text-secondary dark:text-gray-300 font-bold mb-1">
                  الرسالة
                </label>
                <textarea
                  className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-card-dark focus:ring-primary focus:border-primary text-right"
                  rows={4}
                />
              </div>
              <div className="md:col-span-2">

              </div>
              <div className="md:col-span-2 flex justify-end mt-4">
                <motion.button
                  className="bg-primary hover:bg-[#c49b60] text-white font-bold py-2 px-12 rounded shadow transition-colors"
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  إرسال
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

