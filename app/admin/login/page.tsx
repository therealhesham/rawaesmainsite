"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useActionState } from "react";
import { loginAdmin } from "./action";

export default function AdminLoginPage() {
    const [state, formAction, isPending] = useActionState(loginAdmin, null);

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-background-light dark:bg-background-dark">
            {/* ── Branding Panel (Right in RTL) ── */}
            <div className="relative w-full lg:w-[50%] min-h-[300px] lg:min-h-screen overflow-hidden flex items-center justify-center bg-gray-900 border-l border-gray-800">
                {/* Background */}
                <div className="absolute inset-0 bg-secondary" />
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-10"
                    style={{ backgroundImage: "url('/wp.png')" }}
                />

                {/* Decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                <motion.div
                    className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />

                {/* Content */}
                <motion.div
                    className="relative z-10 text-center px-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Logo */}
                    <motion.div
                        className="mx-auto mb-8 w-24 h-24"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <img
                            src="/logo.png"
                            alt="Rawaes Group Logo"
                            className="w-full h-full object-contain drop-shadow-2xl grayscale brightness-200"
                        />
                    </motion.div>

                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        لوحة التحكم
                    </h1>
                    <p className="text-gray-400 text-lg">
                        بوابة الإدارة المركزية لمجموعة روائس
                    </p>
                </motion.div>
            </div>

            {/* ── Login Form Panel ── */}
            <div className="w-full lg:w-[50%] flex items-center justify-center p-8 md:p-16 bg-white dark:bg-card-dark">
                <motion.div
                    className="w-full max-w-md space-y-8"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="text-center lg:text-right mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">تسجيل دخول المسؤولين</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">يرجى إدخال بيانات الدخول للمتابعة</p>
                    </div>

                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                رقم الجوال
                            </label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent transition-all outline-none dir-ltr text-right"
                                placeholder="5xxxxxxxx"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                كلمة المرور
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent transition-all outline-none dir-ltr text-right"
                                placeholder="••••••••"
                            />
                        </div>

                        {state?.error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2">
                                <span className="material-icons text-base">error_outline</span>
                                {state.error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-3.5 px-4 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>دخول</span>
                                    <span className="material-icons text-sm">arrow_back</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                        <Link href="/" className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-1 group">
                            <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            العودة للرئيسية
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
