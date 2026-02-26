"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithNationalIdAndPhone } from "./actions";

export default function LoginPage() {
    const router = useRouter();
    const [nationalId, setNationalId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await loginWithNationalIdAndPhone(nationalId, phoneNumber);
        if (result.success && result.userId) {
            router.push(`/privatepage/${result.userId}`);
        } else {
            alert(result.error || "خطأ في تسجيل الدخول");
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-background-light dark:bg-background-dark">
            {/* ── Branding Panel (Right in RTL) ── */}
            <div className="relative w-full lg:w-[52%] min-h-[280px] lg:min-h-screen overflow-hidden flex items-center justify-center">
                {/* Background */}
                <div className="absolute inset-0 bg-secondary" />
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: "url('/wp.png')" }}
                />

                {/* Decorative geometric shapes */}
                <motion.div
                    className="absolute top-20 left-16 w-48 h-48 border-2 border-primary/20 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute bottom-32 right-20 w-32 h-32 border border-primary/15 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute top-1/3 right-12 w-3 h-3 bg-primary/40 rounded-full"
                    animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-1/4 left-24 w-2 h-2 bg-primary/30 rounded-full"
                    animate={{ y: [0, 15, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-transparent to-secondary/80" />
                <div className="absolute inset-0 bg-gradient-to-l from-primary/5 to-transparent" />

                {/* Content */}
                <motion.div
                    className="relative z-10 text-center px-8 max-w-lg"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {/* Logo */}
                    <motion.div
                        className="mx-auto mb-8 w-24 h-24"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
                    >
                        <img
                            src="/logo.png"
                            alt="Rawaes Group Logo"
                            className="w-full h-full object-contain drop-shadow-2xl"
                        />
                    </motion.div>

                    {/* Gold accent line */}
                    <motion.div
                        className="w-16 h-[2px] bg-primary mx-auto mb-6"
                        initial={{ width: 0 }}
                        animate={{ width: 64 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    />

                    <motion.h1
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        مجموعة{" "}
                        <span className="text-primary">روائس</span>
                    </motion.h1>

                    <motion.p
                        className="text-gray-300 text-base md:text-lg leading-relaxed mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.65 }}
                    >
                        بوابتك لاستعراض استثماراتك ومتابعة تقاريرك المالية
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        className="flex items-center justify-center gap-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">+500</div>
                            <div className="text-xs text-gray-400 mt-1">مستثمر</div>
                        </div>
                        <div className="w-px h-10 bg-primary/30" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">4</div>
                            <div className="text-xs text-gray-400 mt-1">قطاعات</div>
                        </div>
                        <div className="w-px h-10 bg-primary/30" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">+15</div>
                            <div className="text-xs text-gray-400 mt-1">سنة خبرة</div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Bottom wave for mobile */}
                <div className="absolute bottom-0 left-0 right-0 lg:hidden">
                    <svg viewBox="0 0 1440 60" fill="none" className="w-full">
                        <path
                            d="M0 60V30C360 0 720 0 1080 30C1260 45 1440 60 1440 60H0Z"
                            className="fill-background-light dark:fill-background-dark"
                        />
                    </svg>
                </div>
            </div>

            {/* ── Login Form Panel (Left in RTL) ── */}
            <div className="w-full lg:w-[48%] flex items-center justify-center p-6 md:p-12 lg:p-16">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                >
                    {/* Mobile logo (hidden on desktop) */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <img src="/logo.png" alt="Rawaes" className="w-16 h-16 object-contain" />
                    </div>

                    {/* Form header */}
                    <motion.div
                        className="mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-secondary dark:text-white mb-3">
                            تسجيل دخول المستثمرين
                        </h2>
                        <p className="text-secondary/60 dark:text-gray-400 text-sm">
                            أدخل رقم الهوية ورقم الجوال للوصول إلى صفحتك الاستثمارية
                        </p>
                    </motion.div>

                    {/* Form */}
                    <motion.form
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        onSubmit={handleSubmit}
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="national-id"
                                    className="block text-sm font-semibold text-secondary dark:text-gray-200"
                                >
                                    رقم الهوية
                                </label>
                                <div className="relative group">
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-icons text-xl text-primary/60 group-focus-within:text-primary transition-colors">
                                        badge
                                    </span>
                                    <input
                                        id="national-id"
                                        type="text"
                                        inputMode="numeric"
                                        value={nationalId}
                                        onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                                        placeholder="رقم الهوية الوطنية"
                                        className="w-full pr-12 pl-4 py-3.5 bg-white dark:bg-card-dark border-2 border-gray-200 dark:border-gray-600 rounded-xl text-secondary dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-sm dir-ltr text-right"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="phone-number"
                                    className="block text-sm font-semibold text-secondary dark:text-gray-200"
                                >
                                    رقم الجوال
                                </label>
                                <div className="relative group">
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-icons text-xl text-primary/60 group-focus-within:text-primary transition-colors">
                                        phone_iphone
                                    </span>
                                    <input
                                        id="phone-number"
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="5x xxx xxxx"
                                        className="w-full pr-12 pl-4 py-3.5 bg-white dark:bg-card-dark border-2 border-gray-200 dark:border-gray-600 rounded-xl text-secondary dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-sm dir-ltr text-right"
                                    />
                                </div>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-gradient-to-l from-[#d4af79] to-[#c49b60] hover:from-[#c49b60] hover:to-[#b5905f] text-white font-bold text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span>تسجيل الدخول</span>
                            <span className="material-icons text-lg">login</span>
                        </motion.button>
                    </motion.form>

                    {/* Divider */}
                    <motion.div
                        className="my-8 flex items-center gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <span className="text-xs text-gray-400 dark:text-gray-500">أو</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </motion.div>

                    {/* Contact support card */}
                    <motion.div
                        className="bg-gray-50 dark:bg-[#1a2233] border border-gray-100 dark:border-gray-700 rounded-xl p-5 text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        <p className="text-secondary/60 dark:text-gray-400 text-sm mb-2">
                            تحتاج مساعدة؟ تواصل مع فريق الدعم
                        </p>
                        <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                            <span className="material-icons text-base">phone</span>
                            <span dir="ltr">9200 10 356</span>
                        </div>
                    </motion.div>

                    {/* Back to home */}
                    <motion.div
                        className="mt-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-secondary/50 dark:text-gray-500 hover:text-primary transition-colors group"
                        >
                            <span className="material-icons text-base group-hover:translate-x-[-4px] transition-transform">
                                arrow_forward
                            </span>
                            <span>العودة إلى الرئيسية</span>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
