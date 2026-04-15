"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    IdCard,
    Loader2,
    LogIn,
    MessageSquare,
    Phone,
    Smartphone,
} from "lucide-react";
import { AlertModal } from "@/app/components/AlertModal";

const OTP_LENGTH = 6;

export default function LoginPage() {
    const router = useRouter();
    const [nationalId, setNationalId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [step, setStep] = useState<"credentials" | "otp">("credentials");
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nationalId: nationalId.trim(), phoneNumber: phoneNumber.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setOtp(Array(OTP_LENGTH).fill(""));
                setStep("otp");
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            } else {
                setLoginError(data.error || "حدث خطأ");
            }
        } catch {
            setLoginError("حدث خطأ. حاول لاحقاً.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const digit = value.slice(-1);
        const next = [...otp];
        next[index] = digit;
        setOtp(next);
        if (digit && index < OTP_LENGTH - 1) {
            setTimeout(() => otpRefs.current[index + 1]?.focus(), 50);
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace") {
            if (otp[index]) {
                e.preventDefault();
                const next = [...otp];
                next[index] = "";
                setOtp(next);
            } else if (index > 0) {
                e.preventDefault();
                const next = [...otp];
                next[index - 1] = "";
                setOtp(next);
                setTimeout(() => otpRefs.current[index - 1]?.focus(), 50);
            }
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (pasted.length) {
            const next = [...otp];
            pasted.split("").forEach((d, i) => (next[i] = d));
            setOtp(next);
            otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
        }
    };

    const handleClearOtp = () => {
        setOtp(Array(OTP_LENGTH).fill(""));
        setLoginError(null);
        otpRefs.current[0]?.focus();
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length !== OTP_LENGTH) {
            setLoginError("أدخل رمز التحقق كاملاً");
            return;
        }
        setLoginError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    nationalId: nationalId.trim(),
                    phoneNumber: phoneNumber.trim(),
                    otp: code,
                }),
            });
            const data = await res.json();
            if (data.success && data.userId) {
                router.push(`/privatepage/${data.userId}`);
            } else {
                setLoginError(data.error || "رمز غير صحيح");
            }
        } catch {
            setLoginError("حدث خطأ. حاول لاحقاً.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoginError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nationalId: nationalId.trim(), phoneNumber: phoneNumber.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setOtp(Array(OTP_LENGTH).fill(""));
                setLoginError(null);
                otpRefs.current[0]?.focus();
            } else {
                setLoginError(data.error || "فشل إعادة الإرسال");
            }
        } catch {
            setLoginError("حدث خطأ. حاول لاحقاً.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-background-light dark:bg-background-dark">
            <AlertModal
                open={!!loginError}
                onClose={() => setLoginError(null)}
                title={step === "otp" ? "خطأ في التحقق" : "خطأ في تسجيل الدخول"}
                message={loginError ?? ""}
                variant="error"
            />
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

            {/* ── Login Form Panel (Left in RTL) — بدون motion لتفادي إزاحة العرض عند focus على الموبايل ── */}
            <div className="w-full lg:w-[48%] flex items-center justify-center p-6 md:p-12 lg:p-16">
                <div className="w-full max-w-md">
                    {/* Mobile logo (hidden on desktop) */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <img src="/logo.png" alt="Rawaes" className="w-16 h-16 object-contain" />
                    </div>

                    {step === "credentials" ? (
                        <div key="credentials">
                                <div className="mb-10">
                                    <h2 className="text-2xl md:text-3xl font-bold text-secondary dark:text-white mb-3">
                                        تسجيل دخول المستثمرين
                                    </h2>
                                    <p className="text-secondary/60 dark:text-gray-400 text-sm">
                                        أدخل رقم الهوية ورقم الجوال لإرسال رمز التحقق
                                    </p>
                                </div>
                                <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="national-id" className="block text-sm font-semibold text-secondary dark:text-gray-200">رقم الهوية</label>
                                            <div className="relative group">
                                                <IdCard className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-primary/60 group-focus-within:text-primary transition-colors pointer-events-none" aria-hidden />
                                                <input
                                                    id="national-id"
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={nationalId}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.replace(/\D/g, "");
                                                        const filtered = raw.replace(/^0+/, "");
                                                        setNationalId(filtered);
                                                    }}
                                                    placeholder="رقم الهوية الوطنية"
                                                    className="w-full pr-12 pl-4 py-3.5 bg-white dark:bg-card-dark border-2 border-gray-200 dark:border-gray-600 rounded-xl text-secondary dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,box-shadow] duration-300 text-sm dir-ltr text-right"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="phone-number" className="block text-sm font-semibold text-secondary dark:text-gray-200">رقم الجوال</label>
                                            <div className="relative group">
                                                <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-primary/60 group-focus-within:text-primary transition-colors pointer-events-none" aria-hidden />
                                                <input
                                                    id="phone-number"
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.replace(/\D/g, "");
                                                        const filtered = raw.replace(/^0+/, "");
                                                        setPhoneNumber(filtered);
                                                    }}
                                                    placeholder="5x xxx xxxx"
                                                    className="w-full pr-12 pl-4 py-3.5 bg-white dark:bg-card-dark border-2 border-gray-200 dark:border-gray-600 rounded-xl text-secondary dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,box-shadow] duration-300 text-sm dir-ltr text-right"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-gradient-to-l from-[#d4af79] to-[#c49b60] hover:from-[#c49b60] hover:to-[#b5905f] disabled:opacity-70 text-white font-bold text-base rounded-xl shadow-lg shadow-primary/25 transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {loading ? <Loader2 className="size-5 animate-spin shrink-0" aria-hidden /> : <><span>إرسال رمز التحقق</span><MessageSquare className="size-5 shrink-0" aria-hidden /></>}
                                    </button>
                                </form>
                        </div>
                    ) : (
                        <div key="otp">
                                <div className="mb-10">
                                    <h2 className="text-2xl md:text-3xl font-bold text-secondary dark:text-white mb-3">أدخل رمز التحقق</h2>
                                    <p className="text-secondary/60 dark:text-gray-400 text-sm">
                                        تم إرسال رمز مكوّن من 6 أرقام إلى{" "}
                                        <span dir="ltr" className="font-semibold text-primary">
                                            {phoneNumber}
                                        </span>
                                    </p>
                                </div>
                                <form onSubmit={handleOtpSubmit} className="space-y-6">
                                    <div dir="ltr" className="flex flex-row justify-center items-center gap-2 sm:gap-3" style={{ direction: "ltr" }}>
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={(el) => { otpRefs.current[i] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete={i === 0 ? "one-time-code" : "off"}
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                onPaste={handleOtpPaste}
                                                className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold bg-white dark:bg-card-dark border-2 border-gray-200 dark:border-gray-600 rounded-xl text-secondary dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-[color,background-color,border-color,box-shadow] duration-300 dir-ltr"
                                            />
                                        ))}
                                        <button type="button" onClick={handleClearOtp} title="مسح الرمز" className="flex-shrink-0 p-0.5 text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!otp.some((d) => d)}>
                                            <span className="text-md font-serif italic select-none" style={{ fontFamily: "cursive" }}>×</span>
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <button
                                            type="submit"
                                            disabled={loading || otp.join("").length !== OTP_LENGTH}
                                            className="w-full py-4 bg-gradient-to-l from-[#d4af79] to-[#c49b60] hover:from-[#c49b60] hover:to-[#b5905f] disabled:opacity-70 text-white font-bold text-base rounded-xl shadow-lg shadow-primary/25 transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {loading ? <Loader2 className="size-5 animate-spin shrink-0" aria-hidden /> : <><span>تسجيل الدخول</span><LogIn className="size-5 shrink-0" aria-hidden /></>}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                            className="text-sm text-primary hover:underline disabled:opacity-50"
                                        >
                                            إعادة إرسال الرمز
                                        </button>
                                    </div>
                                </form>
                                <button
                                    type="button"
                                    onClick={() => { setStep("credentials"); setOtp(Array(OTP_LENGTH).fill("")); setLoginError(null); }}
                                    className="mt-6 flex items-center gap-2 text-sm text-secondary/60 dark:text-gray-500 hover:text-primary transition-colors"
                                >
                                    <ArrowRight className="size-4 shrink-0" aria-hidden />
                                    <span>تغيير رقم الجوال</span>
                                </button>
                        </div>
                    )}

                    {/* Contact support card */}
                    <div className="bg-gray-50 dark:bg-[#1a2233] border border-gray-100 dark:border-gray-700 rounded-xl p-5 text-center mt-8">
                        <p className="text-secondary/60 dark:text-gray-400 text-sm mb-2">
                            تحتاج مساعدة؟ تواصل مع فريق الدعم
                        </p>
                        <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                            <Phone className="size-4 shrink-0" aria-hidden />
                            <span dir="ltr">9200 10 356</span>
                        </div>
                    </div>

                    {/* Back to home */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-secondary/50 dark:text-gray-500 hover:text-primary transition-colors group"
                        >
                            <ArrowRight className="size-4 shrink-0 group-hover:translate-x-[-4px] transition-transform" aria-hidden />
                            <span>العودة إلى الرئيسية</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
