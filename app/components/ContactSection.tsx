"use client";

import { motion } from "framer-motion";
import { MailIcon, PhoneIcon } from "lucide-react";
import type { ContactUsData } from "@/app/contact/getContactUs";

const DEFAULT_CONTACT = {
  sectionTitle: "تواصل معنا",
  addressLine1: "المملكة العربية السعودية",
  addressLine2: "المدينة المنورة - الدائري الثاني - طريق الملك عبدالله",
  workingDays: "من السبت إلى الخميس",
  workingHours: "من 9 صباحاً إلى 11 مساءً",
  phone: "920010356",
  email: "info@rawaes.com",
};

const inputClass =
  "w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 focus:outline-none focus:border-primary text-right";

type Props = {
  contact?: ContactUsData;
  /** في الأدمن: نفس المظهر مع حقول قابلة للتعديل (يجب أن يكون المكوّن داخل <form>) */
  editMode?: boolean;
};

export function ContactSection({ contact, editMode }: Props) {
  const c = contact ?? null;
  const title = c?.sectionTitle ?? DEFAULT_CONTACT.sectionTitle;
  const addressLine1 = c?.addressLine1 ?? DEFAULT_CONTACT.addressLine1;
  const addressLine2 = c?.addressLine2 ?? DEFAULT_CONTACT.addressLine2;
  const workingDays = c?.workingDays ?? DEFAULT_CONTACT.workingDays;
  const workingHours = c?.workingHours ?? DEFAULT_CONTACT.workingHours;
  const phone = c?.phone ?? DEFAULT_CONTACT.phone;
  const email = c?.email ?? DEFAULT_CONTACT.email;

  const Wrapper = editMode ? "div" : motion.div;
  const wrapperProps = editMode
    ? {}
    : {
        initial: { opacity: 0, x: 50 } as const,
        whileInView: { opacity: 1, x: 0 } as const,
        viewport: { once: true } as const,
        transition: { duration: 0.8, delay: 0.2 } as const,
      };

  const RightWrapper = editMode ? "div" : motion.div;
  const rightWrapperProps = editMode
    ? {}
    : {
        initial: { opacity: 0, x: -50 } as const,
        whileInView: { opacity: 1, x: 0 } as const,
        viewport: { once: true } as const,
        transition: { duration: 0.8, delay: 0.4 } as const,
      };

  return (
    <section
      id={editMode ? undefined : "contact"}
      className="py-16 bg-orange-50/50 dark:bg-[#131c2e] overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {editMode ? (
          <input
            type="text"
            name="sectionTitle"
            defaultValue={title}
            className="text-3xl font-bold text-primary text-center mb-12 block w-full bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary focus:outline-none pb-2"
          />
        ) : (
          <motion.h2
            className="text-3xl font-bold text-primary text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h2>
        )}
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          <Wrapper
            className="w-full lg:w-1/3 order-2 lg:order-1 text-right"
            {...wrapperProps}
          >
            <div className="mb-8">
              <h4 className="font-bold text-secondary dark:text-primary mb-2">
                العنوان
              </h4>
              {editMode ? (
                <>
                  <input
                    type="text"
                    name="addressLine1"
                    defaultValue={addressLine1 ?? ""}
                    className={inputClass}
                    placeholder="السطر الأول"
                  />
                  <input
                    type="text"
                    name="addressLine2"
                    defaultValue={addressLine2 ?? ""}
                    className={inputClass}
                    placeholder="السطر الثاني"
                  />
                </>
              ) : (
                <>
                  {addressLine1 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {addressLine1}
                    </p>
                  )}
                  {addressLine2 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {addressLine2}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="mb-8">
              <h4 className="font-bold text-secondary dark:text-primary mb-2">
                أوقات العمل
              </h4>
              {editMode ? (
                <>
                  <input
                    type="text"
                    name="workingDays"
                    defaultValue={workingDays ?? ""}
                    className={inputClass}
                    placeholder="أيام العمل"
                  />
                  <input
                    type="text"
                    name="workingHours"
                    defaultValue={workingHours ?? ""}
                    className={inputClass}
                    placeholder="ساعات العمل"
                  />
                </>
              ) : (
                <>
                  {workingDays && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {workingDays}
                    </p>
                  )}
                  {workingHours && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {workingHours}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="mb-8">
              <h4 className="font-bold text-secondary dark:text-primary mb-2">
                التواصل
              </h4>
              {editMode ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="phone"
                    defaultValue={phone ?? ""}
                    className={inputClass}
                    placeholder="رقم الهاتف"
                    dir="rtl"
                  />
                  <input
                    type="email"
                    name="email"
                    defaultValue={email ?? ""}
                    className={inputClass}
                    placeholder="البريد الإلكتروني"
                    dir="rtl"
                  />
                </div>
              ) : (
                <>
                  {phone && (
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-end gap-2 hover:text-primary transition-colors"
                    >
                      {phone} <span className="text-xs"><PhoneIcon /></span>
                    </a>
                  )}
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-end gap-2 hover:text-primary transition-colors"
                    >
                      {email} <span className="text-xs"><MailIcon /></span>
                    </a>
                  )}
                </>
              )}
            </div>
          </Wrapper>
          <RightWrapper
            className="w-full lg:w-2/3 order-1 lg:order-2"
            {...rightWrapperProps}
          >
            {editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
                <div className="flex flex-col">
                  <span className="text-xs text-secondary dark:text-gray-300 font-bold mb-1">الاسم الأول</span>
                  <div className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white/50 dark:bg-card-dark/50 text-right text-sm text-gray-500">—</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-secondary dark:text-gray-300 font-bold mb-1">الاسم الأخير</span>
                  <div className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white/50 dark:bg-card-dark/50 text-right text-sm text-gray-500">—</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-secondary dark:text-gray-300 font-bold mb-1">البريد الإلكتروني</span>
                  <div className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white/50 dark:bg-card-dark/50 text-right text-sm text-gray-500">—</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-secondary dark:text-gray-300 font-bold mb-1">رقم الجوال</span>
                  <div className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white/50 dark:bg-card-dark/50 text-right text-sm text-gray-500">—</div>
                </div>
                <div className="md:col-span-2 flex flex-col">
                  <span className="text-xs text-secondary dark:text-gray-300 font-bold mb-1">الرسالة</span>
                  <div className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white/50 dark:bg-card-dark/50 text-right text-sm text-gray-500 min-h-[100px]">—</div>
                </div>
                <div className="md:col-span-2 flex justify-end mt-4">
                  <span className="bg-gray-300 dark:bg-gray-600 text-white font-bold py-2 px-12 rounded cursor-not-allowed">
                    إرسال (نموذج الزوار في الموقع فقط)
                  </span>
                </div>
              </div>
            ) : (
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
                <div className="md:col-span-2" />
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
            )}
          </RightWrapper>
        </div>
      </div>
    </section>
  );
}

