"use client";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BannerHeroSection } from "../components/BannerHeroSection";

// Metadata cannot be exported from a client component. We need to remove it or move it to a layout/page wrapper.
// Assuming this is a page that needs metadata, we should keep it server-side if posisble, but for framer-motion unique page animations we often need "use client".
// However, next.js app router allows "use client" at the top of the file, but metadata export is not supported in client components.
// I will remove the metadata export for now to fix the build error that would occur, or better yet, since I'm editing the file I see it's likely a page.tsx.
// If I make it "use client", I must remove `export const metadata`. The user asked for framer motion here.
// I'll comment out metadata and add "use client" at the top.

const LOGO_LARGE = "/hosting.png"

const HOTELS = [
  {
    name: "فندق شمس",
    image: "shamsb.avif",
    logo: "/shams.svg",
    link: "https://maps.app.goo.gl/C8KMv5VuHeiP3Ayi8"
  },
  {
    name: "فندق ريست إن",
    image: "restinnB.avif",
    logo: "restinn.svg",
    link: "https://maps.app.goo.gl/wui14yJ3GvQtvZ3w5"

  },
  {
    name: "فندق ريسان",
    image: "resanB.avif",
    logo: "resan.svg",
    link: "https://maps.app.goo.gl/RaxQ3JvMrcTbosfy8"
  },
  {
    name: "فندق روائس",
    image: "rawaesinnB.avif",
    logo: "rawaes.svg",
    link: "https://www.google.com/maps/place/%D9%81%D9%86%D8%AF%D9%82+%D8%B1%D9%88%D8%A7%D8%A6%D8%B3%E2%80%AD/@24.4761059,39.6549396,17z/data=!3m1!4b1!4m9!3m8!1s0x15bd9550185efdbf:0xd3a335ecdd2f5a6b!5m2!4m1!1i2!8m2!3d24.4761059!4d39.6575145!16s%2Fg%2F11nnvj9kzl?q=%D9%81%D9%86%D8%AF%D9%82+%D8%B1%D9%88%D8%A7%D8%A6%D8%B3&rlz=1C1KNTJ_enSA1079SA1079&gs_lcrp=EgZjaHJvbWUqDggAECMYExgnGIAEGIoFMg4IABAjGBMYJxiABBiKBTIGCAEQRRhAMgYIAhBFGDkyBwgDEAAYgAQyCAgEEAAYFhgeMgYIBRBFGDwyBggGEEUYPDIGCAcQRRg8qAIAsAIA&um=1&ie=UTF-8&entry=tts"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const BUILDING_IMAGE = "/hotels-contact.avif"

const GOOGLE_MAPS_LOGO = "/googlemap.svg"

export default function RawaesHotelsPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-[#0a1114] text-slate-800 dark:text-slate-100 transition-colors duration-300 font-[family-name:var(--font-cairo)] scroll-smooth">
      <Header />

      <main>
        <BannerHeroSection
          bannerSrc="/wallpaper.png"
          bannerAlt="Rawaes Wallpaper"
          logoSrc={LOGO_LARGE}
          logoAlt="روائس للضيافة"
          title="روائس للضيافة"
          description="إن الضيافة من الخدمات التي تعتني بها المجموعة وتتطور من خلالها وتبني مجموعة روائس هيكلة داخلية متقنة التسلسل لتيسير العمل على راحة النزلاء وتضم المجموعة فنادق معروفة مثل: فندق ريست إن، فندق شمس، فندق روائس، فندق ريسان."
          id="home"
        />


        {/* Hotels */}
        <motion.section
          className="py-20 bg-slate-50 dark:bg-slate-900/50"
          id="hotels"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#c5a065] mb-4">فنادقنا</h2>
              <div className="w-24 h-1 bg-[#c5a065] mx-auto rounded-full" />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {HOTELS.map((hotel) => (
                <motion.div
                  key={hotel.name}
                  variants={itemVariants}
                  className="group relative min-h-[380px] rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    alt={hotel.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={hotel.image}
                    width={400}
                    height={380}
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                  <div className="relative flex flex-col items-center justify-between min-h-[380px] p-6 text-center">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="rounded-2xl p-4 flex items-center justify-center">
                        <Image
                          alt={`${hotel.name} - لوجو`}
                          className="w-32 h-32 object-contain"
                          src={hotel.logo}
                          width={128}
                          height={128}
                        />
                      </div>
                    </div>
                    <div className="w-full">
                      <a
                        href={hotel.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-[#c5a065] text-white font-bold rounded-xl shadow-lg shadow-[#c5a065]/30 hover:shadow-[#c5a065]/50 transition-all transform hover:-translate-y-1 block text-center"
                      >
                        {hotel.name}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Partners */}
        <motion.section
          className="py-20 relative overflow-hidden"
          id="partners"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div variants={itemVariants} className="lg:w-1/2 order-2 lg:order-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                    <Image
                      alt="Google Maps"
                      className="h-16 w-auto"
                      src={GOOGLE_MAPS_LOGO}
                      width={64}
                      height={64}
                    />
                  </div>
                  <div className="bg-[#1b4394] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center text-white">
                    <span className="text-xl font-bold italic">priceline</span>
                    <div className="flex gap-1 mt-2">
                      <span className="material-symbols-outlined text-xs">
                        hotel
                      </span>
                      <span className="material-symbols-outlined text-xs">
                        flight
                      </span>
                      <span className="material-symbols-outlined text-xs">
                        directions_car
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#003580] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white">
                    <span className="text-xl font-bold">Booking.com</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                    <div className="flex flex-col items-center text-blue-900 dark:text-blue-400">
                      <span className="material-symbols-outlined text-4xl">
                        bed
                      </span>
                      <span className="font-bold text-xs">Bluepillow</span>
                    </div>
                  </div>
                  <div className="bg-sky-500 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white">
                    <img src="logoblue.avif" />
                  </div>

                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="lg:w-1/2 order-1 lg:order-2 text-center lg:text-right">
                <h2 className="text-3xl lg:text-5xl font-bold text-[#003d4c] dark:text-[#c5a065] mb-6">
                  نهتم بكم ونتمنى أن نحظى بفرصة زيارتكم.
                </h2>
                <p className="text-xl text-[#c5a065] font-semibold mb-4">
                  نقدم لكم خدمة الحجز عبر المنصات التالية
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  سهولة الوصول إلينا عبر شركاء النجاح العالميين لضمان أفضل تجربة
                  حجز ممكنة لنزلائنا الكرام من جميع أنحاء العالم.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          className=""
          id="contact"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 relative h-96 lg:h-auto overflow-hidden">
                  <Image
                    alt="Building Architecture"
                    className="absolute inset-0 w-full h-full object-cover"
                    src={BUILDING_IMAGE}
                    width={800}
                    height={400}
                  />
                  <div className="absolute inset-0 bg-[#c5a065]/20 mix-blend-multiply" />
                  <div className="absolute inset-0 flex flex-col justify-end p-12 text-white bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-2xl font-bold mb-2">المدينة المنورة</h3>
                    <p className="mb-4 opacity-90">
                      طريق الملك عبدالله الفرعي - قبل دوار طابة
                    </p>
                    <div className="flex flex-col gap-2">
                      <a
                        className="flex items-center gap-2 hover:text-[#c5a065] transition-colors"
                        href="mailto:h@rawaes.com"
                      >
                        <span className="material-symbols-outlined text-sm">
                          mail
                        </span>
                        h@rawaes.com
                      </a>
                      <a
                        className="flex items-center gap-2 hover:text-[#c5a065] transition-colors"
                        dir="ltr"
                        href="tel:0566576591"
                      >
                        <span className="material-symbols-outlined text-sm">
                          call
                        </span>
                        0566576591
                      </a>
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 p-8 lg:p-16">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[#c5a065] mb-2">
                      تواصل مع ادارة فنادق روائس
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                      نحن هنا للإجابة على جميع استفساراتكم
                    </p>
                  </div>
                  <form className="space-y-6" action="#">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                          الاسم الأول *
                        </label>
                        <input
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#c5a065] text-slate-900 dark:text-white px-4 py-3"
                          required
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                          الاسم الأخير
                        </label>
                        <input
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#c5a065] text-slate-900 dark:text-white px-4 py-3"
                          type="text"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                        رقم التواصل *
                      </label>
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#c5a065] text-slate-900 dark:text-white placeholder:text-slate-400 px-4 py-3"
                        dir="ltr"
                        placeholder="05xxxxxxxx"
                        required
                        type="tel"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                        البريد الإلكتروني
                      </label>
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#c5a065] text-slate-900 dark:text-white px-4 py-3"
                        type="email"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                          اختر سبب التواصل *
                        </label>
                        <select
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#c5a065] text-slate-900 dark:text-white px-4 py-3"
                          required
                        >
                          <option value="">اختر...</option>
                          <option>حجز جديد</option>
                          <option>استفسار عن خدمات</option>
                          <option>شكوى أو اقتراح</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                          اختر الفندق *
                        </label>
                        <select
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#c5a065] text-slate-900 dark:text-white px-4 py-3"
                          required
                        >
                          <option value="">اختر الفندق...</option>
                          <option>فندق شمس</option>
                          <option>فندق ريست إن</option>
                          <option>فندق ريسان</option>
                          <option>فندق روائس</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                        الرسالة
                      </label>
                      <textarea
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#c5a065] text-slate-900 dark:text-white px-4 py-3"
                        rows={4}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex gap-4">
                        <a
                          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-[#c5a065] hover:text-white transition-all"
                          href="#"
                          aria-label="Twitter"
                        >
                          <svg
                            className="w-5 h-5 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                        </a>
                        <a
                          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-[#c5a065] hover:text-white transition-all"
                          href="#"
                          aria-label="Instagram"
                        >
                          <svg
                            className="w-5 h-5 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      </div>
                      <button
                        className="px-10 py-3 bg-[#c5a065] text-white font-bold rounded-xl shadow-lg shadow-[#c5a065]/30 hover:shadow-[#c5a065]/50 transition-all transform hover:scale-105"
                        type="submit"
                      >
                        إرسال
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
