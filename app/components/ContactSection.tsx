"use client";

import { motion } from "framer-motion";

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
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-end gap-2">
                9200 10 356 <span className="material-icons text-xs">phone</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-end gap-2">
                info@rawaes.com{" "}
                <span className="material-icons text-xs">email</span>
              </p>
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
                <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded w-fit flex items-center gap-3">
                  <input
                    className="w-5 h-5 text-primary rounded border-gray-400 focus:ring-primary"
                    type="checkbox"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    أنا لست برنامج روبوت
                  </span>
                  <img
                    alt="captcha"
                    className="w-8 h-8 opacity-50 ml-2"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSk5ySX8AKRpA99jtCeG92deGGpmSncumsQh9Fc9EvgHGHOBUYUOWZwHleVmHKIoWR31exKGEGBkd1bGMMQOX0lw1EhregzSrUc8VBcj3br56pa7Flb6GIkKP6SSpXrw9Dgm82YRyj8l3d9_-ULeHF-IC_GY-x_Zp9MbE9Sa2uidvbkpO0na_xB0q7zTVsKDj1s8woUs58tnEfC43b10FZcpjXmp2iK7TktYwy_F1ybOrDYEcXdHEn9MFxG-f7TN46u2opTnfn81s"
                  />
                </div>
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

